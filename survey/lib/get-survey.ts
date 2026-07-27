import fs from 'fs';
import path from 'path';
import { SurveyConfig } from './types';
import { surveyConfigSchema } from './survey-config-schema';

export type SurveyResult =
  | { status: 'found'; survey: SurveyConfig }
  | { status: 'not_found' }
  | { status: 'inactive'; survey?: SurveyConfig }
  | { status: 'expired'; survey?: SurveyConfig };

export async function getSurveyResult(slug: string): Promise<SurveyResult> {
  if (!slug) return { status: 'not_found' };

  try {
    const surveysDir = path.join(process.cwd(), 'survey', 'data', 'surveys');
    const safeSlug = path.basename(slug, '.json');
    const resolvedDir = path.resolve(surveysDir);
    const filePath = path.resolve(resolvedDir, `${safeSlug}.json`);

    if (!filePath.startsWith(resolvedDir)) {
      console.error('Path traversal attempt detected');
      return { status: 'not_found' };
    }

    if (!fs.existsSync(filePath)) {
      return { status: 'not_found' };
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    let json: unknown;
    try {
      json = JSON.parse(content);
    } catch {
      console.error(`Invalid JSON in file ${safeSlug}.json`);
      return { status: 'not_found' };
    }

    const parseResult = surveyConfigSchema.safeParse(json);
    if (!parseResult.success) {
      console.error(`Invalid survey config schema in file ${safeSlug}.json:`, parseResult.error);
      return { status: 'not_found' };
    }

    const survey: SurveyConfig = parseResult.data;

    if (!survey.active) {
      return { status: 'inactive', survey };
    }

    if (survey.expiresAt) {
      const expirationDate = new Date(survey.expiresAt);
      if (isNaN(expirationDate.getTime()) || expirationDate.getTime() < Date.now()) {
        return { status: 'expired', survey };
      }
    }

    return { status: 'found', survey };
  } catch (error) {
    console.error('Error reading survey file:', error);
    return { status: 'not_found' };
  }
}

export async function getSurvey(slug: string): Promise<SurveyConfig | null> {
  const result = await getSurveyResult(slug);
  return result.status === 'found' ? result.survey : null;
}
