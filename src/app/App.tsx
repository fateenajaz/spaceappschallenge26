import { Component, useEffect, useRef, useState, type ReactNode } from "react";
import { Globe2 } from "lucide-react";
import { Story } from "../features/Story";
import { ListeningTest } from "../features/ListeningTest";
import { Explorer } from "../features/Explorer";
import { Laboratory } from "../features/Laboratory";
import { Science } from "../features/Science";
import { FrameJukebox } from "../features/FrameJukebox";
import { Study } from "../features/Study";
import { Presenter } from "../features/Presenter";
import { AudioStatus } from "../components/Player";
import { AudioProvider, useAudioEngine } from "../hooks/useAudioEngine";
import { Lesson } from "../features/Lesson";
import { DetailDialog } from "../components/DetailDialog";
import { RouteWayfinding } from "../components/RouteWayfinding";
type Route =
  | "lesson"
  | "home"
  | "listen"
  | "explorer"
  | "lab"
  | "science"
  | "frames"
  | "study"
  | "present";
function getRoute(): Route {
  const hash = window.location.hash.slice(1);
  return [
    "lesson",
    "listen",
    "explorer",
    "lab",
    "science",
    "frames",
    "study",
    "present",
  ].includes(hash)
    ? (hash as Route)
    : "home";
}
function Shell() {
  const [route, setRoute] = useState<Route>(getRoute),
    main = useRef<HTMLElement>(null),
    initial = useRef(true);
  const engine = useAudioEngine();
  useEffect(() => {
    const change = () => {
      engine.stop();
      window.dispatchEvent(new Event("echo-navigation"));
      setRoute(getRoute());
    };
    window.addEventListener("hashchange", change);
    return () => window.removeEventListener("hashchange", change);
  }, [engine]);
  useEffect(() => {
    if (initial.current) {
      initial.current = false;
      return;
    }
    window.scrollTo({ top: 0, behavior: "instant" });
    main.current?.focus();
  }, [route]);
  return (
    <>
      <a
        className="skip-link"
        tabIndex={0}
        href="#main-content"
        onClick={(e) => {
          e.preventDefault();
          main.current?.focus();
        }}
      >
        Skip to content
      </a>
      <header
        className={`site-header ${route === "home" ? "story-site-header" : ""}`}
      >
        <a href="#home" className="brand" aria-label="ECHO home">
          <Globe2 size={29} strokeWidth={1.4} />
          <span>ECHO</span>
        </a>
        <DetailDialog
          label="Explore"
          title="Explore ECHO"
          closeOnNavigate
          onOpen={() => {
            engine.pause();
            window.dispatchEvent(new Event("echo-navigation"));
          }}
        >
          <nav className="explore-menu" aria-label="Additional experiences">
            {[
              ["home", "Guided journey"],
              ["frames", "NASA Jukebox"],
              ["listen", "Listening Test"],
              ["explorer", "Hear the Century"],
              ["lab", "Sound Laboratory"],
              ["science", "Sources and methods"],
              ["lesson", "Classroom lesson"],
              ["study", "Volunteer testing"],
              ["present", "Presenter mode"],
            ].map(([id, label]) => (
              <a
                key={id}
                href={`#${id}`}
                aria-current={route === id ? "page" : undefined}
              >
                {label}
              </a>
            ))}
          </nav>
        </DetailDialog>
      </header>
      <main
        id="main-content"
        ref={main}
        tabIndex={-1}
        className={route === "home" ? "home-main" : ""}
      >
        <AudioStatus />
        <div className={`route-scene route-${route}`} key={route}>
          {route === "home" ? (
            <Story />
          ) : route === "lesson" ? (
            <Lesson />
          ) : route === "listen" ? (
            <ListeningTest />
          ) : route === "explorer" ? (
            <Explorer />
          ) : route === "lab" ? (
            <Laboratory />
          ) : route === "frames" ? (
            <FrameJukebox />
          ) : route === "study" ? (
            <Study />
          ) : route === "present" ? (
            <Presenter />
          ) : (
            <Science />
          )}
          <RouteWayfinding route={route} />
        </div>
      </main>
      <footer className="site-footer quiet-footer">
        <p>An independent educational project. NASA does not endorse ECHO.</p>
      </footer>
    </>
  );
}
class ErrorBoundary extends Component<
  { children: ReactNode },
  { error: string | null }
> {
  state: { error: string | null } = { error: null };
  static getDerivedStateFromError(error: Error) {
    return { error: error.message };
  }
  render() {
    return this.state.error ? (
      <main className="fatal-error">
        <h1>The experience could not load.</h1>
        <p role="alert">{this.state.error}</p>
        <p>The data is never replaced with invented observations.</p>
        <button
          className="button primary"
          onClick={() => window.location.reload()}
        >
          Reload the experience
        </button>
        <a href="https://data.giss.nasa.gov/gistemp/">Open NASA source</a>
      </main>
    ) : (
      this.props.children
    );
  }
}
export default function App() {
  return (
    <ErrorBoundary>
      <AudioProvider>
        <Shell />
      </AudioProvider>
    </ErrorBoundary>
  );
}
