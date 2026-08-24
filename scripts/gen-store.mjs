/* ==========================================================================
   STORE PAGE GENERATOR
   Reads assets/data/catalogue.json (grouped products with variants[]) and
   writes static pages reusing the LIVE site chrome + design system:
     shop.html                  — offers carousel + faceted filter/sort/search
     product/<slug>/index.html  — one page per product, variant selector,
                                   care meters + one-liners, quick facts
     cart.html                  — cart + coupon + WhatsApp checkout
   Run after build-store.mjs:   node scripts/gen-store.mjs
   ========================================================================== */
import { readFileSync, writeFileSync, mkdirSync, rmSync } from "node:fs";

const SITE = "https://thesaplingco.in";
const { products, taxonomy, goals } = JSON.parse(readFileSync("assets/data/catalogue.json", "utf8"));

const escT = s => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const escA = s => String(s ?? "").replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const inr = n => "₹" + Number(n || 0).toLocaleString("en-IN");

const BOOT = `<script>
    (function () { var d = document.documentElement; d.classList.add("js");
      try { var t = localStorage.getItem("sapling-theme"); if (!t) t = "light"; d.setAttribute("data-theme", t); } catch (e) { d.setAttribute("data-theme", "light"); }
      try { var l = localStorage.getItem("sapling-lang"); d.classList.add(l === "bn" ? "lang-bn" : "lang-en"); if (l === "bn") d.setAttribute("lang", "bn"); } catch (e) {} })();
  </script>`;
const PRELOADER = `<div id="preloader" aria-hidden="true">
    <div class="preloader__mark"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22V10"/><path d="M12 12C8 12 5 9 5 5c4 0 7 3 7 7z"/><path d="M12 10c0-3 2.5-5.5 7-5.5 0 4-3 5.5-7 5.5z"/></svg></div>
    <span class="preloader__name">The Sapling Co.</span>
  </div>`;

function head({ title, desc, canonical, page = "", jsonld = "" }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escT(title)}</title>
  <meta name="description" content="${escA(desc)}">
  <link rel="icon" type="image/png" href="/assets/images/logo/favicon.png">
  <link rel="canonical" href="${escA(canonical)}">
  <meta name="theme-color" content="#0B1E12">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,600;0,700;1,500&family=Inter:wght@300;400;500;600;700&display=swap" media="print" onload="this.media='all'">
  <noscript><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,600;0,700;1,500&family=Inter:wght@300;400;500;600;700&display=swap"></noscript>
  <link rel="stylesheet" href="/assets/css/styles.css">
  <link rel="stylesheet" href="/assets/css/store.css">${jsonld ? "\n  " + jsonld : ""}
  ${BOOT}
</head>
<body data-page="${page}">
  ${PRELOADER}
  <header id="site-header"></header>
  <main id="main">`;
}
function foot(scripts = []) {
  return `  </main>
  <footer id="site-footer"></footer>
  <script src="/assets/js/i18n.js" defer></script>
  <script src="/assets/js/main.js" defer></script>
  <script src="/assets/js/cart.js" defer></script>
