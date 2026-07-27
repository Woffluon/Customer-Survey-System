import fs from 'fs';
import path from 'path';
import { SurveyConfig } from './types';
import { surveyConfigSchema } from './survey-config-schema';

export async function getSurvey(slug: string): Promise<SurveyConfig | null> {
  if (!slug) return null;

  try {
    const surveysDir = path.join(process.cwd(), 'survey', 'data', 'surveys');
    const safeSlug = path.basename(slug, '.json');
    const filePath = path.join(surveysDir, `${safeSlug}.json`);

    if (!fs.existsSync(filePath)) {
      return null;
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    let json: unknown;
    try {
      json = JSON.parse(content);
    } catch {
      console.error(`Invalid JSON in file ${safeSlug}.json`);
      return null;
    }

    const parseResult = surveyConfigSchema.safeParse(json);
    if (!parseResult.success) {
      console.error(`Invalid survey config schema in file ${safeSlug}.json:`, parseResult.error);
      return null;
    }

    const survey = parseResult.data as SurveyConfig;

    if (!survey.active) {
      return null;
    }

    if (survey.expiresAt) {
      const expirationDate = new Date(survey.expiresAt);
      if (isNaN(expirationDate.getTime()) || expirationDate.getTime() < Date.now()) {
        return null;
      }
    }

    return survey;
  } catch (error) {
    console.error('Error reading survey file:', error);
    return null;
  }
}
