import React from 'react';
import { SurveyShell } from '@/survey/components/survey-shell';

export default function SurveyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SurveyShell>{children}</SurveyShell>;
}
