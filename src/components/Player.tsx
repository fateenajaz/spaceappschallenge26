import { useId } from "react";
import { Pause, Play, RotateCcw, Square, Volume2, VolumeX } from "lucide-react";
import { useAudio } from "../hooks/useAudioEngine";
import type { ClimateRecord } from "../types/climate";
export function PlayButton({
  id,
  records,
  start = 0,
  label = "Play",
  disabled = false,
}: {
  id: string;
  records: ClimateRecord[];
  start?: number;
  label?: string;
  disabled?: boolean;
}) {
  const { engine, playback } = useAudio();
  const owned = playback.sequenceId === id,
    playing = owned && playback.state === "playing",
    paused = owned && playback.state === "paused";
  return (
    <button
      className="button primary"
      disabled={disabled || (owned && playback.state === "loading")}
      onClick={() =>
        playing
          ? engine.pause()
          : paused
            ? void engine.resume()
            : void engine.play(records, id, start)
      }
    >
      {playing ? <Pause size={18} /> : <Play size={18} />}
      <span>{playing ? "Pause" : paused ? "Resume" : label}</span>
    </button>
  );
}
export function Transport({
  id,
  records,
  start = 0,
}: {
  id: string;
  records: ClimateRecord[];
  start?: number;
}) {
  const { engine, playback } = useAudio();
  const owned = playback.sequenceId === id;
  return (
    <div className="transport">
      <PlayButton id={id} records={records} start={start} />
      <button
        className="button secondary"
        onClick={() => void engine.play(records, id)}
      >
        <RotateCcw size={17} />
        Restart
      </button>
      <button
        className="icon-button"
        aria-label="Stop playback"
        disabled={
          !owned || !["playing", "paused", "loading"].includes(playback.state)
        }
        onClick={() => engine.stop()}
      >
        <Square size={17} />
      </button>
    </div>
  );
}
export function AudioSettings() {
  const volumeId = useId();
  const { engine, playback } = useAudio();
  return (
    <div className="audio-settings">
      <label className="speed-label">
        Playback speed
        <select
          value={playback.speed}
          onChange={(e) => engine.setSpeed(Number(e.target.value))}
        >
          <option value="0.5">Slow · 0.5×</option>
          <option value="1">Normal · 1×</option>
          <option value="2">Fast · 2×</option>
        </select>
      </label>
      <div className="volume-control">
        <button
          className="icon-button"
          onClick={() => engine.mute()}
          aria-label={playback.muted ? "Unmute audio" : "Mute audio"}
          aria-pressed={playback.muted}
        >
          {playback.muted ? <VolumeX size={19} /> : <Volume2 size={19} />}
        </button>
        <label className="sr-only" htmlFor={volumeId}>
          Volume
        </label>
        <input
          id={volumeId}
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={playback.volume}
          onChange={(e) => engine.setVolume(Number(e.target.value))}
        />
      </div>
    </div>
  );
}
export function AudioStatus() {
  const { playback } = useAudio();
  return (
    <>
      <div className="sr-only" role="status">
        Audio {playback.state}
      </div>
      {playback.error && (
        <div className="error-box" role="alert">
          {playback.error}
        </div>
      )}
    </>
  );
}
