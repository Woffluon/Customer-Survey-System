'use client';

import { RatingQuestion, Language } from '../../lib/types';
import { cn } from '../../lib/utils';

interface RatingScaleProps {
  question: RatingQuestion;
  value: number | null;
  onChange: (val: number) => void;
  error?: string | null;
  language: Language;
}

export function RatingScale({
  question,
  value,
  onChange,
  error,
  language,
}: RatingScaleProps) {
  const legendId = `legend-${question.id}`;
  const errorId = `error-${question.id}`;
  const labelText = question.label[language] || question.label['tr'];

  const numbers: number[] = [];
  for (let i = question.min; i <= question.max; i++) {
    numbers.push(i);
  }

  return (
    <fieldset
      aria-describedby={error ? errorId : undefined}
      className="space-y-3 border-none p-0 m-0"
    >
      <legend
        id={legendId}
        className="block font-medium text-sm sm:text-base leading-snug mb-2"
      >
        {labelText}
        {question.required && <span className="text-accent ml-1" aria-hidden="true">*</span>}
      </legend>

      <div className="flex flex-wrap gap-2 sm:gap-2.5">
        {numbers.map((num) => {
          const isSelected = value === num;

          return (
            <button
              key={num}
              type="button"
              onClick={() => onChange(num)}
              className={cn(
                'flex-1 min-w-[38px] h-11 rounded-xl border border-border bg-background font-mono font-medium text-sm transition-all focus:outline-none hover:border-foreground/40',
                isSelected
                  ? 'bg-foreground text-background border-foreground'
                  : 'text-foreground'
              )}
              aria-label={`Rating ${num}`}
              aria-pressed={isSelected}
            >
              {num}
            </button>
          );
        })}
      </div>

      <div className="flex justify-between text-xs text-muted font-mono px-1">
        <span>{question.min} ({language === 'en' ? 'Lowest' : 'En Düşük'})</span>
        <span>{question.max} ({language === 'en' ? 'Highest' : 'En Yüksek'})</span>
      </div>

      {error && (
        <p id={errorId} className="text-xs text-accent font-mono mt-1">
          {error}
        </p>
      )}
    </fieldset>
  );
}
