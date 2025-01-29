import { z } from 'zod';

export const messageSchema = z.object({
  role: z.enum(['user', 'assistant', 'system']),
  content: z.string().min(1),
  timestamp: z.string().nonempty(),
  documentsUsed: z.array(z.object({ knowledgeSetId: z.string(), file: z.string() })).optional(),
});

export const conversationSchema = z
  .object({
    id: z.string().uuid(),
    title: z.string().optional(),
    messages: z.array(messageSchema),
    createdAt: z.string().nonempty(),
    updatedAt: z.string().nonempty(),
  })
  .refine((data) => data.updatedAt >= data.createdAt, {
    message: 'updatedAt must be greater than or equal to createdAt',
  });

export type Message = z.infer<typeof messageSchema>;
export type Conversation = z.infer<typeof conversationSchema>;
