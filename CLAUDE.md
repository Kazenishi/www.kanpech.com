## Project

Kanpèch, a concept website for a made-up Haitian restaurant in Pétion-Ville. Plain HTML, CSS and JavaScript: no build step, no package.json, no library. English only. Meant to be pushed as its own GitHub repository and served with GitHub Pages, and copied into the owner's portfolio under `/demos/kanpech/`.

- **Keep it a concept:** the top bar, the footer note and the summary cards ("Nothing was sent") stay. No testimonials, reviews, awards or statistics. Prices stay labelled as samples. Contact details stay placeholders (`.example`, `+509 0000-0000`). No street address, only "Pétion-Ville". Every page keeps `<meta name="robots" content="noindex">`.
- **Relative links only**, flat pages, so the site works from the disk, under `/<repo>/` and under `/demos/kanpech/`. `404.html` keeps its CSS inline.
- **CSP** is a meta tag in every page: `'self'` only, plus the hash of the one inline script (`document.documentElement.classList.add('js')`). Never add inline `style=""` attributes or other inline scripts; set styles from JS through `element.style`.
- **The header never sits over a photo:** it is solid, sticky, hides on scroll down. The photo panel starts below it.
- **Opening hours** live in two places: `HOURS` in `js/hours.js` and the hours written in the pages. Change both.
- Images: every photo has WebP at 480/800/1200/1600 and a JPEG at 800, used through `<picture>`. The split pages load the panel photo only on wide screens and the inline photo only on narrow ones (`<source media>` with a 1px GIF fallback). Credit any new photo in every footer and in `img/credits.json`.
- Reduced motion: no ink, no animation. Without JavaScript: all content shows.
- **No Intl at page load:** its first use costs about 100 ms on a phone. Local times come from written-out time-zone rules (`haitiOffset`/`zoneOffset`), which the QA checks against Intl hour by hour. If a country changes its summer time, change the rule. Intl is fine after a click (formatting a date in a summary). Prices use a regex, not `toLocaleString`.
