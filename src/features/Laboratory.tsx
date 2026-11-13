import { AudioVisual } from "../components/AudioVisual";
import { useState } from "react";
import { ArrowRight, ExternalLink } from "lucide-react";
import { records, domain, signed, dataset } from "../data/climate-loader";
import { frequency, normalize } from "../audio/mappings";
import { PlayButton, AudioSettings } from "../components/Player";
import { useAudioEngine } from "../hooks/useAudioEngine";
import { MappingChart } from "../components/Charts";
export function Laboratory({ embedded = false }: { embedded?: boolean } = {}) {
  const Heading = embedded ? "h2" : "h1";
  const engine = useAudioEngine();
  const [index, setIndex] = useState(records.findIndex((r) => r.year === 2000)),
    [second, setSecond] = useState(records.length - 1),
    [compare, setCompare] = useState(true);
  const record = records[index],
    other = records[second],
    n = normalize(record.anomalyC, domain),
    f = frequency(record.anomalyC, domain);
  return (
    <section>
      <div className="page-heading">
        <Heading>
          A measurement.
          <br />
          An audible pattern.
        </Heading>
        <p className="lead">
          Discover how scientific measurements become sound. Every note has a
          traceable calculation.
        </p>
      </div>
      <div className="lab-workbench">
        <section className="lab-controls">
          <label htmlFor="lab-year">Select year</label>
          <select
            id="lab-year"
            value={index}
            onChange={(e) => {
              engine.stop();
              setIndex(Number(e.target.value));
            }}
          >
            {records.map((r, i) => (
              <option key={r.year} value={i}>
                {r.year}
              </option>
            ))}
          </select>
          <div className="lab-reading">
            <span>
              {signed(record.anomalyC)} <small>°C</small>
            </span>
            <ArrowRight size={20} />
            <span>
              {f.toFixed(1)} <small>Hz</small>
            </span>
          </div>
          <PlayButton
            id="lab-primary"
            records={[record]}
            label="Play measurement"
          />
          <label className="check-label">
            <input
              type="checkbox"
              checked={compare}
              onChange={(e) => setCompare(e.target.checked)}
            />
            Compare a second year
          </label>
          {compare && (
            <div className="second-year">
              <label htmlFor="lab-second">Second year</label>
              <select
                id="lab-second"
                value={second}
                onChange={(e) => {
                  engine.stop();
                  setSecond(Number(e.target.value));
                }}
              >
                {records.map((r, i) => (
                  <option key={r.year} value={i}>
                    {r.year}
                  </option>
                ))}
              </select>
              <p className="mono warm-text">
                {signed(other.anomalyC)} °C →{" "}
                {frequency(other.anomalyC, domain).toFixed(1)} Hz
              </p>
              <PlayButton
                id="lab-secondary"
                records={[other]}
                label="Play second measurement"
              />
            </div>
          )}
        </section>
        <section className="lab-curve">
          <div className="chart-heading">
            <h2>The mapping curve</h2>
          </div>
          <MappingChart
            value={record.anomalyC}
            second={compare ? other.anomalyC : undefined}
          />
          <div className="legend">
            <span>
              <i style={{ background: "var(--blue)" }} />
              {record.year}
            </span>
            {compare && (
              <span>
                <i style={{ background: "var(--amber)" }} />
                {other.year}
              </span>
            )}
          </div>
          <p>
            The curve is exponential: equal temperature steps produce equal
            frequency ratios. The range stays fixed across every year and both
            comparison periods.
          </p>
          <AudioVisual
            sequencePrefix="lab-"
            compact
            label="Live waveform of the selected measurement"
          />
          <div className="lab-settings">
            <AudioSettings />
          </div>
        </section>
      </div>
      <section className="trace-section">
        <h2>From NASA’s record to your speakers.</h2>
        <div className="trace-grid">
          <div>
            <h3>{record.year}</h3>
            <p>NASA’s global land–ocean record</p>
            <a
              href={dataset.sourceUrl}
              className="text-link"
              target="_blank"
              rel="noreferrer"
            >
              Official CSV <ExternalLink size={13} />
            </a>
          </div>
          <div>
            <h3>
              {signed(record.anomalyC)} <small>°C</small>
            </h3>
            <p>Annual anomaly relative to 1951–1980</p>
          </div>
          <div>
            <h3>{n.toFixed(4)}</h3>
            <p>
              Position within the fixed {signed(domain.min)} to{" "}
              {signed(domain.max)} °C range
            </p>
          </div>
          <div>
            <h3>
              {f.toFixed(1)} <small>Hz</small>
            </h3>
            <p>A sine tone created live by Web Audio</p>
          </div>
        </div>
        <details className="formula-details" open>
          <summary>How it works — the exact calculation</summary>
          <div
            className="formula"
            tabIndex={0}
            role="region"
            aria-label="Exact sonification calculation"
          >
            <p>normalized = (anomaly − minimum) / (maximum − minimum)</p>
            <p>
              = ({record.anomalyC.toFixed(2)} − ({domain.min.toFixed(2)})) / (
              {domain.max.toFixed(2)} − ({domain.min.toFixed(2)})) ={" "}
              {n.toFixed(6)}
            </p>
            <p>
              frequency = 220 × (660 / 220)<sup>normalized</sup> ={" "}
              <strong>{f.toFixed(3)} Hz</strong>
            </p>
          </div>
          <p>
            220–660 Hz are audio-design boundaries, not climate thresholds.
            Values outside this snapshot’s domain are rejected, never silently
            clipped. Volume is constant across observations. The tones do not
            represent a physical sound emitted by Earth.
          </p>
        </details>
      </section>
    </section>
  );
}
