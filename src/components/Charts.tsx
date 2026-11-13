import { memo, useId } from "react";
import type { ClimateRecord } from "../types/climate";
import { domain, signed } from "../data/climate-loader";
import { frequency } from "../audio/mappings";
export type Series = { label: string; records: ClimateRecord[]; color: string };
function ClimateChartView({
  series,
  activeYear,
  relative = false,
}: {
  series: Series[];
  activeYear?: number;
  relative?: boolean;
}) {
  const id = useId(),
    W = 840,
    H = 290,
    left = 66,
    right = 22,
    top = 26,
    bottom = 48;
  const all = series.flatMap((s) => s.records);
  const first = Math.min(...all.map((r) => r.year)),
    last = Math.max(...all.map((r) => r.year));
  const ymin = Math.floor(domain.min * 2) / 2,
    ymax = Math.ceil(domain.max * 2) / 2;
  const x = (year: number, index: number, length: number) =>
    left +
    (relative
      ? index / Math.max(1, length - 1)
      : (year - first) / Math.max(1, last - first)) *
      (W - left - right);
  const y = (v: number) =>
    H - bottom - ((v - ymin) / (ymax - ymin)) * (H - top - bottom);
  const ticks = Array.from(
    { length: Math.round((ymax - ymin) / 0.5) + 1 },
    (_, i) => ymin + i * 0.5,
  );
  const active = all.find((r) => r.year === activeYear);
  return (
    <div className="chart-shell">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-labelledby={id}>
        <title id={id}>
          Annual global temperature anomalies in Celsius relative to 1951–1980
          {relative ? ", aligned by position within each period" : ""}. A
          numerical table follows.
        </title>
        <text x={left} y={13} className="axis-title">
          ANOMALY · °C
        </text>
        {ticks.map((t) => (
          <g key={t}>
            <line
              x1={left}
              x2={W - right}
              y1={y(t)}
              y2={y(t)}
              className={t === 0 ? "baseline" : "grid-line"}
            />
            <text x={left - 12} y={y(t) + 4} textAnchor="end">
              {signed(t, 1)}
            </text>
          </g>
        ))}
        {[0, 0.25, 0.5, 0.75, 1].map((t) => (
          <text
            key={t}
            x={left + t * (W - left - right)}
            y={H - 20}
            textAnchor="middle"
          >
            {relative
              ? Math.round(1 + t * (series[0].records.length - 1))
              : Math.round(first + t * (last - first))}
          </text>
        ))}
        {series.map((s) => (
          <path
            key={s.label}
            d={s.records
              .map(
                (r, i) =>
                  `${i ? "L" : "M"}${x(r.year, i, s.records.length).toFixed(2)},${y(r.anomalyC).toFixed(2)}`,
              )
              .join(" ")}
            fill="none"
            stroke={s.color}
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
        ))}
        {active && (
          <g>
            <line
              x1={x(active.year, 0, 1)}
              x2={x(active.year, 0, 1)}
              y1={top}
              y2={H - bottom}
              className="cursor-line"
            />
            <circle
              cx={x(active.year, 0, 1)}
              cy={y(active.anomalyC)}
              r="6"
              fill="var(--blue)"
              stroke="var(--bg)"
              strokeWidth="3"
            />
          </g>
        )}
        <text x={W - right} y={H - 1} textAnchor="end" className="axis-title">
          {relative ? "YEAR WITHIN PERIOD" : "YEAR"}
        </text>
      </svg>
    </div>
  );
}
function DataTableView({ series }: { series: Series[] }) {
  return (
    <details className="data-details">
      <summary>View original annual measurements</summary>
      <div
        className="table-scroll"
        tabIndex={0}
        role="region"
        aria-label="Annual NASA measurements"
      >
        <table>
          <caption>
            NASA GISS / GISTEMP v4 · anomaly from 1951–1980, in °C
          </caption>
          <thead>
            <tr>
              <th scope="col">Series</th>
              <th scope="col">Year</th>
              <th scope="col">Anomaly (°C)</th>
            </tr>
          </thead>
          <tbody>
            {series.flatMap((s) =>
              s.records.map((r) => (
                <tr key={`${s.label}-${r.year}`}>
                  <td>{s.label}</td>
                  <th scope="row">{r.year}</th>
                  <td>{signed(r.anomalyC)}</td>
                </tr>
              )),
            )}
          </tbody>
        </table>
      </div>
    </details>
  );
}
export function MappingChart({
  value,
  second,
}: {
  value: number;
  second?: number;
}) {
  const id = useId(),
    W = 740,
    H = 270,
    left = 65,
    right = 30,
    top = 24,
    bottom = 50;
  const x = (v: number) =>
    left + ((v - domain.min) / (domain.max - domain.min)) * (W - left - right);
  const y = (f: number) => H - bottom - ((f - 220) / 440) * (H - top - bottom);
  const points = Array.from(
    { length: 101 },
    (_, i) => domain.min + (i / 100) * (domain.max - domain.min),
  );
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-labelledby={id}
      className="mapping-chart"
    >
      <title id={id}>
        Exponential mapping from {domain.min} to {domain.max} °C, producing 220
        to 660 Hz. Selected frequency {frequency(value, domain).toFixed(1)} Hz.
      </title>
      {[220, 440, 660].map((f) => (
        <g key={f}>
          <line
            x1={left}
            x2={W - right}
            y1={y(f)}
            y2={y(f)}
            className="grid-line"
          />
          <text x={left - 12} y={y(f) + 4} textAnchor="end">
            {f}
          </text>
        </g>
      ))}
      <text x={left} y={13} className="axis-title">
        FREQUENCY · Hz
      </text>
      <path
        d={points
          .map((v, i) => `${i ? "L" : "M"}${x(v)},${y(frequency(v, domain))}`)
          .join(" ")}
        fill="none"
        stroke="var(--blue)"
        strokeWidth="3"
      />
      {[value, second]
        .filter((v): v is number => v !== undefined)
        .map((v, i) => (
          <g key={i}>
            <line
              x1={x(v)}
              x2={x(v)}
              y1={y(frequency(v, domain))}
              y2={H - bottom}
              className="cursor-line"
            />
            <circle
              cx={x(v)}
              cy={y(frequency(v, domain))}
              r="7"
              fill={i ? "var(--amber)" : "var(--blue)"}
              stroke="var(--bg)"
              strokeWidth="3"
            />
          </g>
        ))}
      {[domain.min, 0, domain.max].map((v) => (
        <text x={x(v)} y={H - 25} textAnchor="middle" key={v}>
          {signed(v)}
        </text>
      ))}
      <text x={W - right} y={H - 3} textAnchor="end" className="axis-title">
        TEMPERATURE ANOMALY · °C
      </text>
    </svg>
  );
}

export const ClimateChart = memo(ClimateChartView);
export const DataTable = memo(DataTableView);
