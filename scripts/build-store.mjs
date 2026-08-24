/* ==========================================================================
   STORE DATA LAYER  —  Google Sheet ("Phase 1" tab)  →  catalogue JSON
   Read-only on the sheet. Emits a customer-SAFE catalogue the storefront reads.
   Rows that are the SAME product in different pots/sizes (same Product Name)
   are grouped into ONE product with a `variants[]` list — each variant keeps
   its own SKU / price / stock / image (per the variant spec).

     node --env-file=.env scripts/build-store.mjs
     node --env-file=.env scripts/build-store.mjs "Phase 2"   # future phases

   NEVER emits internal fields (Buying Price, Transport Cost, exact Stock qty).
   ========================================================================== */
import { sheetRead } from "./lib/google.mjs";
import { writeFileSync, mkdirSync } from "node:fs";

const PHASE = process.argv[2] || "Phase 1";
const OUT_DIR = "assets/data";
const raw = await sheetRead(`${PHASE}!A1:BB400`);
if (!raw.length) { console.error("No data in tab:", PHASE); process.exit(1); }

const headers = raw[0].map(h => String(h ?? "").trim());
const rows = raw.slice(1).filter(r => r.join("").trim() !== "");
const H = {}; headers.forEach((h, i) => { if (h && H[h] === undefined) H[h] = i; });
const g = (r, name) => String(r[H[name]] ?? "").trim();
const numOr = (x, d = 0) => { const n = parseFloat(String(x ?? "").replace(/[^\d.]/g, "")); return isNaN(n) ? d : n; };
const yes = v => /^(yes|true|1|y)\b/i.test(String(v || "").trim());
const slugify = s => String(s).toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

/* ---- trait normalisation ------------------------------------------------ */
const TRAIT_MAP = {
  "air-purifying": "Air Purifying", "air purifying": "Air Purifying",
  "low maintenance": "Low Maintenance", "low-maintenance": "Low Maintenance",
  "low light": "Low Light", "low-light": "Low Light", "low light tolerant": "Low Light",
  "pet friendly": "Pet Friendly", "pet-friendly": "Pet Friendly",
  "vastu friendly": "Vastu Friendly", "vastu": "Vastu Friendly",
  "feng shui": "Feng Shui", "lucky": "Lucky", "flowering": "Flowering",
  "fruit bearing": "Fruit Bearing", "fruiting plant": "Fruit Bearing", "fruit-bearing": "Fruit Bearing",
  "succulent": "Succulent", "edible": "Edible", "fragrant": "Fragrant",
  "drought tolerant": "Drought Tolerant", "beginner friendly": "Beginner Friendly",
  "colourful foliage": "Decorative Foliage", "decorative foliage": "Decorative Foliage",
  "decorative": "Decorative Foliage", "statement foliage": "Decorative Foliage",
  "golden foliage": "Decorative Foliage", "ornamental": "Decorative Foliage",
  "hedge": "Hedge / Privacy", "topiary": "Hedge / Privacy", "privacy screen": "Hedge / Privacy",
  "climber": "Climber", "medicinal": "Medicinal", "container suitable": "Container Suitable",
  "tropical": "Tropical", "exotic": "Exotic", "citrus": "Citrus", "architectural": "Architectural",
};
const TRAIT_DROP = new Set(["xl", "large", "medium", "small", "premium", "bundle", "giftable", "collector favourite"]);
const drift = new Map();
const normTraits = s => {
  const out = new Set();
  String(s || "").split(/[,;|/]/).map(x => x.trim()).filter(Boolean).forEach(t => {
    const k = t.toLowerCase(); if (TRAIT_DROP.has(k)) return;
    const c = TRAIT_MAP[k] || t; if (c !== t) drift.set(t, c); out.add(c);
  });
  return [...out];
};

const GOALS = [
  { id: "air-purifying",   label: "Air-Purifying",     traits: ["Air Purifying"],  claim: "Air Purifying Claim" },
  { id: "low-maintenance", label: "Low-Maintenance",   traits: ["Low Maintenance"] },
  { id: "low-light",       label: "Low-Light",         traits: ["Low Light"] },
  { id: "pet-friendly",    label: "Pet-Friendly",      traits: ["Pet Friendly"],   claim: "Pet Friendly Claim" },
  { id: "vastu-wellness",  label: "Vastu & Wellness",  traits: ["Vastu Friendly", "Lucky", "Feng Shui"], claim: "Vastu / Wellness Tag" },
  { id: "flowering",       label: "Flowering",         traits: ["Flowering"],      claim: "Flowering" },
  { id: "fruit-at-home",   label: "Fruit at Home",     traits: ["Fruit Bearing"],  claim: "Fruit Bearing" },
  { id: "succulents",      label: "Succulents",        traits: ["Succulent"] },
];

