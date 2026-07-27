import { z } from 'zod';
import { SurveyConfig } from './types';

export function buildSurveySchema(config: SurveyConfig) {
  const shape: Record<string, z.ZodTypeAny> = {};

  if (config.respondent.collectName) {
    shape['respondent_name'] = z.string().trim().min(1, 'required');
  }
  if (config.respondent.collectEmail) {
    shape['respondent_email'] = z.string().trim().email('invalid_email');
  }
  if (config.respondent.collectCompany) {
    shape['respondent_company'] = z.string().optional();
  }

  for (const question of config.questions) {
    switch (question.type) {
      case 'short_text': {
        shape[question.id] = question.required
          ? z.string().trim().min(1, 'required').max(500, 'max_length')
          : z.string().trim().max(500, 'max_length').optional();
        break;
      }
      case 'long_text': {
        shape[question.id] = question.required
          ? z.string().trim().min(1, 'required').max(2000, 'max_length')
          : z.string().trim().max(2000, 'max_length').optional();
        break;
      }
      case 'single_choice': {
        const optionIds = question.options.map((o) => o.id);
        if (optionIds.length > 0) {
          const enumSchema = z.enum(optionIds as [string, ...string[]]);
          shape[question.id] = question.required
            ? enumSchema
            : enumSchema.optional().or(z.literal(''));
        } else {
          shape[question.id] = z.string().optional();
        }
        break;
      }
      case 'multi_choice': {
        const optionIds = question.options.map((o) => o.id);
        if (optionIds.length > 0) {
          const enumSchema = z.enum(optionIds as [string, ...string[]]);
          const arraySchema = z.array(enumSchema);
          shape[question.id] = question.required
            ? arraySchema.min(1, 'required')
            : arraySchema.optional();
        } else {
          shape[question.id] = z.array(z.string()).optional();
        }
        break;
      }
      case 'rating': {
        shape[question.id] = question.required
          ? z.number().int().min(question.min, 'out_of_range').max(question.max, 'out_of_range')
          : z.number().int().min(question.min, 'out_of_range').max(question.max, 'out_of_range').optional();
        break;
      }
    }
  }

  return z.object(shape);
}
