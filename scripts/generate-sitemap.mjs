// Generates public/sitemap.xml from the live product + case-study data so
// recruiter crawlers see every piece and every engineering-log entry without
// hand-editing the sitemap each time. Wired into `npm run build`.

import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { writeFileSync } from 'node:fs';

import products from '../server/data/products.js';
import caseStudies from '../src/data/caseStudies.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const SITE = 'https://www.mettaire.com';

const staticPaths = ['/', '/about', '/gallery', '/engineering'];

const urls = [
  ...staticPaths.map((p) => ({ loc: `${SITE}${p}`, priority: p === '/' ? '1.0' : '0.8' })),
  ...products.map((p) => ({ loc: `${SITE}/gallery/${p.id}`, priority: '0.6' })),
  ...caseStudies.map((c) => ({ loc: `${SITE}/engineering/${c.id}`, priority: '0.7' })),
];

const body = urls
  .map(({ loc, priority }) =>
    `  <url>\n    <loc>${loc}</loc>\n    <changefreq>monthly</changefreq>\n    <priority>${priority}</priority>\n  </url>`,
  )
  .join('\n');

const xml =
  `<?xml version="1.0" encoding="UTF-8"?>\n` +
  `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;

const outPath = resolve(root, 'public/sitemap.xml');
writeFileSync(outPath, xml, 'utf8');
console.log(`sitemap.xml: ${urls.length} URLs → ${outPath}`);