/* ---- one record per sheet row ------------------------------------------- */
const variantLabel = r => {
  const vt = g(r, "Variant Title");
  if (vt && !/^default title$/i.test(vt)) return vt;
  const opts = [g(r, "Option 1"), g(r, "Option 2"), g(r, "Option 3")].filter(o => o && !/^n\/?a$/i.test(o));
  if (opts.length) return opts.join(" / ");
  return g(r, "Size") || "Standard";
};
const rowRecords = rows.map(r => {
  const price = numOr(g(r, "Selling Price"));
  const mrp = numOr(g(r, "Actual Price"));
  const traits = normTraits(g(r, "Functional Traits"));
  const claims = {
    fruitBearing: yes(g(r, "Fruit Bearing")), flowering: yes(g(r, "Flowering")),
    edible: yes(g(r, "Edible")), petFriendly: yes(g(r, "Pet Friendly Claim")),
    airPurifying: yes(g(r, "Air Purifying Claim")), vastu: yes(g(r, "Vastu / Wellness Tag")),
  };
  return {
    name: g(r, "Product Name"), category: g(r, "Category"), subcategory: g(r, "Subcategory"),
    varietyGroup: g(r, "Variety Group"), botanical: g(r, "Botanical Name"), searchNames: g(r, "Common / Search Names"),
    sku: g(r, "My SKU"), size: g(r, "Size"), sizeCode: g(r, "Size Code"), label: variantLabel(r),
    price, mrp, discount: mrp > price ? Math.round((mrp - price) / mrp * 100) : 0,
    inStock: /in stock/i.test(g(r, "Stock Status")),
    traits, claims,
    care: {
      light: g(r, "Light Requirement"), watering: g(r, "Watering"), maintenance: g(r, "Maintenance"),
      growthRate: g(r, "Growth Rate"), matureSize: g(r, "Mature Size"),
      containerSuitable: g(r, "Container Suitable"), indoorOutdoor: g(r, "Indoor / Outdoor"),
    },
    notes: g(r, "Notes"), description: g(r, "Product Description"), productType: g(r, "Product Type"),
    tags: g(r, "Tags").split(/[,;|]/).map(s => s.trim()).filter(Boolean),
    images: ["Primary Image URL", "Image 2", "Image 3", "Image 4", "Image 5"].map(c => g(r, c)).filter(Boolean),
    seo: { title: g(r, "SEO Title"), description: g(r, "SEO Meta Description"), keywords: g(r, "SEO Keywords") },
    slug: g(r, "URL Slug") || slugify(g(r, "Product Name")),
    searchIntent: g(r, "Search Intent"),
  };
});

/* ---- group rows into products by Product Name --------------------------- */
const groups = new Map();
for (const r of rowRecords) {
  const key = r.name.trim().toLowerCase();
  if (!groups.has(key)) groups.set(key, []);
  groups.get(key).push(r);
}

const usedSlugs = new Set();
const uniqueSlug = base => { let s = base || "product", i = 2; while (usedSlugs.has(s)) s = `${base}-${i++}`; usedSlugs.add(s); return s; };

