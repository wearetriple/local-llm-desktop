import { z } from 'zod';

export const CONFIGURATION_GET = 'configuration:get';
export const CONFIGURATION_WRITE = 'configuration:write';

// Define the Zod schema matching our configuration type
export const ConfigurationSchema = z.object({
  system: z.enum(['light', 'medium', 'heavy']),
  tasks: z.array(z.enum(['reasoning', 'coding', 'data-analysis', 'creative-writing', 'general'])),
});

export type Configuration = z.infer<typeof ConfigurationSchema>;
