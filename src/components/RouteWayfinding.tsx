import { ArrowLeft, ArrowRight } from "lucide-react";
const next: Record<string, [string, string]> = {
  frames: ["listen", "Compare climate periods"],
  listen: ["explorer", "Explore the whole record"],
  explorer: ["lab", "Understand the pitch rule"],
  lab: ["science", "Trace the sources"],
  science: ["lesson", "Try the guided lesson"],
  lesson: ["home", "Return to the journey"],
  study: ["lesson", "Try the classroom activity"],
  present: ["home", "Experience the full journey"],
};
export function RouteWayfinding({ route }: { route: string }) {
  const target = next[route];
  if (!target) return null;
  return (
    <nav className="route-wayfinding" aria-label="Continue exploring">
      <a href="#home">
        <ArrowLeft size={13} />
        Back to the journey
      </a>
      <a href={`#${target[0]}`}>
        {target[1]}
        <ArrowRight size={13} />
      </a>
    </nav>
  );
}