const products = [...groups.values()].map(vs => {
  vs.sort((a, b) => (b.inStock - a.inStock) || (a.price - b.price));
  const d = vs[0]; // default (first in-stock, cheapest)
  const traits = [...new Set(vs.flatMap(v => v.traits))];
  const tl = new Set(traits.map(t => t.toLowerCase()));
  const anyClaim = key => vs.some(v => v.claims[key]);
  const claims = { fruitBearing: anyClaim("fruitBearing"), flowering: anyClaim("flowering"), edible: anyClaim("edible"),
    petFriendly: anyClaim("petFriendly"), airPurifying: anyClaim("airPurifying"), vastu: anyClaim("vastu") };
  const goals = GOALS.filter(go => go.traits.some(t => tl.has(t.toLowerCase())) || (go.claim && claims[claimKey(go.claim)]))
    .map(go => go.id);
  const prices = vs.map(v => v.price);
  const sizes = [...new Set(vs.map(v => v.size).filter(Boolean))];
  // de-dup identical variant labels (rare true dupes) by appending pot/sku hint
  const seenL = {};
  const variants = vs.map(v => {
    let label = v.label; if (seenL[label]) label = `${label} (${v.sku.slice(-4)})`; seenL[v.label] = 1;
    return { sku: v.sku, label, size: v.size, price: v.price, mrp: v.mrp, discount: v.discount, inStock: v.inStock, image: v.images[0] || "" };
  });

  return {
    slug: uniqueSlug(slugify(d.name)),
    name: d.name, category: d.category, subcategory: d.subcategory, varietyGroup: d.varietyGroup,
    botanical: d.botanical, searchNames: d.searchNames,
    priceMin: Math.min(...prices), priceMax: Math.max(...prices),
    mrp: d.mrp, discount: d.discount,
    inStock: vs.some(v => v.inStock),
    traits, goals, claims,
    care: d.care, notes: d.notes, description: d.description, productType: d.productType,
    tags: d.tags, sizes, image: d.images[0] || "", images: d.images,
    variants,
    seo: d.seo,
    _search: [d.name, d.botanical, d.searchNames, d.varietyGroup, d.tags.join(" "),
      vs.map(v => v.label).join(" "), d.searchIntent].filter(Boolean).join(" · ").toLowerCase(),
  };
});
function claimKey(col) {
  return { "Air Purifying Claim": "airPurifying", "Pet Friendly Claim": "petFriendly",
    "Vastu / Wellness Tag": "vastu", "Flowering": "flowering", "Fruit Bearing": "fruitBearing" }[col];
}

products.sort((a, b) => (b.inStock - a.inStock) || a.name.localeCompare(b.name));

/* ---- taxonomy + goals (GROUP-level counts, matching what's shown) ------- */
const catCounts = {}; products.forEach(p => (catCounts[p.category] = (catCounts[p.category] || 0) + 1));
const taxonomy = Object.entries(catCounts).sort((a, b) => b[1] - a[1]).map(([cat, count]) => {
  const items = products.filter(p => p.category === cat);
  const subs = {}; items.forEach(p => (subs[p.subcategory] = (subs[p.subcategory] || 0) + 1));
  return { category: cat, slug: slugify(cat), count,
    subcategories: Object.entries(subs).sort((a, b) => b[1] - a[1]).map(([name, n]) => ({ name, slug: slugify(name), count: n })) };
});
const goalCounts = GOALS.map(go => ({ id: go.id, label: go.label,
  count: products.filter(p => p.goals.includes(go.id)).length })).filter(go => go.count > 0);

/* ---- write -------------------------------------------------------------- */
mkdirSync(OUT_DIR, { recursive: true });
const totalVariants = products.reduce((s, p) => s + p.variants.length, 0);
const meta = { phase: PHASE, generated: new Date().toISOString(), products: products.length, variants: totalVariants };
writeFileSync(`${OUT_DIR}/catalogue.json`, JSON.stringify({ meta, taxonomy, goals: goalCounts, products }));

let notes = `# Phase 1 data notes — generated ${new Date().toISOString().slice(0, 10)}\n\n`;
notes += `${totalVariants} sheet rows → **${products.length} products** (grouped by name; multi-pot/size rows become variants).\n`;
notes += `${products.filter(p => p.inStock).length} products in stock · ${taxonomy.length} categories · ${goalCounts.length} goals.\n\n`;
notes += `## Flags (surfaced, not changed)\n`;
notes += `- **Pricing:** Actual Price > Selling Price on all rows → shown as compare-at/MRP (strikethrough). Confirm intended.\n`;
notes += `- **Images:** hotlinked from cdn.shopify.com / commons.wikimedia.org. Move to your own CDN (R2) later.\n`;
notes += `- **Variants:** ${products.filter(p => p.variants.length > 1).length} products have multiple pot/size variants (were showing as duplicate cards before grouping).\n`;
notes += `- **Trait drift normalised (${drift.size}):** ` + [...drift.entries()].map(([o, c]) => `\`${o}\`→\`${c}\``).join(", ") + `\n`;
mkdirSync("docs", { recursive: true });
writeFileSync("docs/phase1-data-notes.md", notes);

console.log(`✓ ${totalVariants} rows → ${products.length} products (${products.filter(p => p.variants.length > 1).length} with variants) → ${OUT_DIR}/catalogue.json`);
console.log(`✓ categories: ${taxonomy.map(t => `${t.category}(${t.count})`).join(" · ")}`);
console.log(`✓ goals:`); goalCounts.forEach(go => console.log(`    ${go.label.padEnd(16)} ${String(go.count).padStart(3)}`));
console.log(`✓ trait variants normalised: ${drift.size}`);
