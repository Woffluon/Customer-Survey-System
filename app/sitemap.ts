import { MetadataRoute } from 'next';
import fs from 'fs';
import path from 'path';

const baseUrl = 'http://anket.xn--efearabac-3pb.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const routes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1.0,
    },
  ];

  try {
    const surveysDir = path.join(process.cwd(), 'survey', 'data', 'surveys');
    if (fs.existsSync(surveysDir)) {
      const files = fs.readdirSync(surveysDir);
      for (const file of files) {
        if (file.endsWith('.json')) {
          const slug = file.replace('.json', '');
          routes.push({
            url: `${baseUrl}/${slug}`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.8,
          });
          routes.push({
            url: `${baseUrl}/survey/${slug}`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.7,
          });
        }
      }
    }
  } catch (error) {
    console.error('Error generating sitemap:', error);
  }

  return routes;
}
