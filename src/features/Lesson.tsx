import { useState } from "react";
import { ListeningTest } from "./ListeningTest";
import { Discovery } from "./Discovery";
import { FrameJukebox } from "./FrameJukebox";
import { useAudioEngine } from "../hooks/useAudioEngine";
export function Lesson() {
  const [arabic, setArabic] = useState(false);
  const [stage, setStage] = useState(0);
  const engine = useAudioEngine();
  const titles = arabic
    ? [
        "توقع واستمع",
        "اكتشف التقلب السنوي",
        "استكشف صور ناسا",
        "اشرح ما تعلمته",
      ]
    : [
        "Predict and listen",
        "Discover yearly variability",
        "Explore NASA visuals",
        "Explain your discovery",
      ];
  return (
    <section className="lesson-page">
      <div className="page-heading">
        <h1>{arabic ? "استمع. توقّع. اكتشف." : "Listen. Predict. Discover."}</h1>
        <p className="lead">
          {arabic
            ? "نشاط مدته خمس دقائق للصفوف والمعارض العلمية في الإمارات"
            : "A five-minute activity for UAE classrooms and science exhibits."}
        </p>
      </div>
      <button
        className="button secondary"
        lang={arabic ? "en" : "ar"}
        onClick={() => setArabic(!arabic)}
      >
        {arabic ? "English guidance" : "إرشادات بالعربية"}
      </button>
      <p className="small">
        {arabic
          ? "الإرشادات بالعربية؛ أدوات ناسا والمقارنة باللغة الإنجليزية. الترجمة مسودة تحتاج مراجعة معلّم."
          : "Arabic lesson guidance is available; NASA and comparison controls remain in English. Translation awaits educator review."}
      </p>
      <div
        className="journey-progress lesson-progress"
        role="progressbar"
        aria-label="Lesson progress"
        aria-valuemin={1}
        aria-valuemax={4}
        aria-valuenow={stage + 1}
        aria-valuetext={titles[stage]}
      >
        <span style={{ width: `${((stage + 1) / 4) * 100}%` }} />
      </div>
      <div className="lesson-stage" key={stage}>
        <div
          lang={arabic ? "ar" : "en"}
          dir={arabic ? "rtl" : "ltr"}
          className="lesson-guidance"
        >
          <h2>{titles[stage]}</h2>
          <p>
            {
              (arabic
                ? [
                    "دقيقة واحدة: استمع إلى الفترتين. اختر أيهما أدفأ أو اختر عدم التأكد، ثم اكشف القيم.",
                    "دقيقة ونصف: استمع إلى التقلبات. هل يجب أن تكون كل سنة أدفأ من سابقتها؟",
                    "دقيقة ونصف: اختر صورة موثقة، واستمع إلى شهرها، ثم استخدم زر وصف اللحظة.",
                    "دقيقة واحدة: ماذا تمثل النغمة الأعلى؟ كيف تتعايش سنة أبرد مع اتجاه احترار طويل المدى؟",
                  ]
                : [
                    "1 minute: hear both periods, predict which was warmer or choose uncertainty, then reveal the measurements.",
                    "90 seconds: listen for fluctuations. Must every year be warmer than the previous one?",
                    "90 seconds: select a verified NASA snapshot, hear its month, and use Describe this moment.",
                    "1 minute: explain what a higher pitch means and how a cooler year can occur within a longer-term warming pattern.",
                  ])[stage]
            }
          </p>
        </div>
        {stage === 0 && <ListeningTest compact embedded />}
        {stage === 1 && <Discovery compact arabic={arabic} />}
        {stage === 2 && <FrameJukebox embedded />}
        {stage === 3 && (
          <div className="binding-notes">
            <h2>{arabic ? "شارك تفسيرك" : "Share your explanation"}</h2>
            <p>
              {arabic
                ? "اشرح الفكرة لشخص آخر بكلماتك، ثم راجع الأدلة عند الحاجة."
                : "Explain the pattern to a partner in your own words, then return to the evidence if needed."}
            </p>
            <a
              className="button secondary"
              href="/teacher-guide.html"
              target="_blank"
              rel="noreferrer"
            >
              Open printable teacher guide
            </a>{" "}
          </div>
        )}
      </div>
      <nav className="lesson-navigation" aria-label="Lesson navigation">
        <button
          className="button secondary"
          disabled={stage === 0}
          onClick={() => {
            engine.stop();
            setStage(stage - 1);
          }}
        >
          Previous step
        </button>
        <span> {stage + 1} / 4 </span>
        <button
          className="button primary"
          onClick={() => {
            engine.stop();
            if (stage === 3) window.location.hash = "study";
            else setStage(stage + 1);
          }}
        >
          {stage === 3 ? "Continue" : "Next step"}
        </button>
      </nav>
    </section>
  );
}
