import { defineCollection } from 'astro:content';
import { z } from 'astro:schema';
import { glob } from 'astro/loaders';

// One YAML file per item under src/content/<collection>/. Adding an entry is
// "drop a file"; the schema forces all four locales so a half-translated item
// fails the build instead of shipping. `image` is a public /images/pages/ id
// and `href`/`story` are the outbound links.
const i18n = z.object({ ko: z.string(), en: z.string(), ja: z.string(), zh: z.string() });

const news = defineCollection({
  loader: glob({ pattern: '**/*.yaml', base: './src/content/news' }),
  schema: z.object({
    // Display string as on the source article; validated so a typo fails the
    // build instead of sorting wrong (News parses it as YYYY-M-D).
    date: z
      .string()
      .regex(/^\d{4}\/\d{1,2}\/\d{1,2}$/, 'date must be "YYYY/M/D", e.g. "2026/3/25"'),
    image: z.string().min(1),
    href: z.string().url(),
    title: i18n,
  }),
});

const colleagues = defineCollection({
  loader: glob({ pattern: '**/*.yaml', base: './src/content/colleagues' }),
  schema: z.object({
    order: z.number().int().positive(), // ascending display order
    showOnPeoplePage: z.boolean().default(true),
    image: z.string().min(1),
    story: z.string().url(),
    role: i18n,
    quote: i18n,
  }),
});

export const collections = { news, colleagues };
