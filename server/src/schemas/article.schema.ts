import { z } from 'zod';

// ------------------------------------------------------------------
// Shared
// ------------------------------------------------------------------
const statusEnum = z.enum(['draft', 'published', 'archived']);
const sortFieldEnum = z.enum(['published_at', 'view_count']);
const sortDirEnum = z.enum(['asc', 'desc']);

// ------------------------------------------------------------------
// Query / list params
// ------------------------------------------------------------------
export const ArticleListQuerySchema = z.object({
  page:        z.coerce.number().int().min(1).default(1),
  limit:       z.coerce.number().int().min(1).max(50).default(10),
  category:    z.string().optional(),           // category slug
  tag:         z.string().optional(),           // tag slug
  status:      statusEnum.optional(),
  sort:        sortFieldEnum.default('published_at'),
  dir:         sortDirEnum.default('desc'),
});

export type ArticleListQuery = z.infer<typeof ArticleListQuerySchema>;

// ------------------------------------------------------------------
// Create
// ------------------------------------------------------------------
export const CreateArticleSchema = z.object({
  title:                z.string().min(3).max(300),
  slug:                 z.string().min(3).max(320).regex(/^[a-z0-9-]+$/, {
                          message: 'slug must be lowercase, alphanumeric with hyphens',
                        }),
  excerpt:              z.string().max(500).optional(),
  body:                 z.string().min(1),
  cover_image_url:      z.string().url().optional(),
  youtube_video_id:     z.string().max(20).optional().nullable(),  // raw ID only
  status:               statusEnum.default('draft'),
  reading_time_minutes: z.number().int().min(1).default(1),
  author_id:            z.number().int().positive(), // references users.id
  category_id:          z.number().int().positive().optional().nullable(),
  tag_ids:              z.array(z.number().int().positive()).default([]),
});

export type CreateArticleInput = z.infer<typeof CreateArticleSchema>;

// ------------------------------------------------------------------
// Update (all fields optional except what you explicitly want required)
// ------------------------------------------------------------------
export const UpdateArticleSchema = CreateArticleSchema.partial().omit({ slug: true });

export type UpdateArticleInput = z.infer<typeof UpdateArticleSchema>;
