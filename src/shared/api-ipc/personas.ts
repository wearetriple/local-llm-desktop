import { z } from 'zod';

export const PersonaSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  prompt: z.string(),
});
export const PersonasSchema = z.array(PersonaSchema);

export type Persona = z.infer<typeof PersonaSchema>;

export const PERSONAS_GET = 'personas:get';
export const PERSONAS_WRITE = 'personas:write';
