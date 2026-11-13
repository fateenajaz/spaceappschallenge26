export type Domain = { min: number; max: number };
export const FREQUENCY_MIN = 220,
  FREQUENCY_MAX = 660;
export function normalize(value: number, domain: Domain) {
  if (
    ![value, domain.min, domain.max].every(Number.isFinite) ||
    domain.max <= domain.min
  )
    throw new Error("Invalid sonification domain");
  if (value < domain.min || value > domain.max)
    throw new Error(`Anomaly ${value} is outside the fixed mapping domain`);
  return (value - domain.min) / (domain.max - domain.min);
}
export function frequency(value: number, domain: Domain) {
  return (
    FREQUENCY_MIN * (FREQUENCY_MAX / FREQUENCY_MIN) ** normalize(value, domain)
  );
}
