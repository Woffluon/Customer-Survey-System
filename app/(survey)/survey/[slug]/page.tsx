import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getSurvey } from '@/survey/lib/get-survey';
import { SurveyForm } from '@/survey/components/survey-form';
import { JsonLd } from '@/survey/components/json-ld';

interface PageProps {
  params: Promise<{ slug: string }> | { slug: string };
}

const baseUrl = 'http://anket.xn--efearabac-3pb.com';

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const survey = await getSurvey(resolvedParams.slug);

  if (!survey) {
    return {
      title: 'Anket Bulunamadı | Efe Arabacı',
      description: 'İstenen anket bulunamadı veya süresi doldu.',
      robots: { index: false, follow: false },
    };
  }

  const canonicalUrl = `${baseUrl}/survey/${survey.token}`;

  return {
    title: survey.title,
    description:
      survey.description ||
      `${survey.title} - Efe Arabacı (Full-Stack Developer & UI/UX Specialist) müşteri geri bildirim ve keşif anketi.`,
    authors: [{ name: 'Efe Arabacı', url: baseUrl }],
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
          url: `${baseUrl}/og?title=${encodeURIComponent(survey.title)}`,
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
      images: [`${baseUrl}/og?title=${encodeURIComponent(survey.title)}`],
    },
    alternates: {
      canonical: canonicalUrl,
    },
  };
}

export default async function SurveyPage({ params }: PageProps) {
  const resolvedParams = await params;
  const survey = await getSurvey(resolvedParams.slug);

  if (!survey) {
    notFound();
  }

  const surveySchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: survey.title,
    description: survey.description,
    url: `${baseUrl}/survey/${survey.token}`,
    author: {
      '@type': 'Person',
      name: 'Efe Arabacı',
      jobTitle: 'Full-Stack Developer & UI/UX Specialist',
      url: baseUrl,
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
