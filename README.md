# The Sapling Co. — Website (Phase 1)

A fast, responsive, **informational** multi-page website for The Sapling Co. (a unit of Shefali Nursery), built as plain static **HTML + CSS + JS** — no build step, no framework, deploys anywhere.

This is **Phase 1**: brand storytelling, full inventory browsing, and lead capture (call / email / request form). There is **no shopping cart or online payment** yet — that's the planned Phase 2 (WooCommerce + Razorpay), and the structure here is kept modular so it can migrate without a rewrite.

---

## Pages (12)

| File | Purpose |
|---|---|
| `index.html` | Homepage — hero, story, category showcase, why-choose-us, order-on-call, **Request a Sapling** form, local delivery pricing, map, review CTA |
| `about.html` | Brand story, stats, "How your plant reaches you", specialty, mission |
| `inventory.html` | Inventory hub — links to all 7 category pages |
| `inventory-<category>.html` | 7 category pages (fruit-trees, palms-coconut, flowering-shrubs, ornamental-foliage, indoor-plants, succulents-cactus, landscape-plants) with variety cards + sub-collection chips + "Request this plant" |
| `care-guides.html` | Searchable / filterable care-guide grid (articles marked "coming soon") |
| `contact.html` | Message form + WhatsApp / Email / Instagram / address + map |
| `shipping.html` | Packing, delivery times, local delivery pricing, 48-hr damage policy |

## Assets

```
assets/
  css/styles.css      Design system (brand tokens, light/dark, all components)
  js/main.js          Header/footer, theme toggle, mobile nav, language widget,
                      mailto forms, care-guide filter, map facade, scroll reveals
  images/             Photos (Unsplash/Pexels, free for commercial use) + logos
_build/gen_categories.py   One-time generator for the 7 category pages (not deployed)
robots.txt, sitemap.xml
```

The shared **header and footer are rendered by `main.js`** (single source of truth). To change navigation, business phone/email, or footer links, edit the `BIZ`, `NAV`, and `CATEGORIES` objects near the top of `assets/js/main.js`.

---

## Preview locally

From this folder:

```bash
python -m http.server 8000
```

Then open <http://localhost:8000>. (Opening the `.html` files directly with `file://` mostly works too, but a local server is more accurate.)

## Deploy

It's a static site — upload the whole folder to any host:

- **Hostinger** (your current registrar): upload everything to `public_html` via the File Manager or FTP. No PHP/WordPress needed for Phase 1.
- Or Netlify / Vercel / Cloudflare Pages / GitHub Pages — drag-and-drop the folder.

You can safely **omit** from the upload: `_build/`, `README.md`, and the old reference mockups (`the_sapling_co_*.html`, `*.md` spec files).

---

## Maintenance notes

- **Swap in real nursery photos:** replace files in `assets/images/` keeping the same filenames (e.g. `cat-indoor.jpg`, `hero-home.jpg`). Keep a consistent treatment (plant centred, plain light background) for the premium look. Current photos are royalty-free placeholders.
- **Forms** open the visitor's email app pre-filled to `thesaplingco@gmail.com` (no backend needed yet). Category "Request this plant" links pre-fill the plant name via `?plant=…`.
- **Language (English / বাংলা):** a custom, built-in bilingual engine (`assets/js/i18n.js`) — no third-party widget. The choice is remembered per visitor and persists across pages. Bengali is hand-authored in a natural, code-switched voice (keeping the English words Bengalis actually use — "delivery", "order", "care guide") rather than literal translation. Dedicated Bengali fonts load only when Bengali is chosen. **All page body text is translated** (home, about, inventory + category pages, care guides, contact, shipping, nav/footer/forms); plant variety names (e.g. "Alphonso", "ZZ Plant") stay in English by design. To edit any wording, change the matching `DICT` entry in `i18n.js`.
- **Hero carousel** (homepage): 5 auto-rotating slides (brand video → indoor video → exotic fruits → rare flowers → nursery visit). Edit slide markup in `index.html`; only the active slide's video plays.
- **Media is optimised:** videos were re-encoded from ~27 MB to ~2.7 MB (H.264, 1280px, no audio) and images recompressed; total page weight stays light. The original uploads (`Hero Image.mp4`, `Indoor plants.mp4`, `flower 1-4.jpg`, `inventory photo 1-4.jpg`, etc.) are **no longer used** and can be deleted before deploy.
- **Loading screen** shows briefly on each page and fades out on load.
- **Dark / light mode** toggle is in the header; the choice is remembered per visitor.
- **Favicon** is the square logo. The transparent logo is only used on dark green surfaces (its cream wordmark is invisible on light backgrounds — by design).

## Content decisions worth confirming

- **PIN code:** used **712247** (from the main spec's business details). One companion file listed 712258 — please confirm which is correct.
- **No prices / no sale banner** on the site — intentional for Phase 1 (informational, no cart). The "30% off" hero and product prices from the copy file were left out until the store launches.
- **About stats** show "70+ varieties / 7 categories" instead of the copy file's "3 collections", to match the verified inventory.
- **Care-guide articles** are listed as "coming soon" — they're starter ideas to write over time; no article pages were built in this phase.
