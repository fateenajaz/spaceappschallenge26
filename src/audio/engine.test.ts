import { describe, it, expect, vi } from "vitest";
import { AudioEngine, type EngineDependencies } from "./engine";
import { domain, records } from "../data/climate-loader";
function harness() {
  const voices: {
    stop: ReturnType<typeof vi.fn>;
    disconnect: ReturnType<typeof vi.fn>;
    frequency: { value: number };
    onended: unknown;
    start: ReturnType<typeof vi.fn>;
  }[] = [];
  let frame: FrameRequestCallback | undefined;
  const param = () => ({
    value: 0,
    setValueAtTime: vi.fn(),
    linearRampToValueAtTime: vi.fn(),
    setTargetAtTime: vi.fn(),
  });
  const ctx = {
    currentTime: 0,
    state: "running",
    destination: {},
    resume: vi.fn(async () => {}),
    close: vi.fn(async () => {}),
    createAnalyser: vi.fn(() => ({
      fftSize: 1024,
      smoothingTimeConstant: 0,
      connect: vi.fn(),
      disconnect: vi.fn(),
      getFloatTimeDomainData: vi.fn((target: Float32Array) =>
        target.fill(0.05),
      ),
    })),
    createGain: vi.fn(() => ({
      gain: param(),
      connect: vi.fn(),
      disconnect: vi.fn(),
    })),
    createOscillator: vi.fn(() => {
      const voice = {
        frequency: { value: 0 },
        type: "sine",
        connect: vi.fn(),
        disconnect: vi.fn(),
        start: vi.fn(),
        stop: vi.fn(),
        onended: null,
      };
      voices.push(voice);
      return voice;
    }),
  };
  const deps: EngineDependencies = {
    context: () => ctx as unknown as AudioContext,
    requestFrame: (fn) => {
      frame = fn;
      return 1;
    },
    cancelFrame: () => {
      frame = undefined;
    },
  };
  const engine = new AudioEngine(domain, deps);
  function advance(time: number) {
    ctx.currentTime = time;
    const fn = frame;
    frame = undefined;
    fn?.(time * 1000);
  }
  return { engine, ctx, voices, advance };
}
describe("single-owner audio engine", () => {
  it("starts from a gesture, advances with the audio clock and completes", async () => {
    const h = harness();
    await h.engine.play(records.slice(0, 3), "A");
    expect(h.engine.getSnapshot().state).toBe("playing");
    expect(h.voices[0].start).toHaveBeenCalled();
    h.advance(0.34);
    expect(h.engine.getSnapshot().index).toBe(1);
    h.advance(1);
    expect(h.engine.getSnapshot()).toMatchObject({
      state: "completed",
      index: 2,
      progress: 1,
    });
  });
  it("pauses, resumes fractional position, changes speed and stops cleanly", async () => {
    const h = harness();
    await h.engine.play(records.slice(0, 5), "A");
    h.advance(0.46);
    h.engine.pause();
    const p = h.engine.getSnapshot().progress;
    expect(p).toBeGreaterThan(0);
    expect(h.engine.getSnapshot().state).toBe("paused");
    await h.engine.resume();
    expect(h.engine.getSnapshot().progress).toBe(p);
    expect(h.engine.getSnapshot().index).toBe(1);
    h.engine.setSpeed(2);
    expect(h.engine.getSnapshot().speed).toBe(2);
    expect(h.engine.getSnapshot().progress).toBe(p);
    h.engine.stop();
    expect(h.engine.getSnapshot()).toMatchObject({
      state: "stopped",
      progress: 0,
      index: 0,
    });
    expect(h.voices.every((v) => v.disconnect.mock.calls.length > 0)).toBe(
      true,
    );
  });
  it("repeated Play and A/B switching cancel old voices; replay returns to first record", async () => {
    const h = harness();
    await h.engine.play(records, "A");
    const first = h.voices[0];
    await h.engine.play(records.slice(20, 50), "B");
    expect(first.stop).toHaveBeenCalled();
    expect(first.disconnect).toHaveBeenCalled();
    h.advance(0.8);
    await h.engine.replay();
    expect(h.engine.getSnapshot()).toMatchObject({
      sequenceId: "B",
      index: 0,
      progress: 0,
    });
    h.engine.dispose();
    expect(h.ctx.close).toHaveBeenCalled();
    expect(h.engine.getSnapshot().state).toBe("idle");
  });
  it("invalidates async startup on Stop and reports errors without uncaught rejection", async () => {
    const h = harness();
    let resolve!: () => void;
    h.ctx.resume.mockImplementation(
      () =>
        new Promise<void>((r) => {
          resolve = r;
        }),
    );
    const pending = h.engine.play(records, "A");
    h.engine.stop();
    resolve();
    await pending;
    expect(h.engine.getSnapshot().state).toBe("stopped");
    expect(h.voices).toHaveLength(0);
    await h.engine.play([{ year: 2000, anomalyC: 999 }], "bad");
    expect(h.engine.getSnapshot().state).toBe("error");
    expect(h.engine.getSnapshot().error).toMatch(/outside/);
  });
  it("monitors audible samples only during playback and releases the monitor", async () => {
    const h = harness();
    const samples = new Float32Array(1024);
    h.engine.readSignal(samples);
    expect(samples.every((v) => v === 0)).toBe(true);
    await h.engine.play(records, "A");
    h.engine.readSignal(samples);
    expect(samples[0]).toBeCloseTo(0.05);
    h.engine.mute();
    h.engine.readSignal(samples);
    expect(samples.every((v) => v === 0)).toBe(true);
    h.engine.mute();
    h.engine.pause();
    h.engine.readSignal(samples);
    expect(samples.every((v) => v === 0)).toBe(true);
    const monitor = h.ctx.createAnalyser.mock.results[0].value;
    h.engine.dispose();
    expect(monitor.disconnect).toHaveBeenCalled();
  });
  it("seeks and updates volume/mute without changing pitch", async () => {
    const h = harness();
    await h.engine.play(records, "A");
    h.engine.pause();
    h.engine.seek(20);
    expect(h.engine.getSnapshot().index).toBe(20);
    h.engine.setVolume(0.2);
    h.engine.mute();
    expect(h.engine.getSnapshot()).toMatchObject({ volume: 0.2, muted: true });
    expect(() => h.engine.setSpeed(3)).toThrow();
    expect(() => h.engine.setVolume(-1)).toThrow();
  });
});

describe("explicit monthly sequence options", () => {
  it("preserves monthly mapping and timing on resume/replay/seek, then restores annual defaults", async () => {
    const h = harness();
    const monthlyDomain = { min: -0.81, max: 1.48 };
    const monthlyRecords = [
      { year: 2023, anomalyC: 1.48 },
      { year: 2024, anomalyC: 1.16 },
    ];
    await h.engine.play(monthlyRecords, "monthly", 0, {
      domain: monthlyDomain,
      eventSeconds: 1.2,
    });
    expect(h.voices[0].frequency.value).toBe(660);
    h.advance(0.7);
    expect(h.engine.getSnapshot().index).toBe(0);
    h.engine.pause();
    await h.engine.resume();
    expect(h.engine.getSnapshot().state).toBe("playing");
    h.engine.pause();
    h.engine.seek(1);
    expect(h.engine.getSnapshot().frequency).toBeCloseTo(
      220 * 3 ** ((1.16 + 0.81) / (1.48 + 0.81)),
    );
    await h.engine.replay();
    expect(h.engine.getSnapshot().frequency).toBe(660);
    await h.engine.play(records, "annual");
    h.advance(h.ctx.currentTime + 0.34);
    expect(h.engine.getSnapshot().index).toBe(1);
  });
});
