# METTAIRE

**[www.mettaire.com](https://www.mettaire.com)**

METTAIRE is the personal portfolio of Daniel Nelson — a DevOps engineer at Salesforce and a visual artist. It's a single space where engineering and fine art sit side by side, both circling the same existential themes: absurdism, nihilism, and the search for meaning.

The site is built as an immersive, terminal-flavored experience rather than a résumé wall — part gallery, part engineering record.

## Tech stack

- **React 18 + Vite** single-page app
- **React Router v6** for client-side routing
- **Framer Motion** for scroll-reveal and transitions
- A single global stylesheet driven by **CSS custom properties** (theming, spacing scale, accents)
- **Express / serverless API** serving protected media from **Cloudflare R2**
- Deployed on **Vercel**

## Major features

### The Cache — gallery

The Cache is the visual archive: paintings, code, sculpture, tattoo work, and video.

- **Detail pages** for every piece — title, media, date, dimensions, description, and a full-screen lightbox.
- **Filter & sort** by year, media type, and order (recent / oldest / name).
- **Search** across title, media, collection, description, and year.
- **Viewer discretion** toggle that masks sensitive pieces behind a content warning until revealed.
- **3D coverflow carousels** — a native CSS perspective slider (autoplay, swipe, keyboard/arrow nav) used for featured works.

### Saved

Heart any piece to keep it in a personal **Saved** collection (persisted locally), with the same search, filter, and sort controls as the Cache.

### Engineering Log

A dedicated record of professional work as **STAR-format case studies** — situation, task, action, result — covering DevOps and cloud security work (CI/CD and patching pipelines, FedRAMP remediation, supply-chain incident response, observability integrations, and more).

- An index of terminal-styled **case-study cards**.
- A detail page per study where section headers read as console commands (`cat problem`, `cat approach`, `tree architecture`, …), with the architecture rendered as an inline terminal diagram.
- Surfaced throughout the site: linked from the About page, the home hero, and interleaved as engineering cards inside the featured-work carousels.

### About

The story behind METTAIRE — the creative and engineering halves of the work — anchored by an **animated terminal console** that types out a live "session," plus a Projects-in-Progress section for ongoing work.

### Accessibility & settings

A settings panel exposes:

- **Dark / light themes** (a dedicated cold light theme on pure white)
- **High-contrast** mode
- **Large-text** mode
- **Reduced-motion** mode (honors the OS preference and disables animation)

## Local development

```bash
# install
yarn install      # or: npm install

# front end (Vite dev server, proxies /api to production by default)
yarn dev

# optional: run the local API instead of the production proxy
#   set VITE_API_TARGET=http://localhost:3001 in .env.local, then:
npm run server:dev
```

## Connect

Questions, feedback, or just want to say hello? Reach out by [email](mailto:lukannelson@gmail.com) or connect on [LinkedIn](https://www.linkedin.com/in/dnelson777/).

Thank you for visiting METTAIRE — where engineering and art share the same machine.


