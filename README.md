# Green Flow Engineers – Corporate Website

Professional corporate blog and services website for **Green Flow Engineers** — sustainable industrial engineering solutions in Kanpur, India.

## Features

- **Homepage** — Hero, services overview, CTAs, featured blog posts
- **Services** — All six service lines with print/export brochure support
- **Blog** — Six industry articles with search, categories, and tags
- **About** — Vision, mission, sustainability, Director (Mahesh Yadav)
- **Contact** — Phone, email, address, inquiry form
- **Bilingual** — English (`/en`) and Hindi (`/hi`) via [next-intl](https://next-intl.dev)
- **SEO** — Metadata, sitemap, robots.txt, industry keywords
- **Responsive** — Mobile and desktop layouts

## Tech Stack

- [Next.js 16](https://nextjs.org) (App Router)
- [Tailwind CSS 4](https://tailwindcss.com)
- [next-intl](https://next-intl.dev) for i18n
- File-based blog content (ready to connect **Strapi** or **Sanity** later)

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — middleware redirects to `/en`.

## Deploy on Vercel

1. Push this repo to GitHub.
2. Import the project at [vercel.com](https://vercel.com).
3. Set the root directory if needed; default build command: `npm run build`.

Update `metadataBase` in `src/app/layout.tsx` and `sitemap.ts` with your production domain.

## CMS Integration (Optional)

Blog posts live in `src/data/blog.ts`. To use Strapi or Sanity:

1. Create content models matching `BlogPost` in `src/data/blog.ts`.
2. Fetch posts in `src/app/[locale]/blog/page.tsx` and `[slug]/page.tsx`.
3. Keep translations in the CMS or continue using locale-specific fields.

## Contact

- **Phone:** +91 9628434151
- **Email:** greenflowengineers@gmail.com
- **Address:** PVT Plot No. 42, Colony 2, Sahkar Kanpur (U.P.) – 200817
