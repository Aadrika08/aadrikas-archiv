import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const projects = defineCollection({
  loader: glob({ base: './src/content/projects', pattern: '**/*.{md,mdx}' }),
  schema: z
    .object({
      title: z.string().min(1),
      slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
      period: z.string().min(1),
      order: z.number().int().nonnegative(),
      summary: z.string().min(1),
      featured: z.boolean().default(false),
      draft: z.boolean().default(false),
    })
    .strict(),
});

const writing = defineCollection({
  loader: glob({ base: './src/content/writing', pattern: '**/*.{md,mdx}' }),
  schema: z
    .object({
      title: z.string().min(1),
      slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
      year: z.number().int().min(1900).max(2100),
      kind: z.enum(['ESSAY', 'NOTE', 'FIELD NOTE', 'TALK', 'LIST']),
      status: z.enum(['published', 'unfinished']),
      order: z.number().int().nonnegative(),
      featured: z.boolean().default(false),
      draft: z.boolean().default(false),
      summary: z.string().min(1),
    })
    .strict(),
});

export const collections = { projects, writing };
