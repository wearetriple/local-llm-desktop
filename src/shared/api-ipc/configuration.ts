import { z } from 'zod';

export const CONFIGURATION_GET = 'configuration:get';
export const CONFIGURATION_WRITE = 'configuration:write';

// Define the Zod schema matching our configuration type
export const ConfigurationSchema = z.object({
  system: z.enum(['light', 'medium', 'heavy']),
  tasks: z.array(
    z.enum(['reasoning', 'coding', 'data-analysis', 'math', 'creative-writing', 'general']),
  ),
});

export type Configuration = z.infer<typeof ConfigurationSchema>;

export const TASK_LABELS: Record<Configuration['tasks'][number], string> = {
  reasoning: 'Reasoning',
  coding: 'Coding',
  ['data-analysis']: 'Data Analysis',
  ['creative-writing']: 'Creative Writing',
  general: 'General Chat',
  math: 'Math',
};
