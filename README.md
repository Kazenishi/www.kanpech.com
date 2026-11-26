# Kanpèch

A website for a Haitian restaurant in Pétion-Ville that cooks over wood fire. *Kanpèch* is the Kreyòl name of the logwood tree, whose heartwood gives a red-violet dye. The site takes its colour from it.

**This is a concept project by F. Abdul Casias.** The restaurant, its menu and its prices are made up, and no form on the site sends anything. Every page carries `noindex`, so search engines leave it out.

## Pages

| Page | What it does |
|---|---|
| `index.html` | Home: the kitchen, three dishes, the room, the weekend tasting menu and the hours |
| `menu.html` | Five sections in tabs, dietary filters (vegetarian, gluten-free, not spicy), and the seven courses one at a time |
| `story.html` | Why the name, and how the kitchen cooks |
| `events.html` | Three spaces with their capacities, and a request form |
| `reserve.html` | Booking: guests, day, free times built from the opening hours, the seven-course option |
| `contact.html` | Hours with "open now", where to find it, questions |
| `404.html` | Not-found page, styled inline so it also works on nested URLs |

## How it works

- Plain HTML, CSS and JavaScript. No build step, no framework, no library.
- **The ink panel:** on wide screens the page is split in two. The photo on the left follows the block being read, and each new photo spreads in through an ink-blot mask tinted with the logwood dye. The mask is an SVG inlined in `css/styles.css` (`--ink-mask`).
- **Opening hours** are calculated at Haiti time, whatever the visitor's clock. Haiti's summer-time rule is written out in `js/hours.js` rather than asked of the browser's `Intl`, whose first use costs about 100 ms on a phone; it was checked against `Intl` hour by hour for 2026–2028. The booking form only offers times the kitchen is open, up to 90 minutes before closing, and nothing on Mondays.
- **Without JavaScript**, every menu section, dish and course shows in order, and the forms say they need JavaScript.
- Reduced motion is respected: the photos change without the ink.

## Files

```
css/styles.css     all styles, in numbered sections
js/hours.js        opening hours and "open now" (HOURS at the top)
js/main.js         header, phone navigation, ink panel
js/menu.js         tabs, filters, seven courses
js/forms.js        validation and the summary card
js/reserve.js      booking times, guests, seven-course rules
fonts/             Bodoni Moda and Schibsted Grotesk (SIL Open Font License)
img/               photos as WebP (480, 800, 1200, 1600) and JPEG, plus credits.json
```

The header and footer are repeated in every page. To change the opening hours, edit `HOURS` in `js/hours.js` **and** the hours written in the pages: search for `6 pm to 11 pm`.

## Run it

Open `index.html` in a browser. Opened from the disk, Chrome refuses to load the fonts, so system fonts stand in. For the real thing, serve the folder:

```
npx serve .
```

## Put it online with GitHub Pages

1. Create a repository and push this folder as its root.
2. In the repository, open **Settings → Pages**, choose **Deploy from a branch**, then `main` and `/ (root)`.
3. The site appears at `https://<user>.github.io/<repository>/`. All links are relative, so it works under that path.
4. Optional: once you know that address, add `<meta property="og:image" content="https://<user>.github.io/<repository>/og.jpg">` to the pages for link previews.

## Credits

Photos from [Pexels](https://www.pexels.com/license/), plus a logwood tree in bloom by 葉子 ([iNaturalist](https://www.inaturalist.org/photos/115898893), CC0) and logwood heartwood chips by Waughd ([Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Haematoxylum_campechianum_wood_chips.jpg), CC BY-SA 4.0). Every photo is listed with its author in the footer of each page and in `img/credits.json`.

Design and code: F. Abdul Casias.
