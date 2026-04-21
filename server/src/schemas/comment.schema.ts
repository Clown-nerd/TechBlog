import { z } from 'zod';

export const CreateCommentSchema = z.object({
  article_id: z.number().int().positive('Article ID must be a positive integer'),
  body: z.string().min(1, 'Comment body cannot be empty').max(2000, 'Comment is too long'),
  parent_comment_id: z.number().int().positive().optional(),
});

export type CreateCommentInput = z.infer<typeof CreateCommentSchema>;
