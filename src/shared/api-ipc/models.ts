import { z } from 'zod';

export const MODELS_FETCH = 'models:fetch';
export const MODELS_WRITE = 'models:write';

export const ModelSchema = z.object({
  name: z.string(),
  parameters: z.string(),
  size: z.string().optional(),
  tasks: z.array(
    z.enum(['reasoning', 'coding', 'math', 'data-analysis', 'creative-writing', 'general']),
  ),
  modelTag: z.string(),
});

export const SystemModelsSchema = z.object({
  description: z.string(),
  minimumAvailableMemory: z.number(),
  models: z.array(ModelSchema),
});

export const ModelsListSchema = z.object({
  version: z.number().gt(0),
  models: z.object({
    light: SystemModelsSchema,
    medium: SystemModelsSchema,
    heavy: SystemModelsSchema,
  }),
});

export type ModelsList = z.infer<typeof ModelsListSchema>;
export type SystemModels = z.infer<typeof SystemModelsSchema>;
export type Model = z.infer<typeof ModelSchema>;

export const MODELS_URL =
  'https://raw.githubusercontent.com/wearetriple/local-llm-desktop/refs/heads/main/src/main/api-ipc/models/fallback.json';
