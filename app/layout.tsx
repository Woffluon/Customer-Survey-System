import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { BASE_URL } from '@/survey/lib/config';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

function safeJsonStringify(data: unknown): string {
  return JSON.stringify(data)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026');
}

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: 'Efe Arabacı | Müşteri Anket & Geri Bildirim Sistemi',
    template: '%s | Efe Arabacı',
  },
  description:
    'Efe Arabacı (Full-Stack Developer & UI/UX Specialist) tarafından geliştirilen editoryal tasarım diline sahip müşteri keşif, onboarding ve teslimat anket sistemi.',
  keywords: [
    'Efe Arabacı',
    'Full-Stack Developer',
    'UI/UX Specialist',
    'Müşteri Anket Sistemi',
    'Customer Survey System',
    'Next.js Survey App',
    'Editorial Web Design',
    'WebGL Shader Experience',
    'Project Onboarding',
    'Yazılım Geliştirici',
  ],
  authors: [{ name: 'Efe Arabacı', url: BASE_URL }],
  creator: 'Efe Arabacı',
  publisher: 'Efe Arabacı',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'tr_TR',
    alternateLocale: 'en_US',
    url: BASE_URL,
    siteName: 'Efe Arabacı - Müşteri Anket Sistemi',
    title: 'Efe Arabacı | Müşteri Anket & Geri Bildirim Sistemi',
    description:
      'Full-Stack Developer & UI/UX Specialist Efe Arabacı için özel müşteri onboarding ve keşif anket platformu.',
    images: [
      {
        url: `${BASE_URL}/og`,
        width: 1200,
        height: 630,
        alt: 'Efe Arabacı Müşteri Anket Sistemi',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Efe Arabacı | Müşteri Anket & Geri Bildirim Sistemi',
    description:
      'Full-Stack Developer & UI/UX Specialist Efe Arabacı için özel müşteri onboarding ve keşif anket platformu.',
    creator: '@efearabaci',
    images: [`${BASE_URL}/og`],
  },
  alternates: {
    canonical: BASE_URL,
    languages: {
      'tr-TR': `${BASE_URL}`,
      'en-US': `${BASE_URL}?lang=en`,
    },
  },
};

const personSchema = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: 'Efe Arabacı',
  jobTitle: 'Full-Stack Developer & UI/UX Specialist',
  url: BASE_URL,
  sameAs: [
    'https://github.com/woffluon',
    'https://www.linkedin.com/in/efearabacı',
    'https://x.com/efearabaci_dev',
  ],
  knowsAbout: [
    'Full-Stack Development',
    'UI/UX Design',
    'Next.js',
    'TypeScript',
    'React',
    'WebGL Design',
  ],
};

const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Efe Arabacı - Müşteri Anket Sistemi',
  url: BASE_URL,
  author: {
    '@type': 'Person',
    name: 'Efe Arabacı',
  },
  inLanguage: ['tr-TR', 'en-US'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" className={`${inter.variable} ${jetbrainsMono.variable}`} suppressHydrationWarning>
      <head>
        <script
          key="theme-script"
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('survey_theme');
                  if (theme === 'light') {
                    document.documentElement.classList.remove('dark');
                  } else {
                    document.documentElement.classList.add('dark');
                  }
                  var lang = localStorage.getItem('survey_lang');
                  if (lang === 'en' || lang === 'tr') {
                    document.documentElement.setAttribute('lang', lang === 'tr' ? 'tr-TR' : 'en-US');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
        <script
          key="person-jsonld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: safeJsonStringify(personSchema) }}
        />
        <script
          key="website-jsonld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: safeJsonStringify(websiteSchema) }}
        />
      </head>

      <body className="min-h-screen bg-background text-foreground antialiased font-sans">
        {children}
      </body>
    </html>
  );
}

