import {
  createContext,
  useContext,
  useEffect,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { AudioEngine } from "../audio/engine";
import { domain } from "../data/climate-loader";
const AudioContext = createContext<AudioEngine | null>(null);
export function AudioProvider({ children }: { children: ReactNode }) {
  const [engine] = useState(() => new AudioEngine(domain));
  useEffect(() => {
    const hidden = () => {
      if (document.hidden) engine.pause();
    };
    document.addEventListener("visibilitychange", hidden);
    return () => {
      document.removeEventListener("visibilitychange", hidden);
      engine.dispose();
    };
  }, [engine]);
  return (
    <AudioContext.Provider value={engine}>{children}</AudioContext.Provider>
  );
}
export function useAudioEngine() {
  const engine = useContext(AudioContext);
  if (!engine) throw new Error("AudioProvider missing");
  return engine;
}
export function useAudio() {
  const engine = useAudioEngine();
  const playback = useSyncExternalStore(
    engine.subscribe,
    engine.getSnapshot,
    engine.getSnapshot,
  );
  return { engine, playback };
}
