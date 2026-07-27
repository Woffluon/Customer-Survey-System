'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, ChevronLeft, ChevronRight, Send } from 'lucide-react';
import { SurveyConfig } from '../lib/types';
import { buildSurveySchema } from '../lib/survey-schema';
import { useTranslation } from '../i18n/use-translation';
import { TurnstileWidget } from './turnstile-widget';
import { ShortText } from './question-types/short-text';
import { LongText } from './question-types/long-text';
import { SingleChoice } from './question-types/single-choice';
import { MultiChoice } from './question-types/multi-choice';
import { RatingScale } from './question-types/rating-scale';
import { SmoothInput } from './smooth-input';
import { cn } from '../lib/utils';

interface SurveyFormProps {
  config: SurveyConfig;
}

export function SurveyForm({ config }: SurveyFormProps) {
  const { t, language } = useTranslation();
  const router = useRouter();

  const allQuestions = config.questions;
  const hasRespondentFields =
    config.respondent.collectName ||
    config.respondent.collectEmail ||
    config.respondent.collectCompany;

  const questionStartIndex = hasRespondentFields ? 1 : 0;
  const totalDisplaySteps = allQuestions.length + (hasRespondentFields ? 1 : 0);

  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, unknown>>({});
  const [respondent, setRespondent] = useState<{ name?: string; email?: string; company?: string }>({});
  const [honeypot, setHoneypot] = useState('');
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isRespondentStep = hasRespondentFields && currentStep === 0;
  const currentQuestion = isRespondentStep ? null : allQuestions[currentStep - questionStartIndex];
  const progressPercentage = Math.round(((currentStep + 1) / totalDisplaySteps) * 100);
  const isLastStep = currentStep === totalDisplaySteps - 1;

  const clearError = (key: string) =>
    setErrors((prev) => { const n = { ...prev }; delete n[key]; return n; });

  const handleAnswerChange = (questionId: string, value: unknown) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
    clearError(questionId);
  };

  const handleRespondentChange = (field: 'name' | 'email' | 'company', value: string) => {
    setRespondent((prev) => ({ ...prev, [field]: value }));
    clearError('respondent_' + field);
  };

  const validateCurrentStep = (): boolean => {
    const schema = buildSurveySchema(config);
    const dataToValidate: Record<string, unknown> = { ...answers };
    if (isRespondentStep) {
      if (config.respondent.collectName) dataToValidate['respondent_name'] = respondent.name || '';
      if (config.respondent.collectEmail) dataToValidate['respondent_email'] = respondent.email || '';
      if (config.respondent.collectCompany) dataToValidate['respondent_company'] = respondent.company || '';
    }
    const result = schema.safeParse(dataToValidate);
    if (!result.success) {
      const stepErrors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const path = issue.path[0] as string;
        if (
          (isRespondentStep && path.startsWith('respondent_')) ||
          (currentQuestion && path === currentQuestion.id)
        ) {
          stepErrors[path] = issue.message === 'required' ? t('form.required')
            : issue.message === 'invalid_email' ? t('errors.validation')
            : issue.message;
        }
      }
      if (Object.keys(stepErrors).length > 0) {
        setErrors((prev) => ({ ...prev, ...stepErrors }));
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateCurrentStep()) setCurrentStep((p) => Math.min(p + 1, totalDisplaySteps - 1));
  };

  const handlePrevious = () => setCurrentStep((p) => Math.max(p - 1, 0));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGlobalError(null);
    const schema = buildSurveySchema(config);
    const dataToValidate: Record<string, unknown> = { ...answers };
    if (config.respondent.collectName) dataToValidate['respondent_name'] = respondent.name || '';
    if (config.respondent.collectEmail) dataToValidate['respondent_email'] = respondent.email || '';
    if (config.respondent.collectCompany) dataToValidate['respondent_company'] = respondent.company || '';
    const validation = schema.safeParse(dataToValidate);
    if (!validation.success) {
      const formErrors: Record<string, string> = {};
      for (const issue of validation.error.issues) {
        const path = issue.path[0] as string;
        formErrors[path] = issue.message === 'required' ? t('form.required')
          : issue.message === 'invalid_email' ? t('errors.validation')
          : issue.message;
      }
      setErrors(formErrors);
      setGlobalError(t('errors.validation'));
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/survey/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          surveyToken: config.token,
          surveySlug: config.token,
          turnstileToken: turnstileToken || 'dummy_token',
          honeypot,
          respondent,
          answers,
        }),
      });
      const responseData = await res.json();
      if (!res.ok || !responseData.success) {
        if (res.status === 429) setGlobalError(t('errors.rateLimited'));
        else if (res.status === 403) setGlobalError(t('errors.turnstile'));
        else if (responseData.fieldErrors) {
          setErrors(responseData.fieldErrors);
          setGlobalError(t('errors.validation'));
        } else {
          setGlobalError(t('errors.network'));
        }
        setIsSubmitting(false);
        return;
      }
      router.push(responseData.redirect || '/thank-you');
    } catch {
      setGlobalError(t('errors.network'));
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full">
      {/* Survey title */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground mb-2 leading-tight">
          {config.title}
        </h1>
        {config.description && (
          <p className="text-muted text-sm sm:text-base leading-relaxed max-w-xl">{config.description}</p>
        )}
      </div>

      {/* Slim progress bar */}
      <div className="mb-8 space-y-2">
        <div className="flex justify-between items-center text-xs font-mono text-muted">
          <span>{currentStep + 1} / {totalDisplaySteps}</span>
          <span>{progressPercentage}%</span>
        </div>
        <div className="w-full h-px bg-border overflow-hidden">
          <div
            className="h-full bg-foreground transition-all duration-500 ease-out"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Honeypot */}
      <div style={{ position: 'absolute', left: '-9999px', opacity: 0 }} aria-hidden="true">
        <label htmlFor="website_hp_field">Website</label>
        <input id="website_hp_field" type="text" name="website_hp_field" tabIndex={-1}
          autoComplete="off" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} />
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <div className="bg-surface/80 backdrop-blur-sm border border-border rounded-2xl p-6 sm:p-8 shadow-sm">

          {globalError && (
            <div className="mb-6 px-4 py-3 rounded-lg border border-accent/30 bg-accent/5 text-accent text-sm font-mono">
              {globalError}
            </div>
          )}

          {/* Respondent step */}
          {isRespondentStep && (
            <div className="space-y-5">
              <p className="text-xs font-mono uppercase tracking-wider text-muted mb-4">
                {t('respondent.title')}
              </p>
              {config.respondent.collectName && (
                <div className="space-y-1.5">
                  <label htmlFor="respondent_name" className="block text-sm font-medium">
                    {t('respondent.name')} <span className="text-accent">*</span>
                  </label>
                  <SmoothInput id="respondent_name" type="text" value={respondent.name || ''}
                    onChange={(e) => handleRespondentChange('name', e.target.value)}
                    className={errors['respondent_name'] ? 'border-accent' : undefined} />
                  {errors['respondent_name'] && (
                    <p className="text-xs text-accent font-mono mt-1">{errors['respondent_name']}</p>
                  )}
                </div>
              )}
              {config.respondent.collectEmail && (
                <div className="space-y-1.5">
                  <label htmlFor="respondent_email" className="block text-sm font-medium">
                    {t('respondent.email')} <span className="text-accent">*</span>
                  </label>
                  <SmoothInput id="respondent_email" type="email" value={respondent.email || ''}
                    onChange={(e) => handleRespondentChange('email', e.target.value)}
                    className={errors['respondent_email'] ? 'border-accent' : undefined} />
                  {errors['respondent_email'] && (
                    <p className="text-xs text-accent font-mono mt-1">{errors['respondent_email']}</p>
                  )}
                </div>
              )}
              {config.respondent.collectCompany && (
                <div className="space-y-1.5">
                  <label htmlFor="respondent_company" className="block text-sm font-medium">
                    {t('respondent.company')}
                  </label>
                  <SmoothInput id="respondent_company" type="text" value={respondent.company || ''}
                    onChange={(e) => handleRespondentChange('company', e.target.value)} />
                </div>
              )}
            </div>
          )}

          {/* Question step */}
          {currentQuestion && (() => {
            const error = errors[currentQuestion.id] || null;
            const value = answers[currentQuestion.id];
            switch (currentQuestion.type) {
              case 'short_text':
                return <ShortText key={currentQuestion.id} question={currentQuestion}
                  value={typeof value === 'string' ? value : ''}
                  onChange={(v) => handleAnswerChange(currentQuestion.id, v)} error={error} language={language} />;
              case 'long_text':
                return <LongText key={currentQuestion.id} question={currentQuestion}
                  value={typeof value === 'string' ? value : ''}
                  onChange={(v) => handleAnswerChange(currentQuestion.id, v)} error={error} language={language} />;
              case 'single_choice':
                return <SingleChoice key={currentQuestion.id} question={currentQuestion}
                  value={typeof value === 'string' ? value : ''}
                  onChange={(v) => handleAnswerChange(currentQuestion.id, v)} error={error} language={language} />;
              case 'multi_choice':
                return <MultiChoice key={currentQuestion.id} question={currentQuestion}
                  value={Array.isArray(value) ? value : []}
                  onChange={(v) => handleAnswerChange(currentQuestion.id, v)} error={error} language={language} />;
              case 'rating':
                return <RatingScale key={currentQuestion.id} question={currentQuestion}
                  value={typeof value === 'number' ? value : null}
                  onChange={(v) => handleAnswerChange(currentQuestion.id, v)} error={error} language={language} />;
            }
          })()}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6">
          {currentStep > 0 ? (
            <button type="button" onClick={handlePrevious} disabled={isSubmitting}
              className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium text-foreground/60 hover:text-foreground transition-colors disabled:cursor-not-allowed">
              <ChevronLeft className="w-4 h-4" />
              {t('form.previous')}
            </button>
          ) : <div />}

          {isLastStep ? (
            <button type="submit" disabled={isSubmitting || !turnstileToken}
              className="flex items-center gap-2 px-6 py-2.5 bg-foreground text-background text-sm font-medium rounded-xl transition-all hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50">
              {isSubmitting
                ? <><Loader2 className="w-4 h-4 animate-spin" />{t('form.submitting')}</>
                : <>{t('form.submit')}<Send className="w-4 h-4" /></>}
            </button>
          ) : (
            <button type="button" onClick={handleNext}
              className="flex items-center gap-1.5 px-6 py-2.5 bg-foreground text-background text-sm font-medium rounded-xl transition-all hover:opacity-90 active:scale-[0.98]">
              {t('form.next')}
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </form>

      {/* Render TurnstileWidget outside the form to prevent auto-submission triggers */}
      {isLastStep && (
        <div className="mt-6 flex justify-center">
          <TurnstileWidget
            onSuccess={(token) => setTurnstileToken(token)}
            onExpire={() => setTurnstileToken(null)}
            onError={() => setTurnstileToken(null)}
          />
        </div>
      )}
    </div>
  );
}