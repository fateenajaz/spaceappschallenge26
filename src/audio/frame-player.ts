import {
  BAND_FREQUENCIES,
  COLUMN_SECONDS,
  type FrameScore,
} from "./frame-score";
type Snapshot = {
  state: "idle" | "loading" | "playing" | "paused" | "completed" | "error";
  column: number;
  error: string | null;
};
/** A separate, explicitly image-derived instrument; its values never enter the climate engine. */
export class FramePlayer {
  private context?: AudioContext;
  private master?: GainNode;
  private nodes = new Map<OscillatorNode, GainNode>();
  private listeners = new Set<() => void>();
  private generation = 0;
  private frame = 0;
  private anchor = 0;
  private startColumn = 0;
  private scheduled = 0;
  private score?: FrameScore;
  private volume = 0.35;
  private snapshot: Snapshot = { state: "idle", column: 0, error: null };
  subscribe = (fn: () => void) => {
    this.listeners.add(fn);
    return () => {
      this.listeners.delete(fn);
    };
  };
  getSnapshot = () => this.snapshot;
  private update(patch: Partial<Snapshot>) {
    this.snapshot = { ...this.snapshot, ...patch };
    this.listeners.forEach((fn) => fn());
  }
  private clear() {
    cancelAnimationFrame(this.frame);
    for (const [node, gain] of this.nodes) {
      node.onended = null;
      try {
        node.stop();
      } catch {
        /* already ended */
      }
      node.disconnect();
      gain.disconnect();
    }
    this.nodes.clear();
  }
  stop(column = 0) {
    ++this.generation;
    this.clear();
    this.update({ state: "idle", column, error: null });
  }
  pause() {
    if (
      this.snapshot.state === "playing" ||
      this.snapshot.state === "loading"
    ) {
      ++this.generation;
      this.clear();
      this.update({ state: "paused" });
    }
  }
  setVolume(value: number) {
    this.volume = Math.max(0, Math.min(1, value));
    if (this.master && this.context)
      this.master.gain.setTargetAtTime(
        this.volume,
        this.context.currentTime,
        0.02,
      );
  }
  async play(score: FrameScore, column = 0) {
    this.stop(column);
    const generation = this.generation;
    this.score = score;
    this.update({ state: "loading" });
    try {
      if (!this.context || this.context.state === "closed") {
        this.context = new AudioContext();
        this.master = this.context.createGain();
        this.master.gain.value = this.volume;
        this.master.connect(this.context.destination);
      }
      await this.context.resume();
      if (generation !== this.generation) return;
      if (this.context.state !== "running")
        throw new Error(
          "Audio is suspended. Select Play again, or use the image description.",
        );
      this.startColumn = Math.max(
        0,
        Math.min(score.columns.length - 1, column),
      );
      this.scheduled = this.startColumn;
      this.anchor = this.context.currentTime + 0.04;
      this.update({ state: "playing", column: this.startColumn });
      this.tick();
    } catch (error) {
      if (generation === this.generation) {
        this.clear();
        this.update({
          state: "error",
          error:
            error instanceof Error
              ? error.message
              : "Image sound could not start.",
        });
      }
    }
  }
  private tick = () => {
    if (this.snapshot.state !== "playing" || !this.context || !this.score)
      return;
    if (this.context.state !== "running") {
      this.pause();
      return;
    }
    const position =
      this.startColumn +
      Math.max(0, this.context.currentTime - this.anchor) / COLUMN_SECONDS;
    if (position >= this.score.columns.length) {
      this.clear();
      this.update({
        state: "completed",
        column: this.score.columns.length - 1,
      });
      return;
    }
    const column = Math.floor(position);
    this.scheduled = Math.max(this.scheduled, column);
    while (this.scheduled < this.score.columns.length) {
      const when =
        this.anchor + (this.scheduled - this.startColumn) * COLUMN_SECONDS;
      if (when > this.context.currentTime + 0.1) break;
      const remaining = when + COLUMN_SECONDS - this.context.currentTime;
      if (remaining > 0.02)
        this.sound(
          this.scheduled,
          Math.max(when, this.context.currentTime),
          remaining,
        );
      this.scheduled++;
    }
    this.update({ column });
    this.frame = requestAnimationFrame(this.tick);
  };
  private sound(column: number, when: number, seconds: number) {
    const context = this.context!;
    this.score!.columns[column].forEach((band, y) => {
      (["warm", "cool"] as const).forEach((color) => {
        const density = band[color];
        if (density < 0.005) return;
        const oscillator = context.createOscillator(),
          gain = context.createGain();
        oscillator.type = color === "warm" ? "triangle" : "sine";
        oscillator.frequency.value = BAND_FREQUENCIES[y];
        oscillator.connect(gain);
        gain.connect(this.master!);
        const end = when + Math.min(seconds, COLUMN_SECONDS) * 0.95;
        const attack = Math.min(0.015, (end - when) / 4);
        const level = 0.035 * Math.sqrt(density);
        gain.gain.setValueAtTime(0, when);
        gain.gain.linearRampToValueAtTime(level, when + attack);
        gain.gain.setValueAtTime(level, Math.max(when + attack, end - attack));
        gain.gain.linearRampToValueAtTime(0, end);
        this.nodes.set(oscillator, gain);
        oscillator.onended = () => {
          oscillator.disconnect();
          gain.disconnect();
          this.nodes.delete(oscillator);
        };
        oscillator.start(when);
        oscillator.stop(end);
      });
    });
  }
  dispose() {
    this.stop();
    void this.context?.close();
    this.listeners.clear();
  }
}
