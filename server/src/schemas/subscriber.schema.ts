import { z } from 'zod';

export const SubscribeSchema = z.object({
  email:             z.string().email(),
  first_name:        z.string().min(1).max(100).optional(),
  last_name:         z.string().min(1).max(100).optional(),
  topic_preferences: z.array(z.string()).default([]),
});

export type SubscribeInput = z.infer<typeof SubscribeSchema>;
