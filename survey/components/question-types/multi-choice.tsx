'use client';

import { MultiChoiceQuestion, Language } from '../../lib/types';
import { cn } from '../../lib/utils';

interface MultiChoiceProps {
  question: MultiChoiceQuestion;
  value: string[];
  onChange: (val: string[]) => void;
  error?: string | null;
  language: Language;
}

export function MultiChoice({
  question,
  value = [],
  onChange,
  error,
  language,
}: MultiChoiceProps) {
  const legendId = `legend-${question.id}`;
  const errorId = `error-${question.id}`;
  const labelText = question.label[language] || question.label['tr'];

  const toggleOption = (optionId: string) => {
    const currentValues = Array.isArray(value) ? value : [];
    if (currentValues.includes(optionId)) {
      onChange(currentValues.filter((id) => id !== optionId));
    } else {
      onChange([...currentValues, optionId]);
    }
  };

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

      <div className="space-y-2">
        {question.options.map((option) => {
          const optionLabel = option.label[language] || option.label['tr'];
          const isSelected = Array.isArray(value) && value.includes(option.id);

          return (
            <label
              key={option.id}
              className={cn(
                'flex items-center p-3.5 rounded-xl border border-border bg-background cursor-pointer transition-all hover:border-foreground/30',
                isSelected && 'border-foreground/60 bg-foreground/5'
              )}
            >
              <input
                type="checkbox"
                name={`question-${question.id}`}
                value={option.id}
                checked={isSelected}
                onChange={() => toggleOption(option.id)}
                className="w-4 h-4 text-accent border-border accent-accent rounded-xs focus:ring-accent"
              />
              <span className="ml-3 text-sm sm:text-base font-normal text-foreground">
                {optionLabel}
              </span>
            </label>
          );
        })}
      </div>

      {error && (
        <p id={errorId} className="text-xs text-accent font-mono mt-1">
          {error}
        </p>
      )}
    </fieldset>
  );
}
