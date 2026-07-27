import type { Metadata } from 'next';
import { SurveyShell } from '@/survey/components/survey-shell';
import { JsonLd } from '@/survey/components/json-ld';
import { HomeView } from '@/survey/components/home-view';
import { BASE_URL } from '@/survey/lib/config';

export const metadata: Metadata = {
  title: 'Efe Arabacı | Müşteri Anket & Geri Bildirim Platformu',
  description:
    'Full-Stack Developer & UI/UX Specialist Efe Arabacı tarafından özel dijital projelere yönelik tasarlanmış editoryal müşteri onboarding, keşif ve teslimat değerlendirme sistemi.',
  alternates: {
    canonical: BASE_URL,
  },
};

const softwareSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Efe Arabacı Isolated Client Survey System',
  operatingSystem: 'Web',
  applicationCategory: 'BusinessApplication',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'TRY',
  },
  author: {
    '@type': 'Person',
    name: 'Efe Arabacı',
    jobTitle: 'Full-Stack Developer & UI/UX Specialist',
    url: BASE_URL,
  },
  description:
    'Modern, WebGL destekli editoryal arayüzlü müşteri keşif ve geri bildirim toplama platformu.',
};

export default function HomePage() {
  return (
    <SurveyShell>
      <JsonLd data={softwareSchema} />
      <HomeView />
    </SurveyShell>
  );
}
