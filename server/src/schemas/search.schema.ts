import { z } from 'zod';

export const SearchQuerySchema = z.object({
  q:        z.string().min(2, { message: 'Query must be at least 2 characters' }),
  category: z.string().optional(),
  page:     z.coerce.number().int().min(1).default(1),
  limit:    z.coerce.number().int().min(1).max(50).default(20),
});

export type SearchQuery = z.infer<typeof SearchQuerySchema>;
