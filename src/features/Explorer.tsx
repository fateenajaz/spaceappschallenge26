import { AudioVisual } from "../components/AudioVisual";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { records, domain, signed, dataset } from "../data/climate-loader";
import { frequency } from "../audio/mappings";
import { useAudio } from "../hooks/useAudioEngine";
import { Transport, AudioSettings } from "../components/Player";
import { ClimateChart, DataTable, type Series } from "../components/Charts";
import { NasaMedia } from "../components/NasaMedia";
const annualSeries: Series[] = [
  { label: "Annual record", records, color: "var(--blue)" },
];
export function Explorer({ embedded = false }: { embedded?: boolean } = {}) {
  const Heading = embedded ? "h2" : "h1";
  const [selected, setSelected] = useState(0);
  const { engine, playback } = useAudio();
  const active =
    playback.sequenceId === "explorer" &&
    ["playing", "paused", "completed", "stopped"].includes(playback.state);
  const index = active ? playback.index : selected,
    record = records[index];
  function select(next: number) {
    const valid = Math.max(0, Math.min(records.length - 1, next));
    setSelected(valid);
    if (playback.sequenceId === "explorer") engine.seek(valid);
  }
  return (
    <section>
      <div className="page-heading">
        <Heading>Hear the Century</Heading>
        <p className="lead">
          Listen to more than a century of Earth’s changing temperature record.
        </p>
      </div>
      <section
        className="explorer-workbench"
        aria-label="Annual climate explorer"
      >
        <div className="explorer-chart">
          <AudioVisual
            sequencePrefix="explorer"
            earth
            label="Live audio waveform around an illustrative NASA Earth image"
          />
          <div className="chart-heading">
            <span className="mono small">1880—{records.at(-1)!.year}</span>
          </div>
          <ClimateChart series={annualSeries} activeYear={record.year} />
          <p className="small source-caption">
            Derived annual visualization · NASA GISS / GISTEMP v4 · baseline
            1951–1980
          </p>
        </div>
        <div className="measurement-panel">
          <div className="active-year" data-testid="active-year">
            {record.year}
          </div>
          <dl>
            <div>
              <dt>Temperature anomaly</dt>
              <dd>
                {signed(record.anomalyC)} <span>°C</span>
              </dd>
            </div>
            <div>
              <dt>Generated frequency</dt>
              <dd>
                {frequency(record.anomalyC, domain).toFixed(1)} <span>Hz</span>
              </dd>
            </div>
          </dl>
          <p className="small">
            Each note is one year. Higher notes represent higher anomalies,
            relative to the 1951–1980 average.
          </p>
          <span className="playback-status">
            {active ? playback.state : "Ready to listen"}
          </span>
        </div>
        <div className="timeline">
          <div className="timeline-label">
            <label htmlFor="year-timeline">Select a year</label>
            <output htmlFor="year-timeline">{record.year}</output>
          </div>
          <input
            id="year-timeline"
            aria-valuetext={`${record.year}, ${signed(record.anomalyC)} degrees Celsius anomaly`}
            type="range"
            min="0"
            max={records.length - 1}
            value={index}
            onChange={(e) => select(Number(e.target.value))}
          />
          <div className="timeline-extents">
            <span>1880</span>
            <span>{records.at(-1)!.year}</span>
          </div>
          <div className="explorer-controls">
            <div className="transport">
              <button
                className="icon-button"
                aria-label="Previous year"
                disabled={index === 0}
                onClick={() => select(index - 1)}
              >
                <ChevronLeft size={20} />
              </button>
              <Transport id="explorer" records={records} start={index} />
              <button
                className="icon-button"
                aria-label="Next year"
                disabled={index === records.length - 1}
                onClick={() => select(index + 1)}
              >
                <ChevronRight size={20} />
              </button>
            </div>
            <AudioSettings />
          </div>
        </div>
      </section>
      <p className="audio-disclosure">
        These tones are an artificial encoding of measured anomalies, not
        naturally emitted climate sounds. The chart and current measurement
        follow the annual audio clock.
      </p>
      <DataTable series={annualSeries} />
      <NasaMedia />
      <div className="section-note">
        <h2>One record, two time scales.</h2>
        <p>
          The NASA spiral and our annual chart draw from GISTEMP v4. NASA’s
          spiral retains monthly variation; annual sonification summarizes each
          complete year with the official J–D value. Historical values can be
          revised between NASA releases. Our snapshot was verified{" "}
          {dataset.lastVerified}.
        </p>
      </div>
    </section>
  );
}
