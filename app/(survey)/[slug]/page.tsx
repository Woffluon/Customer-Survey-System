import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getSurveyResult } from '@/survey/lib/get-survey';
import { SurveyForm } from '@/survey/components/survey-form';
import { JsonLd } from '@/survey/components/json-ld';
import { InactiveSurvey } from '@/survey/components/inactive-survey';
import { BASE_URL } from '@/survey/lib/config';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const result = await getSurveyResult(resolvedParams.slug);

  if (result.status === 'not_found' || !result.survey) {
    return {
      title: 'Anket Bulunamadı | Efe Arabacı',
      description: 'İstenen anket bulunamadı veya süresi doldu.',
      robots: { index: false, follow: false },
    };
  }

  const { survey } = result;
  const canonicalUrl = `${BASE_URL}/${survey.token}`;

  return {
    title: survey.title,
    description:
      survey.description ||
      `${survey.title} - Efe Arabacı (Full-Stack Developer & UI/UX Specialist) müşteri geri bildirim ve keşif anketi.`,
    authors: [{ name: 'Efe Arabacı', url: BASE_URL }],
    creator: 'Efe Arabacı',
    robots: {
      index: true,
      follow: true,
    },
    openGraph: {
      type: 'article',
      locale: 'tr_TR',
      alternateLocale: 'en_US',
      url: canonicalUrl,
      title: `${survey.title} | Efe Arabacı`,
      description:
        survey.description ||
        `${survey.title} - Efe Arabacı (Full-Stack Developer & UI/UX Specialist) müşteri geri bildirim ve keşif anketi.`,
      siteName: 'Efe Arabacı - Müşteri Anket Sistemi',
      images: [
        {
          url: `${BASE_URL}/og?title=${encodeURIComponent(survey.title)}`,
          width: 1200,
          height: 630,
          alt: survey.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${survey.title} | Efe Arabacı`,
      description: survey.description || `${survey.title} - Efe Arabacı`,
      creator: '@efearabaci',
      images: [`${BASE_URL}/og?title=${encodeURIComponent(survey.title)}`],
    },
    alternates: {
      canonical: canonicalUrl,
    },
  };
}

export default async function DirectSurveyPage({ params }: PageProps) {
  const resolvedParams = await params;
  const result = await getSurveyResult(resolvedParams.slug);

  if (result.status === 'not_found') {
    notFound();
  }

  if (result.status === 'inactive') {
    return <InactiveSurvey messageKey="survey.inactive" />;
  }

  if (result.status === 'expired') {
    return <InactiveSurvey messageKey="survey.expired" />;
  }

  const { survey } = result;

  const surveySchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: survey.title,
    description: survey.description,
    url: `${BASE_URL}/${survey.token}`,
    author: {
      '@type': 'Person',
      name: 'Efe Arabacı',
      jobTitle: 'Full-Stack Developer & UI/UX Specialist',
      url: BASE_URL,
    },
    mainEntity: {
      '@type': 'Quiz',
      name: survey.title,
      description: survey.description,
      numberOfQuestions: survey.questions?.length || 0,
      educationalUse: 'Client Feedback & Onboarding Discovery',
    },
  };

  return (
    <>
      <JsonLd data={surveySchema} />
      <SurveyForm config={survey} />
    </>
  );
}
