import { ArrowLeft, ArrowRight } from "lucide-react";
const destinations: Record<string, { previous: string; next: string }> = {
  frames: { previous: "home", next: "listen" },
  listen: { previous: "frames", next: "explorer" },
  explorer: { previous: "home/5", next: "lab" },
  lab: { previous: "explorer", next: "science" },
  science: { previous: "lab", next: "lesson" },
  lesson: { previous: "science", next: "study" },
  study: { previous: "lesson", next: "present" },
  present: { previous: "study", next: "home" },
};
export function RouteWayfinding({ route }: { route: string }) {
  if (route === "lesson" || route === "present") return null;
  const destination = destinations[route];
  if (!destination) return null;
  return (
    <nav
      className="route-wayfinding linear-dock"
      aria-label="Experience navigation"
    >
      <a className="route-back" href={`#${destination.previous}`}>
        <ArrowLeft size={16} />
        Back
      </a>
      <a className="button primary" href={`#${destination.next}`}>
        Continue
        <ArrowRight size={18} />
      </a>
    </nav>
  );
}
