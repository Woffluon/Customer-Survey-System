import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Efe Arabacı - Müşteri Anket & Geri Bildirim Sistemi',
    short_name: 'Efe Arabacı Anket',
    description:
      'Full-Stack Developer & UI/UX Specialist Efe Arabacı editoryal müşteri keşif ve geri bildirim sistemi.',
    start_url: '/',
    display: 'standalone',
    background_color: '#09090b',
    theme_color: '#09090b',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
    ],
  };
}
