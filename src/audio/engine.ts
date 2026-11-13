import type { ClimateRecord } from "../types/climate";
import { frequency, type Domain } from "./mappings";
export type PlaybackState =
  "idle" | "loading" | "playing" | "paused" | "stopped" | "completed" | "error";
export type PlaybackSnapshot = {
  state: PlaybackState;
  sequenceId: string;
  index: number;
  progress: number;
  frequency: number | null;
  error: string | null;
  speed: number;
  volume: number;
  muted: boolean;
};
type Voice = { osc: OscillatorNode; gain: GainNode };
export type EngineDependencies = {
  context: () => AudioContext;
  requestFrame: (fn: FrameRequestCallback) => number;
  cancelFrame: (id: number) => void;
};
const defaults: EngineDependencies = {
  context: () => {
    const Ctor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!Ctor)
      throw new Error(
        "This browser does not support Web Audio. Try a recent Chrome, Safari, Firefox or Edge browser.",
      );
    return new Ctor();
  },
  requestFrame: (fn) => requestAnimationFrame(fn),
  cancelFrame: (id) => cancelAnimationFrame(id),
};
/** A single-owner audio graph. Logical progress and rendered record use the audio clock. */
export class AudioEngine {
  private ctx?: AudioContext;
  private master?: GainNode;
  private analyser?: AnalyserNode;
  private voices = new Set<Voice>();
  private listeners = new Set<() => void>();
  private frame = 0;
  private generation = 0;
  private sequence: ClimateRecord[] = [];
  private anchor = 0;
  private startPosition = 0;
  private position = 0;
  private scheduled = 0;
  private eventSeconds = 0.3;
  private sequenceDomain: Domain;
  private snapshot: PlaybackSnapshot = {
    state: "idle",
    sequenceId: "",
    index: 0,
    progress: 0,
    frequency: null,
    error: null,
    speed: 1,
    volume: 0.45,
    muted: false,
  };
  constructor(
    private domain: Domain,
    private deps: EngineDependencies = defaults,
  ) {
    this.sequenceDomain = domain;
  }
  getSnapshot = () => this.snapshot;
  subscribe = (fn: () => void) => {
    this.listeners.add(fn);
    return () => {
      this.listeners.delete(fn);
    };
  };
  private update(patch: Partial<PlaybackSnapshot>) {
    this.snapshot = { ...this.snapshot, ...patch };
    this.listeners.forEach((fn) => fn());
  }
  private duration() {
    return this.eventSeconds / this.snapshot.speed;
  }
  private logicalPosition() {
    if (this.snapshot.state !== "playing" || !this.ctx) return this.position;
    return Math.min(
      this.sequence.length,
      this.startPosition +
        Math.max(0, this.ctx.currentTime - this.anchor) / this.duration(),
    );
  }
  private cancelAudio() {
    this.deps.cancelFrame(this.frame);
    for (const v of this.voices) {
      v.osc.onended = null;
      try {
        v.osc.stop();
      } catch {
        /* A finished oscillator is already stopped. */
      }
      v.osc.disconnect();
      v.gain.disconnect();
    }
    this.voices.clear();
  }
  private fail(error: unknown) {
    this.cancelAudio();
    this.update({
      state: "error",
      error:
        error instanceof Error
          ? error.message
          : "Audio could not start. Please try again.",
    });
  }
  async play(
    records: ClimateRecord[],
    sequenceId: string,
    index = 0,
    options: { domain?: Domain; eventSeconds?: number } = {},
  ) {
    const generation = ++this.generation;
    this.cancelAudio();
    this.sequence = records;
    this.position = Math.max(0, Math.min(index, records.length - 0.000001));
    this.update({
      state: "loading",
      sequenceId,
      index: Math.floor(this.position),
      progress: records.length ? this.position / records.length : 0,
      error: null,
    });
    try {
      this.eventSeconds = options.eventSeconds ?? 0.3;
      this.sequenceDomain = options.domain ?? this.domain;
      if (
        !Number.isFinite(this.eventSeconds) ||
        this.eventSeconds < 0.15 ||
        this.eventSeconds > 3
      )
        throw new Error("Unsupported note duration");
      if (!records.length)
        throw new Error("No observations available for playback");
      records.forEach((r) => frequency(r.anomalyC, this.sequenceDomain));
      if (!this.ctx || this.ctx.state === "closed") {
        this.ctx = this.deps.context();
        this.master = this.ctx.createGain();
        this.analyser = this.ctx.createAnalyser();
        this.analyser.fftSize = 1024;
        this.analyser.smoothingTimeConstant = 0;
        this.master.connect(this.analyser);
        this.analyser.connect(this.ctx.destination);
        this.master.gain.value = this.snapshot.muted ? 0 : this.snapshot.volume;
      }
      await this.ctx.resume();
      if (generation !== this.generation) return;
      if (this.ctx.state !== "running")
        throw new Error(
          "Audio is suspended. Select Play again to allow browser audio.",
        );
      this.begin();
    } catch (e) {
      if (generation === this.generation) this.fail(e);
    }
  }
  private begin() {
    this.anchor = this.ctx!.currentTime + 0.025;
    this.startPosition = this.position;
    this.scheduled = Math.floor(this.position);
    this.update({ state: "playing", error: null });
    this.tick();
  }
  private schedule(index: number, when: number, duration: number) {
    const ctx = this.ctx!,
      osc = ctx.createOscillator(),
      gain = ctx.createGain();
    const voice = { osc, gain };
    osc.type = "sine";
    osc.frequency.value = frequency(
      this.sequence[index].anomalyC,
      this.sequenceDomain,
    );
    osc.connect(gain);
    gain.connect(this.master!);
    const end = when + Math.max(0.03, duration * 0.92);
    const attack = Math.min(0.018, (end - when) / 4),
      release = Math.min(0.035, (end - when) / 4);
    gain.gain.setValueAtTime(0, when);
    gain.gain.linearRampToValueAtTime(0.2, when + attack);
    gain.gain.setValueAtTime(0.2, end - release);
    gain.gain.linearRampToValueAtTime(0, end);
    this.voices.add(voice);
    osc.onended = () => {
      osc.disconnect();
      gain.disconnect();
      this.voices.delete(voice);
    };
    osc.start(when);
    osc.stop(end);
  }
  private tick = () => {
    if (this.snapshot.state !== "playing" || !this.ctx) return;
    try {
      if (this.ctx.state !== "running") {
        this.pause();
        return;
      }
      const position = this.logicalPosition(),
        duration = this.duration();
      if (position >= this.sequence.length) {
        this.position = this.sequence.length;
        this.cancelAudio();
        this.update({
          state: "completed",
          index: this.sequence.length - 1,
          progress: 1,
          frequency: frequency(
            this.sequence.at(-1)!.anomalyC,
            this.sequenceDomain,
          ),
        });
        return;
      }
      const index = Math.floor(position);
      // A delayed frame must skip expired notes, never emit a burst of old tones.
      this.scheduled = Math.max(this.scheduled, index);
      while (this.scheduled < this.sequence.length) {
        const notePosition = Math.max(
          this.scheduled,
          this.startPosition,
          position,
        );
        const when =
          this.anchor + (notePosition - this.startPosition) * duration;
        if (when > this.ctx.currentTime + 0.12) break;
        this.schedule(
          this.scheduled,
          Math.max(this.ctx.currentTime, when),
          (this.scheduled + 1 - notePosition) * duration,
        );
        this.scheduled++;
      }
      this.update({
        index,
        progress: position / this.sequence.length,
        frequency: frequency(
          this.sequence[index].anomalyC,
          this.sequenceDomain,
        ),
      });
      this.frame = this.deps.requestFrame(this.tick);
    } catch (e) {
      this.fail(e);
    }
  };
  pause() {
    if (!["playing", "loading"].includes(this.snapshot.state)) return;
    this.position = this.logicalPosition();
    ++this.generation;
    this.cancelAudio();
    this.update({
      state: "paused",
      index: Math.min(this.sequence.length - 1, Math.floor(this.position)),
      progress: this.sequence.length ? this.position / this.sequence.length : 0,
    });
  }
  async resume() {
    if (this.snapshot.state !== "paused" || !this.sequence.length) return;
    const saved = this.position;
    await this.play(this.sequence, this.snapshot.sequenceId, saved, {
      domain: this.sequenceDomain,
      eventSeconds: this.eventSeconds,
    });
  }
  stop() {
    ++this.generation;
    this.cancelAudio();
    this.position = 0;
    this.update({
      state: "stopped",
      index: 0,
      progress: 0,
      frequency: null,
      error: null,
    });
  }
  replay() {
    if (this.sequence.length)
      return this.play(this.sequence, this.snapshot.sequenceId, 0, {
        domain: this.sequenceDomain,
        eventSeconds: this.eventSeconds,
      });
  }
  seek(index: number) {
    if (!this.sequence.length) return;
    const wasPlaying = this.snapshot.state === "playing";
    this.position = Math.max(
      0,
      Math.min(this.sequence.length - 1, Math.floor(index)),
    );
    if (wasPlaying) {
      void this.play(this.sequence, this.snapshot.sequenceId, this.position, {
        domain: this.sequenceDomain,
        eventSeconds: this.eventSeconds,
      });
    } else {
      this.update({
        index: this.position,
        progress: this.position / this.sequence.length,
        frequency: frequency(
          this.sequence[this.position].anomalyC,
          this.sequenceDomain,
        ),
      });
    }
  }
  setSpeed(speed: number) {
    if (![0.5, 1, 2].includes(speed))
      throw new Error("Unsupported playback speed");
    const position = this.logicalPosition(),
      playing = this.snapshot.state === "playing";
    this.cancelAudio();
    this.position = position;
    this.update({ speed });
    if (playing) this.begin();
  }
  setVolume(volume: number) {
    if (!Number.isFinite(volume) || volume < 0 || volume > 1)
      throw new Error("Volume must be between 0 and 1");
    this.update({ volume });
    this.applyGain();
  }
  mute() {
    this.update({ muted: !this.snapshot.muted });
    this.applyGain();
  }
  private applyGain() {
    if (this.ctx && this.master)
      this.master.gain.setTargetAtTime(
        this.snapshot.muted ? 0 : this.snapshot.volume,
        this.ctx.currentTime,
        0.015,
      );
  }
  /** Samples after the master gain: the display follows actual output, including mute. */
  readSignal(target: Float32Array<ArrayBuffer>) {
    if (
      !this.analyser ||
      this.snapshot.state !== "playing" ||
      this.snapshot.muted
    ) {
      target.fill(0);
      return;
    }
    this.analyser.getFloatTimeDomainData(target);
  }
  dispose() {
    ++this.generation;
    this.cancelAudio();
    this.master?.disconnect();
    this.analyser?.disconnect();
    void this.ctx?.close().catch(() => {});
    this.ctx = undefined;
    this.master = undefined;
    this.analyser = undefined;
    this.update({
      state: "idle",
      sequenceId: "",
      progress: 0,
      index: 0,
      frequency: null,
    });
  }
}
