import { ChoiceCard } from "../components/ChoiceCard";
import type { Question } from "../types";
import type { ProductWizard } from "../useProductWizard";

type QuestionStepProps = {
  wizard: ProductWizard;
  question: Question;
};

export function QuestionStep({ wizard, question }: QuestionStepProps) {
  const { state, dispatch, goNext } = wizard;
  const answer = state.answers[question.id];

  return (
    <div className="space-y-3">
      {question.choices.map((choice) => (
        <ChoiceCard
          key={choice.key}
          emoji={choice.emoji}
          label={choice.label}
          description={choice.description}
          selected={answer === choice.key}
          onSelect={() => {
            dispatch({ type: "SET_ANSWER", questionId: question.id, choiceKey: choice.key });
            window.setTimeout(goNext, 220);
          }}
        />
      ))}
    </div>
  );
}
