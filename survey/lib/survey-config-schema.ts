import { z } from 'zod';

const localizedStringSchema = z.object({
  tr: z.string().min(1),
  en: z.string().min(1),
});

const questionOptionSchema = z.object({
  id: z.string().min(1),
  label: localizedStringSchema,
});

const questionSchema = z.discriminatedUnion('type', [
  z.object({
    id: z.string().min(1),
    type: z.literal('short_text'),
    label: localizedStringSchema,
    required: z.boolean(),
  }),
  z.object({
    id: z.string().min(1),
    type: z.literal('long_text'),
    label: localizedStringSchema,
    required: z.boolean(),
  }),
  z.object({
    id: z.string().min(1),
    type: z.literal('single_choice'),
    label: localizedStringSchema,
    required: z.boolean(),
    options: z.array(questionOptionSchema).min(1),
  }),
  z.object({
    id: z.string().min(1),
    type: z.literal('multi_choice'),
    label: localizedStringSchema,
    required: z.boolean(),
    options: z.array(questionOptionSchema).min(1),
  }),
  z.object({
    id: z.string().min(1),
    type: z.literal('rating'),
    label: localizedStringSchema,
    required: z.boolean(),
    min: z.number().int(),
    max: z.number().int(),
  }),
]);

export const surveyConfigSchema = z.object({
  token: z.string().min(1),
  title: z.string().min(1),
  description: z.string(),
  defaultLanguage: z.enum(['tr', 'en']),
  active: z.boolean(),
  expiresAt: z.string().nullable(),
  respondent: z.object({
    collectName: z.boolean(),
    collectEmail: z.boolean(),
    collectCompany: z.boolean(),
  }),
  questions: z.array(questionSchema).min(1),
});
