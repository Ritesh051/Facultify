"use client";

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Question, SubmissionAnswer } from "@/lib/types";

interface QuestionDisplayProps {
  question: Question;
  answer: SubmissionAnswer | undefined;
  onAnswer: (answer: SubmissionAnswer) => void;
  questionNumber: number;
  totalQuestions: number;
}

const difficultyColor: Record<string, string> = {
  easy: "bg-green-100 text-green-700 border-green-200",
  medium: "bg-yellow-100 text-yellow-700 border-yellow-200",
  hard: "bg-red-100 text-red-700 border-red-200",
};

export default function QuestionDisplay({
  question,
  answer,
  onAnswer,
  questionNumber,
  totalQuestions,
}: QuestionDisplayProps) {
  const buildAnswer = (partial: Partial<SubmissionAnswer>): SubmissionAnswer => ({
    questionId: question.id,
    timeSpentSeconds: answer?.timeSpentSeconds ?? 0,
    ...partial,
  });

  return (
    <div className="space-y-6">
      {/* Meta row */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium text-muted-foreground">
          Question {questionNumber} of {totalQuestions}
        </span>
        <Badge
          className={cn(
            "text-xs capitalize border",
            difficultyColor[question.difficulty]
          )}
        >
          {question.difficulty}
        </Badge>
        <Badge variant="outline" className="text-xs">
          {question.marks} {question.marks === 1 ? "mark" : "marks"}
        </Badge>
        <Badge variant="secondary" className="text-xs capitalize">
          {question.type === "true_false"
            ? "True / False"
            : question.type === "mcq"
            ? "MCQ"
            : "Written"}
        </Badge>
      </div>

      {/* Question text */}
      <p className="text-lg font-medium leading-relaxed text-foreground">
        {question.text}
      </p>

      {/* MCQ */}
      {question.type === "mcq" && question.options && (
        <RadioGroup
          value={answer?.selectedOptionId ?? ""}
          onValueChange={(val) =>
            onAnswer(buildAnswer({ selectedOptionId: val }))
          }
          className="space-y-3"
        >
          {question.options.map((option) => (
            <label
              key={option.id}
              htmlFor={`option-${option.id}`}
              className={cn(
                "flex items-center gap-4 px-5 py-4 rounded-xl border-2 cursor-pointer transition-all duration-150",
                answer?.selectedOptionId === option.id
                  ? "border-blue-500 bg-blue-50 text-blue-800"
                  : "border-border bg-white hover:border-blue-300 hover:bg-blue-50/40"
              )}
            >
              <RadioGroupItem value={option.id} id={`option-${option.id}`} />
              <span className="text-base">{option.text}</span>
            </label>
          ))}
        </RadioGroup>
      )}

      {/* True / False */}
      {question.type === "true_false" && question.options && (
        <div className="flex gap-4">
          {question.options.map((option) => {
            const selected = answer?.selectedOptionId === option.id;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() =>
                  onAnswer(buildAnswer({ selectedOptionId: option.id }))
                }
                className={cn(
                  "flex-1 py-6 rounded-2xl border-2 text-lg font-semibold transition-all duration-150",
                  selected
                    ? "border-blue-500 bg-blue-500 text-white shadow-md"
                    : "border-border bg-white text-foreground hover:border-blue-400 hover:bg-blue-50"
                )}
              >
                {option.text}
              </button>
            );
          })}
        </div>
      )}

      {/* Text / Written */}
      {question.type === "text" && (
        <div className="space-y-2">
          <Label className="text-sm text-muted-foreground">Your Answer</Label>
          <Textarea
            placeholder="Type your answer here..."
            className="min-h-[160px] resize-y text-base"
            value={answer?.textAnswer ?? ""}
            onChange={(e) =>
              onAnswer(buildAnswer({ textAnswer: e.target.value }))
            }
          />
        </div>
      )}
    </div>
  );
}
