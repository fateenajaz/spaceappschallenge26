import { questions } from "../data/study";
import type { KnowledgeAnswers } from "../types/study";
import { useId } from "react";
export function KnowledgeQuestions({
  answers,
  onChange,
}: {
  answers: KnowledgeAnswers;
  onChange: (a: KnowledgeAnswers) => void;
}) {
  const id = useId();
  return (
    <div className="knowledge-questions">
      {questions.map((q) => (
        <fieldset key={q.id}>
          <legend>{q.prompt}</legend>
          {q.options.map(([value, label]) => (
            <label className="study-radio" key={value}>
              <input
                required
                type="radio"
                name={`${id}-${q.id}`}
                value={value}
                checked={answers[q.id] === value}
                onChange={() => onChange({ ...answers, [q.id]: value })}
              />
              {label}
            </label>
          ))}
        </fieldset>
      ))}
    </div>
  );
}
