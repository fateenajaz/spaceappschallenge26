export const demoStages = [
  {
    title: "Invite a discovery",
    seconds: 15,
    label: "Introduce",
    cue: "“We used NASA observations to make climate information something you can hear. Every tone is generated from a measurement. Let your ears go first.”",
  },
  {
    title: "Let the judge listen",
    seconds: 25,
    label: "Compare",
    cue: "Play Sound A and Sound B at normal speed. Ask which period had a higher average anomaly. Let the judge choose A, B or uncertainty; submit their choice.",
  },
  {
    title: "Reveal the evidence",
    seconds: 25,
    label: "Reveal",
    cue: "Show the actual periods, computed averages and difference. Explain that an anomaly is a departure from the 1951–1980 reference, not Earth’s absolute temperature.",
  },
  {
    title: "Explore one connected observation",
    seconds: 25,
    label: "Discover",
    cue: "Scrub the verified NASA endpoints; show the paired month and tone. These are selected snapshots, not consecutive movie frames. Briefly show the cooler-year question and its measured evidence.",
  },
  {
    title: "Show actual user evidence",
    seconds: 20,
    label: "Explain",
    cue: "Report real participant counts and a change prompted by feedback. If no sessions have happened, state that clearly. Never present the testing interface as proof of learning.",
  },
  {
    title: "Bring the lesson to a classroom",
    seconds: 10,
    label: "Connect",
    cue: "Show the five-minute bilingual lesson and printable guide. Explain the next educator pilot and invite the audience to try the activity.",
  },
] as const;
export const DEMO_SECONDS = demoStages.reduce((sum, s) => sum + s.seconds, 0);
export function clockLabel(seconds: number) {
  const whole = Math.max(0, Math.floor(seconds));
  return `${Math.floor(whole / 60)
    .toString()
    .padStart(2, "0")}:${(whole % 60).toString().padStart(2, "0")}`;
}
