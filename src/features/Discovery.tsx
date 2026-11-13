import { useState } from "react";
import { records, signed } from "../data/climate-loader";
import { PlayButton } from "../components/Player";
import { ClimateChart, DataTable } from "../components/Charts";

// A fixed, reproducible interval; every displayed conclusion is computed from the snapshot.
export const discoveryRecords = records.filter(
  (r) => r.year >= 1991 && r.year <= 2020,
);
export const coolerSteps = discoveryRecords
  .slice(1)
  .flatMap((r, i) =>
    r.anomalyC < discoveryRecords[i].anomalyC
      ? [{ from: discoveryRecords[i], to: r }]
      : [],
  );
const mean = (values: typeof records) =>
  values.reduce((sum, r) => sum + r.anomalyC, 0) / values.length;
export const decadeDifference =
  mean(discoveryRecords.slice(-10)) - mean(discoveryRecords.slice(0, 10));
const series = [
  { label: "1991–2020", records: discoveryRecords, color: "var(--blue)" },
];
import { DetailDialog } from "../components/DetailDialog";
export function Discovery({
  arabic = false,
  compact = false,
}: {
  arabic?: boolean;
  compact?: boolean;
}) {
  const [answer, setAnswer] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [year, setYear] = useState(discoveryRecords[1].year);
  const step = coolerSteps.find((s) => s.to.year === year);
  return (
    <section
      className={`lesson-discovery ${compact ? "compact-discovery" : ""}`}
    >
      <h2>
        {arabic
          ? "هل يمكن أن توجد سنوات أبرد ضمن مناخ يزداد احتراراً؟"
          : "Can a warming climate still contain cooler years?"}
      </h2>
      {!(compact && revealed) && (
        <p>
          {arabic
            ? "استمع إلى الفترة من 1991 إلى 2020. النغمة الأعلى تعني انحرافاً حرارياً أعلى. هل تسمع انخفاضاً بين سنتين؟"
            : "Listen to 1991–2020. Higher pitch means a higher temperature anomaly. Listen for a downward step between years."}
        </p>
      )}
      {!(compact && revealed) && (
        <>
          <PlayButton
            id="discovery"
            records={discoveryRecords}
            label={arabic ? "استمع إلى الفترة" : "Listen for a cooler year"}
          />
          <fieldset className="answer-options">
            <legend>{arabic ? "ما توقعك؟" : "What do you predict?"}</legend>
            {[
              [
                "yes",
                arabic
                  ? "نعم، قد تنخفض بعض السنوات"
                  : "Yes, individual years can dip",
              ],
              [
                "no",
                arabic ? "لا، يجب أن ترتفع كل سنة" : "No, every year must rise",
              ],
              ["unsure", arabic ? "لست متأكداً" : "I’m unsure"],
            ].map(([value, label]) => (
              <label key={value}>
                <input
                  type="radio"
                  name="discovery-answer"
                  value={value}
                  checked={answer === value}
                  onChange={() => {
                    setAnswer(value);
                    setRevealed(false);
                  }}
                />
                {label}
              </label>
            ))}
          </fieldset>
          <button
            className="button primary"
            disabled={!answer}
            onClick={() => setRevealed(true)}
          >
            {arabic ? "اكشف الأدلة" : "Reveal the evidence"}
          </button>
        </>
      )}
      {revealed && (
        <div
          className="reveal"
          role="region"
          aria-label={arabic ? "الأدلة" : "Discovery evidence"}
        >
          <p role="status">
            {arabic
              ? `نعم. انخفض الانحراف الحراري في ${coolerSteps.length} انتقالات سنوية. متوسط العقد الأخير أعلى من الأول بمقدار ${decadeDifference.toFixed(3)} درجة مئوية.`
              : `Yes. There are ${coolerSteps.length} downward year-to-year steps. The last decade’s mean anomaly is ${decadeDifference.toFixed(3)} °C higher than the first decade’s.`}
          </p>
          <p>
            {arabic
              ? "التقلب السنوي والاتجاه طويل المدى يمكن أن يحدثا معاً. هذه المقارنة وصف للبيانات وليست اختباراً إحصائياً للاتجاه أو تفسيراً لأسبابه."
              : "Yearly variability and a longer-term increase can coexist. This decade comparison describes the observations; it is not a statistical trend test or an explanation of causes."}
          </p>
          <label>
            {arabic
              ? "اختر السنة الثانية من زوج متتالٍ"
              : "Choose the second year of a consecutive pair"}{" "}
            <select
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
            >
              {discoveryRecords.slice(1).map((r) => (
                <option key={r.year}>{r.year}</option>
              ))}
            </select>
          </label>
          <p>
            {step
              ? `${step.from.year}: ${signed(step.from.anomalyC)} °C → ${step.to.year}: ${signed(step.to.anomalyC)} °C`
              : arabic
                ? "لم ينخفض الانحراف الحراري في هذا الزوج. جرّب سنة أخرى."
                : "This pair did not decrease. Try another year."}
          </p>
          <PlayButton
            id="discovery-pair"
            records={discoveryRecords.filter(
              (r) => r.year === year - 1 || r.year === year,
            )}
            label={arabic ? "استمع إلى السنتين" : "Hear this pair"}
          />
          {compact ? (
            <DetailDialog
              label="Inspect all 30 years"
              title="Yearly variation in NASA’s record"
            >
              <ClimateChart series={series} activeYear={year} />
              <DataTable series={series} />
            </DetailDialog>
          ) : (
            <>
              <ClimateChart series={series} activeYear={year} />
              <DataTable series={series} />
            </>
          )}
          <p>
            {arabic
              ? "القيم انحرافات عن متوسط 1951–1980، وليست درجات حرارة مطلقة."
              : "Values are anomalies from the 1951–1980 average, not absolute temperatures."}
          </p>
        </div>
      )}
    </section>
  );
}
