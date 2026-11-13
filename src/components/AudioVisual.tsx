import { memo, useEffect, useRef } from "react";
import { useAudioEngine } from "../hooks/useAudioEngine";
type Props = {
  sequencePrefix: string;
  mode?: "amplitude" | "waveform";
  earth?: boolean;
  compact?: boolean;
  color?: string;
  label?: string;
};
/** Draws measured post-gain audio samples. No synthetic waveform or independent animation clock. */
export const AudioVisual = memo(function AudioVisual({
  sequencePrefix,
  mode = "waveform",
  earth = false,
  compact = false,
  color = "#83c7ff",
  label = "Live audio waveform",
}: Props) {
  const canvas = useRef<HTMLCanvasElement>(null),
    figure = useRef<HTMLElement>(null);
  const engine = useAudioEngine();
  useEffect(() => {
    const node = canvas.current,
      container = figure.current;
    if (!node || !container) return;
    const context = node.getContext("2d");
    if (!context) return;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const samples = new Float32Array(1024);
    let frame = 0,
      width = 0,
      height = 0,
      lastState = "";
    const active = () => {
      const p = engine.getSnapshot();
      return p.state === "playing" && p.sequenceId.startsWith(sequencePrefix);
    };
    function draw() {
      if (!context || !node || !container) return;
      const isActive = active();
      samples.fill(0);
      if (isActive && !media.matches) engine.readSignal(samples);
      const rms = Math.sqrt(
          samples.reduce((sum, v) => sum + v * v, 0) / samples.length,
        ),
        energy = Math.min(1, rms * 8);
      container.dataset.signalLevel = rms.toFixed(5);
      container.dataset.active = String(isActive);
      container.dataset.reducedMotion = String(media.matches);
      context.clearRect(0, 0, width, height);
      const cx = width / 2,
        cy = height / 2,
        base = Math.min(width, height) * (earth ? 0.29 : 0.22);
      if (earth || mode === "amplitude") {
        for (let ring = 0; ring < 6; ring++) {
          const radius = base + ring * 9 + energy * (12 + ring * 3);
          context.beginPath();
          context.ellipse(cx, cy, radius, radius * 0.78, -0.23, 0, Math.PI * 2);
          context.strokeStyle = color;
          context.globalAlpha = 0.1 + (5 - ring) * 0.035 + energy * 0.15;
          context.lineWidth = ring === 0 ? 1.6 : 0.65;
          context.stroke();
        }
        if (mode === "waveform") {
          context.beginPath();
          for (let i = 0; i <= 512; i++) {
            const t = (i / 512) * Math.PI * 2,
              r =
                base + Math.abs(samples[(i * 2) % samples.length]) * base * 1.8;
            const x = cx + Math.cos(t) * r,
              y = cy + Math.sin(t) * r;
            if (i === 0) context.moveTo(x, y);
            else context.lineTo(x, y);
          }
          context.closePath();
          context.globalAlpha = 0.8;
          context.strokeStyle = color;
          context.lineWidth = 1.4;
          context.stroke();
        }
      } else {
        context.strokeStyle = "#ffffff";
        context.globalAlpha = 0.1;
        context.lineWidth = 1;
        for (let row = 1; row < 4; row++) {
          context.beginPath();
          context.moveTo(0, (height * row) / 4);
          context.lineTo(width, (height * row) / 4);
          context.stroke();
        }
        for (let band = 0; band < 3; band++) {
          context.beginPath();
          for (let x = 0; x <= width; x += 2) {
            const index = Math.floor(
              (x / Math.max(1, width)) * (samples.length - 1),
            );
            const y = cy + samples[index] * height * (2.5 + band * 0.6);
            if (x === 0) context.moveTo(x, y);
            else context.lineTo(x, y);
          }
          context.strokeStyle = color;
          context.globalAlpha = band === 0 ? 0.9 : 0.2;
          context.lineWidth = band === 0 ? 1.6 : 0.6;
          context.stroke();
        }
      }
      context.globalAlpha = 1;
    }
    function tick() {
      draw();
      frame = active() && !media.matches ? requestAnimationFrame(tick) : 0;
    }
    function update() {
      const p = engine.getSnapshot(),
        key = p.sequenceId.startsWith(sequencePrefix)
          ? `${p.state}:${p.muted}`
          : "inactive";
      if (key === lastState) return;
      lastState = key;
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      draw();
      if (active() && !media.matches) frame = requestAnimationFrame(tick);
    }
    function resize() {
      if (!node || !container || !context) return;
      const rect = node.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      node.width = Math.round(width * ratio);
      node.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      draw();
    }
    const observer =
      typeof ResizeObserver !== "undefined" ? new ResizeObserver(resize) : null;
    observer?.observe(node);
    resize();
    const unsubscribe = engine.subscribe(update);
    const motionChanged = () => {
      lastState = "";
      resize();
      update();
    };
    media.addEventListener("change", motionChanged);
    update();
    return () => {
      if (frame) cancelAnimationFrame(frame);
      observer?.disconnect();
      unsubscribe();
      media.removeEventListener("change", motionChanged);
    };
  }, [engine, sequencePrefix, mode, earth, color]);
  return (
    <figure
      ref={figure}
      className={`audio-visual ${earth ? "with-earth" : ""} ${compact ? "compact-visual" : ""}`}
      aria-label={label}
      data-sequence={sequencePrefix}
      data-signal-level="0"
      data-active="false"
    >
      {earth && (
        <img
          className="signal-earth"
          src="/nasa/blue-marble-east.webp"
          alt=""
          loading="lazy"
        />
      )}
      <canvas ref={canvas} aria-hidden="true" />
      <figcaption>
        {mode === "amplitude" ? "Live sound amplitude" : "Live audio waveform"}
      </figcaption>
    </figure>
  );
});
