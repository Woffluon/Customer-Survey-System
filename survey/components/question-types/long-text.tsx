'use client';

import { LongTextQuestion, Language } from '../../lib/types';
import { SmoothTextarea } from '../smooth-input';

interface LongTextProps {
  question: LongTextQuestion;
  value: string;
  onChange: (val: string) => void;
  error?: string | null;
  language: Language;
}

export function LongText({
  question,
  value,
  onChange,
  error,
  language,
}: LongTextProps) {
  const inputId = `question-${question.id}`;
  const errorId = `error-${question.id}`;
  const labelText = question.label[language] || question.label['tr'];

  return (
    <div className="space-y-2">
      <label
        htmlFor={inputId}
        className="block font-medium text-sm sm:text-base leading-snug"
      >
        {labelText}
        {question.required && <span className="text-accent ml-1" aria-hidden="true">*</span>}
      </label>
      <SmoothTextarea
        id={inputId}
        rows={4}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        maxLength={2000}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        className={error ? 'border-accent focus:border-accent' : undefined}
      />
      {error && (
        <p id={errorId} className="text-xs text-accent font-mono mt-1">
          {error}
        </p>
      )}
    </div>
  );
}