${scripts.map(s => `  <script src="${s}" defer></script>`).join("\n")}
</body>
</html>`;
}

function priceInline(price, mrp, discount) {
  return `<span class="price__now">${inr(price)}</span>` +
    (mrp > price ? `<span class="price__mrp">${inr(mrp)}</span><span class="price__off">${discount}% off</span>` : "");
}
function cardPrice(p) {
  if (p.priceMin === p.priceMax) return `<div class="price">${priceInline(p.priceMin, p.mrp, p.discount)}</div>`;
  return `<div class="price"><span class="muted" data-i18n="sc_from">From</span> <span class="price__now">${inr(p.priceMin)}</span></div>`;
}
function media(p) {
  const img = p.image
    ? `<img src="${escA(p.image)}" alt="${escA(p.name)}" loading="lazy" width="400" height="400">`
    : `<span class="card__ph" style="display:grid;place-items:center;height:100%"><span>${escT(p.varietyGroup || p.category)}</span></span>`;
  const oos = !p.inStock ? `<span class="product-card__oos" data-i18n="sc_oos">Out of stock</span>` : "";
  const badge = p.discount > 0 && p.priceMin === p.priceMax ? `<div class="product-card__badges"><span class="badge badge--lime">${p.discount}% off</span></div>` : "";
  return `<a class="product-card__media" href="/product/${p.slug}/" aria-label="${escA(p.name)}">${badge}${img}${oos}</a>`;
}
function controlAttrs(p, v) {
  return `data-sku="${escA(v.sku)}" data-name="${escA(p.name)}" data-price="${v.price}" data-size="${escA(v.size)}" ` +
    `data-slug="${escA(p.slug)}" data-image="${escA(v.image || p.image)}"` +
    (p.variants.length > 1 ? ` data-variant="${escA(v.label)}"` : "");
}
function control(p, v) {
  return `<div class="qty-control" data-cart-control ${controlAttrs(p, v)}${p.inStock && v.inStock ? "" : ' data-oos="1"'}></div>`;
}
function card(p) {
  const feat = (p.inStock ? 100 : 0) + p.discount;
  const v0 = p.variants[0];
  const action = p.variants.length === 1
    ? control(p, v0)
    : `<a class="btn btn--secondary btn--block" href="/product/${p.slug}/" data-i18n="sc_options">Select options</a>`;
  return `<div class="product-card card" data-cat="${escA(p.category)}" data-sub="${escA(p.subcategory)}" ` +
    `data-goals="${escA(p.goals.join("|"))}" data-traits="${escA(p.traits.join("|"))}" data-sizes="${escA(p.sizes.join("|"))}" data-price="${p.priceMin}" ` +
    `data-instock="${p.inStock ? 1 : 0}" data-feat="${feat}" data-search="${escA(p._search || p.name.toLowerCase())}">` +
    media(p) +
    `<div class="product-card__body">` +
      `<span class="product-card__cat">${escT(p.subcategory)}</span>` +
      `<a href="/product/${p.slug}/"><h3 class="product-card__name">${escT(p.name)}</h3></a>` +
      cardPrice(p) + action +
    `</div></div>`;
}

/* ---- offers carousel — edit this array to change banners --------------------
   Each slide: eyebrow / title / sub / cta / href, plus EITHER `img` (a full
   image URL — same look as the homepage) OR `bg` (a placeholder gradient used
   until you add an image). To swap a banner later: change the text and set `img`.
   (Later this can be driven from an "Offers" sheet tab for no-code edits.) */
const OFFERS = [
  { eyebrow: "Welcome offer", title: "10% off your first order", sub: "Use code WELCOME10 at checkout, on orders over ₹499.", cta: "Shop bestsellers", href: "/shop.html", img: "", bg: "linear-gradient(120deg,#15321F,#1A3A2A 60%,#245036)" },
  { eyebrow: "Breathe easy", title: "Air-purifying plants for every room", sub: "NASA-listed favourites, grown in Bengal and delivered across India.", cta: "Shop air-purifying", href: "/shop.html?goal=air-purifying", img: "", bg: "linear-gradient(120deg,#1A3A2A,#31543a 55%,#4A2060)" },
  { eyebrow: "Grow fruit at home", title: "Exotic & rare fruit saplings", sub: "From the famous Miyazaki mango to Bengal's Baruipur guava.", cta: "Shop fruit trees", href: "/shop.html?category=Fruit", img: "", bg: "linear-gradient(120deg,#2a1a3a,#1A3A2A 60%,#15321F)" },
  { eyebrow: "Festive season", title: "Gifting a plant this Rakhi or Puja?", sub: "Message us on WhatsApp for festive plant hampers and combos.", cta: "Chat on WhatsApp", href: "https://wa.me/918902262452", img: "", bg: "linear-gradient(120deg,#4A2060,#3a2340 55%,#15321F)" },
  { eyebrow: "Local to Hooghly?", title: "Free pickup from our Dankuni nursery", sub: "Or home delivery, confirmed on WhatsApp after we check your PIN.", cta: "Browse the collection", href: "/shop.html", img: "", bg: "linear-gradient(120deg,#0B1E12,#1A3A2A 65%,#245036)" },
];
function offersCarousel() {
  const slides = OFFERS.map((o, i) => {
    const ext = /^https?:/.test(o.href);
    const media = o.img
      ? `<div class="hero-slide__media"><img src="${escA(o.img)}" alt="" ${i === 0 ? "" : 'loading="lazy"'}></div>`
      : `<div class="hero-slide__media" style="background:${o.bg}"></div>`;
    return `<div class="hero-slide${i === 0 ? " is-active" : ""}">
        ${media}
        <div class="hero-slide__content"><div class="hero-slide__inner">
          <span class="eyebrow">${escT(o.eyebrow)}</span>
          <h2>${escT(o.title)}</h2>
          <p class="hero-sub">${escT(o.sub)}</p>
          <a class="btn btn--primary btn--lg" href="${escA(o.href)}"${ext ? ' target="_blank" rel="noopener"' : ""}>${escT(o.cta)}</a>
        </div></div>
      </div>`;
  }).join("\n      ");
  return `<section class="hero hero--ratio" data-carousel aria-label="Offers">
      <div class="hero-carousel">
      ${slides}
      </div>
      <div class="hero-controls">
        <button class="hero-arrow" data-hero-prev aria-label="Previous slide" data-icon="chevronLeft"></button>
        <div class="hero-dots"></div>
        <button class="hero-arrow" data-hero-next aria-label="Next slide" data-icon="chevronRight"></button>
      </div>
    </section>`;
}

/* ---- SHOP --------------------------------------------------------------- */
function buildShop() {
  const check = (cls, val, label, n) =>
    `<label class="filter-check"><input type="checkbox" class="${cls}" value="${escA(val)}"> <span>${escT(label)}</span><span class="n">${n}</span></label>`;
  const catFilters = taxonomy.map(t => check("f-cat", t.category, t.category, t.count)).join("");
  const goalFilters = goals.map(g => check("f-goal", g.id, g.label, g.count)).join("");
  const subCounts = {}; products.forEach(p => (subCounts[p.subcategory] = (subCounts[p.subcategory] || 0) + 1));
  const subFilters = Object.entries(subCounts).sort((a, b) => b[1] - a[1]).map(([s, n]) => check("f-sub", s, s, n)).join("");
  const sizeCounts = {}; products.forEach(p => p.sizes.forEach(s => (sizeCounts[s] = (sizeCounts[s] || 0) + 1)));
  const sizeFilters = Object.entries(sizeCounts).sort((a, b) => b[1] - a[1]).map(([s, n]) => check("f-size", s, s, n)).join("");
  const goalChips = goals.map(g => `<a class="chip chip--cream" href="/shop.html?goal=${g.id}">${escT(g.label)} <span class="muted">${g.count}</span></a>`).join("");
  const cards = products.map(card).join("\n        ");

  const body = `
    ${offersCarousel()}
    <section class="section container--wide">
      <div class="section-head" style="align-items:flex-end">
        <div>
          <span class="eyebrow" data-i18n="brand_unit">A unit of Shefali Nursery</span>
          <h1 data-i18n="shop_title">Shop plants</h1>
          <p class="muted" data-i18n="shop_sub">Grown in Bengal, delivered across India.</p>
        </div>
      </div>
      <div id="shop-query" class="chip" style="margin-bottom:1rem" hidden>“<span data-q-text></span>” <button data-q-clear class="icon-btn" style="width:20px;height:20px" aria-label="Clear">×</button></div>
      <div class="chips" style="margin-bottom:1.3rem">${goalChips}</div>
      <div class="filters-bar">
        <button class="btn btn--secondary" data-filters-open><span data-icon-lead="filter"></span> <span data-i18n="shop_filters">Filters</span></button>
      </div>
      <div class="shop-layout">
        <aside class="shop-filters" aria-label="Filters">
          <div class="shop-filters__close"><button class="icon-btn" data-filters-close aria-label="Close filters"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg></button></div>
          <div class="filter-group"><h4 data-i18n="shop_category">Category</h4>${catFilters}</div>
          <div class="filter-group"><h4 data-i18n="shop_traits">Good for</h4>${goalFilters}</div>
          <div class="filter-group"><h4 data-i18n="shop_size">Size</h4>${sizeFilters}</div>
          <div class="filter-group"><h4>Collection</h4>${subFilters}</div>
          <div class="filter-group"><label class="filter-check"><input type="checkbox" id="f-instock"> <span data-i18n="shop_instock">In stock only</span></label></div>
          <button class="btn btn--secondary btn--block" id="shop-clear" data-i18n="shop_clear" style="margin-top:1rem">Clear all</button>
        </aside>
        <div class="shop-main">
          <div class="shop-toolbar">
            <span class="shop-count"><b id="shop-count">${products.length}</b> <span data-i18n="shop_results">plants</span></span>
            <label><span data-i18n="shop_sort">Sort</span>:
              <select id="shop-sort">
                <option value="featured" data-i18n="sort_featured">Featured</option>
                <option value="low" data-i18n="sort_low">Price: low to high</option>
                <option value="high" data-i18n="sort_high">Price: high to low</option>
              </select>
            </label>
          </div>
          <div class="product-grid" id="shop-grid">
        ${cards}
          </div>
          <p id="shop-none" class="no-results" data-i18n="shop_none" hidden>No plants match these filters.</p>
        </div>
      </div>
      <div class="filters-scrim"></div>
    </section>`;
  return head({ title: "Shop Plants | The Sapling Co.", desc: `Shop ${products.length} nursery-grown plants — indoor, fruit and outdoor. Grown in Bengal, delivered across India.`, canonical: SITE + "/shop.html", page: "shop" }) +
    body + foot(["/assets/js/shop.js"]);
}

/* ---- care meters + one-liners ------------------------------------------ */
function lightMeter(t) { t = (t || "").toLowerCase();
  if (/full sun|direct sun|full-sun/.test(t)) return { p: 100, line: "Loves bright, direct sun — ideal for a sunny balcony or terrace." };
  if (/bright/.test(t)) return { p: 70, line: "Bright, indirect light near a well-lit window; avoid harsh midday sun." };
  if (/part|semi|filtered|dappled|shade/.test(t)) return { p: 50, line: "Happy in filtered light or partial shade." };
  if (/low/.test(t)) return { p: 30, line: "Tolerates low light — good for shaded corners and offices." };
  return { p: 55, line: "Adaptable to most well-lit indoor spots." };
}
function waterMeter(t) { t = (t || "").toLowerCase();
  if (/high|frequent|daily|keep moist|moist/.test(t)) return { p: 100, freq: "2–3× a week", line: "Likes lightly moist soil — don't let it dry out fully." };
  if (/moderate|medium|weekly|regular/.test(t)) return { p: 60, freq: "About once a week", line: "Water when the top 2–3 cm of soil feels dry." };
  if (/low|drought|minimal|less|sparing|occasional/.test(t)) return { p: 30, freq: "Every 10–14 days", line: "Drought-tolerant — let the soil dry out between waterings." };
  return { p: 55, freq: "When topsoil is dry", line: "Water when the top of the soil feels dry to the touch." };
}
function careMeter(t) { t = (t || "").toLowerCase();
  if (/high|difficult|demanding|expert|fussy/.test(t)) return { p: 100, line: "Needs regular attention — steady watering, humidity and bright light." };
  if (/medium|moderate/.test(t)) return { p: 60, line: "Easy-going with a light routine; the main risk is overwatering." };
  return { p: 30, line: "Beginner-friendly and hard to kill — main pitfall is overwatering, so let it dry between drinks." };
}
// Compact care tiles (shown on the product summary, right column)
function careTiles(p) {
  const c = p.care;
  const tiles = [
    c.light && { icon: "sun", label: "pdp_light", v: c.light },
    c.watering && { icon: "droplet", label: "pdp_water", v: c.watering },
    c.maintenance && { icon: "seedling", label: "pdp_maint", v: c.maintenance },
    c.indoorOutdoor && { icon: "home", label: "pdp_inout", v: c.indoorOutdoor },
  ].filter(Boolean).slice(0, 4);
  if (!tiles.length) return "";
  return `<div class="care-grid">` + tiles.map(t =>
    `<div class="care-tile"><span data-icon="${t.icon}"></span><b data-i18n="${t.label}"></b><span>${escT(t.v)}</span></div>`).join("") + `</div>`;
}
// Detailed care explanations (shown in the About section)
function careFaq(p) {
  const c = p.care, rows = [];
  if (c.light) rows.push(["pdp_light", lightMeter(c.light).line]);
  if (c.watering) { const m = waterMeter(c.watering); rows.push(["pdp_water", m.freq + " — " + m.line]); }
  if (c.maintenance) rows.push(["pdp_maint", careMeter(c.maintenance).line]);
  if (c.indoorOutdoor) rows.push(["pdp_inout", "Suited to " + c.indoorOutdoor.toLowerCase() + " placement."]);
  if (!rows.length) return "";
  return `<div class="care-faq"><h3 data-i18n="pdp_care_head">How to care for it</h3><dl>` +
    rows.map(([label, line]) => `<div><dt data-i18n="${label}"></dt><dd>${escT(line)}</dd></div>`).join("") + `</dl></div>`;
}
function quickFacts(p) {
  const rows = [];
  if (p.botanical) rows.push(["Botanical name", p.botanical]);
  if (p.searchNames && p.searchNames.toLowerCase() !== p.name.toLowerCase()) rows.push(["Also known as", p.searchNames]);
  if (p.care.matureSize) rows.push(["Mature size", p.care.matureSize]);
  if (p.care.growthRate) rows.push(["Growth rate", p.care.growthRate]);
  if (p.care.containerSuitable) rows.push(["Container / pot", p.care.containerSuitable]);
  if (p.care.indoorOutdoor) rows.push(["Placement", p.care.indoorOutdoor]);
  if (p.productType) rows.push(["Type", p.productType]);
  const badges = [];
  if (p.claims.airPurifying) badges.push("Air-purifying");
  if (p.claims.petFriendly) badges.push("Pet-friendly");
  if (p.claims.fruitBearing) badges.push("Fruit-bearing");
  if (p.claims.flowering) badges.push("Flowering");
  if (p.claims.edible) badges.push("Edible");
  if (p.claims.vastu) badges.push("Vastu / wellness");
  let html = `<table class="facts"><tbody>${rows.map(([k, v]) => `<tr><th>${escT(k)}</th><td>${escT(v)}</td></tr>`).join("")}</tbody></table>`;
  if (badges.length) html += `<div class="fact-badges">${badges.map(b => `<span class="badge badge--plum">${escT(b)}</span>`).join("")}</div>`;
  return html;
}

/* ---- PRODUCT ------------------------------------------------------------ */
function galleryThumbs(p) {
  if (p.images.length > 1) return `<div class="pdp-thumbs">` + p.images.map((src, i) =>
    `<button class="pdp-thumb${i === 0 ? " is-active" : ""}" data-full="${escA(src)}"><img src="${escA(src)}" alt="" loading="lazy"></button>`).join("") + `</div>`;
  return `<p class="pdp-more" data-i18n="pdp_more_img">More photos coming soon</p>`;
}
function variantSelector(p) {
  if (p.variants.length < 2) return "";
  const chips = p.variants.map((v, i) =>
    `<button type="button" class="variant-chip${i === 0 ? " is-active" : ""}"${v.inStock ? "" : " disabled"} data-variant-idx="${i}">${escT(v.label)}${v.inStock ? "" : ' · <span data-i18n="pdp_variant_oos">out of stock</span>'}</button>`
  ).join("");
  return `<div class="pdp-variants"><span class="pdp-variants__label" data-i18n="pdp_choose">Choose an option</span><div class="variant-chips">${chips}</div></div>`;
}
function buildProduct(p) {
  const v0 = p.variants[0];
  const related = (() => {
    let r = products.filter(x => x.slug !== p.slug && x.varietyGroup === p.varietyGroup);
    if (r.length < 10) r = r.concat(products.filter(x => x.slug !== p.slug && x.subcategory === p.subcategory && x.varietyGroup !== p.varietyGroup));
    if (r.length < 10) r = r.concat(products.filter(x => x.slug !== p.slug && x.category === p.category && x.subcategory !== p.subcategory));
    return [...new Map(r.map(x => [x.slug, x])).values()].slice(0, 10);
  })();
  const tags = p.traits.length ? `<div class="pdp-tags">${p.traits.map(tr => `<a class="chip chip--lilac" href="/shop.html?trait=${escA(tr)}">${escT(tr)}</a>`).join("")}</div>` : "";
  const buyData = `data-sku="${escA(v0.sku)}" data-name="${escA(p.name)}" data-price="${v0.price}" data-size="${escA(v0.size)}" data-slug="${escA(p.slug)}" data-image="${escA(v0.image || p.image)}"${p.variants.length > 1 ? ` data-variant="${escA(v0.label)}"` : ""}`;
  const variantJSON = JSON.stringify({ name: p.name, slug: p.slug, image: p.image, variants: p.variants });

  const jsonld = `<script type="application/ld+json">${JSON.stringify({
    "@context": "https://schema.org", "@type": "Product",
    name: p.name, sku: v0.sku, category: p.category, image: p.image || undefined,
    description: p.seo.description || p.notes || undefined,
    brand: { "@type": "Brand", name: "The Sapling Co." },
    offers: p.variants.length > 1
      ? { "@type": "AggregateOffer", priceCurrency: "INR", lowPrice: p.priceMin, highPrice: p.priceMax, offerCount: p.variants.length, availability: "https://schema.org/" + (p.inStock ? "InStock" : "OutOfStock") }
      : { "@type": "Offer", priceCurrency: "INR", price: v0.price, url: SITE + "/product/" + p.slug + "/", availability: "https://schema.org/" + (p.inStock ? "InStock" : "OutOfStock") },
  })}</script>`;

  const body = `
    <section class="section container--wide">
      <nav class="breadcrumb" aria-label="Breadcrumb"><a href="/">Home</a> › <a href="/shop.html?category=${escA(p.category)}">${escT(p.category)}</a> › <span>${escT(p.name)}</span></nav>
      <div class="pdp">
        <div class="pdp-gallery">
          <div class="pdp-main">${p.discount > 0 && p.priceMin === p.priceMax ? `<div class="product-card__badges"><span class="badge badge--lime">${p.discount}% off</span></div>` : ""}<img id="pdp-main-img" src="${escA(p.image || "")}" alt="${escA(p.name)}"></div>
          ${galleryThumbs(p)}
        </div>
        <div class="pdp-info">
          <a class="eyebrow eyebrow--link" href="/shop.html?subcategory=${escA(p.subcategory)}">${escT(p.subcategory)}</a>
          <h1>${escT(p.name)}</h1>
          ${p.botanical ? `<p class="pdp-botanical">${escT(p.botanical)}</p>` : ""}
          <div class="price" id="pdp-price">${priceInline(v0.price, v0.mrp, v0.discount)}</div>
          ${tags}
          ${careTiles(p)}
          ${variantSelector(p)}
          <div class="pdp-actions">${control(p, v0)}</div>
          ${p.inStock ? `<button class="btn wa-btn btn--block" data-buy-now ${buyData} style="margin-top:.7rem"><span data-icon-lead="whatsapp"></span> <span data-i18n="sc_order_wa">Order on WhatsApp</span></button>` : ""}
          <div class="pdp-ship"><span data-icon="truck"></span><span data-i18n="pdp_ship_note">Grown & shipped from our Dankuni nursery. Delivery confirmed on WhatsApp.</span></div>
        </div>
      </div>

      <div class="pdp-section">
        <h2 data-i18n="pdp_about">About this plant</h2>
        <div class="about-grid">
          <div>
            <p class="pdp-desc">${escT(p.description || p.notes)}</p>
            ${careFaq(p)}
          </div>
          <aside class="about-facts"><h3 data-i18n="pdp_facts">Quick facts</h3>${quickFacts(p)}</aside>
        </div>
      </div>

      ${related.length ? `<div class="pdp-section"><div class="section-head"><h2 data-i18n="pdp_related">You may also like</h2></div><div class="related-scroll">${related.map(card).join("")}</div></div>` : ""}
    </section>
    <script type="application/json" id="pdp-variants">${variantJSON.replace(/</g, "\\u003c")}</script>`;
  return head({ title: p.seo.title || `${p.name} | The Sapling Co.`, desc: p.seo.description || p.notes, canonical: SITE + "/product/" + p.slug + "/", page: "shop", jsonld }) +
    body + foot(["/assets/js/product.js"]);
}

/* ---- CART --------------------------------------------------------------- */
function buildCart() {
  const field = (name, label, attrs = "") => `<div class="co-field"><label data-i18n="${label}"></label><input name="${name}" ${attrs}></div>`;
  const body = `
    <section class="section container">
      <h1 data-i18n="cart_title">Your cart</h1>
      <div id="cart-empty" class="empty-cart" hidden>
        <p class="muted" data-i18n="cart_empty">Your cart is empty.</p>
        <a class="btn btn--primary" href="/shop.html" data-i18n="cart_browse">Browse plants</a>
      </div>
      <div id="cart-wrap" class="cart-layout" hidden>
        <div><div id="cart-lines"></div></div>
        <aside class="cart-summary">
          <div class="coupon-row">
            <input id="coupon" type="text" autocomplete="off" placeholder="Coupon code" data-i18n-ph="cart_coupon_ph">
            <button class="btn btn--secondary" id="apply-coupon" data-i18n="cart_apply">Apply</button>
          </div>
          <p id="coupon-msg" class="coupon-msg"></p>
          <div class="totals">
            <div><span data-i18n="cart_subtotal">Subtotal</span><span id="t-subtotal">₹0</span></div>
            <div id="row-discount" hidden><span data-i18n="cart_discount">Discount</span><span id="t-discount">−₹0</span></div>
            <div><span data-i18n="cart_delivery">Delivery</span><span class="muted" data-i18n="cart_delivery_tbd">Confirmed on WhatsApp</span></div>
            <div class="totals__grand"><span data-i18n="cart_total">Total (excl. delivery)</span><span id="t-total">₹0</span></div>
          </div>
          <h3 style="margin:1.3rem 0 .7rem" data-i18n="cart_your_details">Your details</h3>
          <form id="checkout" novalidate>
            ${field("name", "ord_name", "required")}
            ${field("phone", "ord_phone", 'inputmode="tel" required')}
            <label class="chk"><input type="checkbox" name="waSame" checked> <span data-i18n="ord_wa_same"></span></label>
            <div class="co-field" id="wa-field" hidden><label data-i18n="ord_wa"></label><input name="wa" inputmode="tel"></div>
            <div class="co-field"><label data-i18n="ord_address"></label><textarea name="address" rows="2" required></textarea></div>
            ${field("pin", "ord_pin", 'inputmode="numeric" maxlength="6" required')}
            ${field("landmark", "ord_landmark")}
            <div class="co-field"><label data-i18n="ord_notes"></label><textarea name="notes" rows="2"></textarea></div>
          </form>
          <button class="btn wa-btn btn--block" id="order-wa" style="margin-top:1rem"><span data-icon-lead="whatsapp"></span> <span data-i18n="cart_order_wa">Order on WhatsApp</span></button>
          <p class="muted" style="font-size:.8rem;margin-top:.5rem;text-align:center" data-i18n="cart_order_hint">We'll confirm stock & delivery on WhatsApp.</p>
          <div class="delivery-note">
            <p data-i18n="deliv_confirm">Delivery is confirmed on WhatsApp after we check your PIN code.</p>
            <ul>
              <li data-i18n="deliv_local"></li>
              <li data-i18n="deliv_far"></li>
              <li data-i18n="deliv_time"></li>
            </ul>
          </div>
        </aside>
      </div>
    </section>`;
  return head({ title: "Your Cart | The Sapling Co.", desc: "Review your cart and place your order on WhatsApp.", canonical: SITE + "/cart.html", page: "" }) +
    body + foot(["/assets/js/cart-page.js"]);
}

/* ---- write -------------------------------------------------------------- */
writeFileSync("shop.html", buildShop());
writeFileSync("cart.html", buildCart());
try { rmSync("product", { recursive: true, force: true }); } catch {}
let n = 0;
for (const p of products) { mkdirSync(`product/${p.slug}`, { recursive: true }); writeFileSync(`product/${p.slug}/index.html`, buildProduct(p)); n++; }
console.log(`✓ shop.html (${products.length} product cards + ${OFFERS.length}-slide offers carousel)`);
console.log(`✓ cart.html`);
console.log(`✓ product/<slug>/index.html × ${n}`);
