/* ==========================================================================
   CATALOGUE PIPELINE  (read-only on the sheet; writes LOCAL files only)
   Reads the Google Sheet once, normalises it, and emits the data the Astro
   storefront will import at build time. Does NOT modify the sheet.

     node --env-file=.env scripts/build-catalogue.mjs

   Outputs:
     web/src/data/_raw.json          cached raw rows (so we can re-run offline)
     web/src/data/catalogue.json     normalised product records
     web/src/data/taxonomy.json      nav tree (Plants mega-menu + groups)
     web/src/data/goals.json         Shop-by-Goal facets + counts
     web/src/data/phase1.json        curated Phase-1 SKU list
     docs/data-issues.md             audit of gaps / drift / things to fix
     docs/phase-1-subset.md          human-readable Phase-1 list for sign-off
   ========================================================================== */
import { sheetRead } from "./lib/google.mjs";
import { writeFileSync } from "node:fs";

const OUT = "web/src/data";
const raw = await sheetRead("A1:AR2100");
const headers = raw[0].map(h => String(h ?? "").trim());
const rows = raw.slice(1).filter(r => r.join("").trim() !== "");
writeFileSync(`${OUT}/_raw.json`, JSON.stringify({ headers, rows }, null, 0));

const H = {}; headers.forEach((h, i) => { if (h && H[h] === undefined) H[h] = i; });
const get = (r, name) => String(r[H[name]] ?? "").trim();
const num = x => { const n = parseFloat(String(x ?? "").replace(/[^\d.]/g, "")); return isNaN(n) ? 0 : n; };
const slugify = s => String(s).toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

/* ---- Trait normalisation ------------------------------------------------ */
const TRAIT_MAP = {
  "air purifying": "Air Purifying", "air-purifying": "Air Purifying",
  "low maintenance": "Low Maintenance", "low-maintenance": "Low Maintenance",
  "low light": "Low Light", "low-light": "Low Light", "low light tolerant": "Low Light",
  "pet friendly": "Pet Friendly", "pet-friendly": "Pet Friendly",
  "vastu friendly": "Vastu Friendly", "vastu": "Vastu Friendly",
  "feng shui": "Feng Shui", "lucky": "Lucky",
  "flowering": "Flowering",
  "fruit bearing": "Fruit Bearing", "fruit-bearing": "Fruit Bearing", "fruiting plant": "Fruit Bearing",
  "succulent": "Succulent", "edible": "Edible", "fragrant": "Fragrant",
  "drought tolerant": "Drought Tolerant", "beginner friendly": "Beginner Friendly",
  "colourful foliage": "Decorative Foliage", "decorative foliage": "Decorative Foliage",
  "golden foliage": "Decorative Foliage", "decorative": "Decorative Foliage", "ornamental": "Decorative Foliage",
  "hedge": "Hedge / Privacy", "topiary": "Hedge / Privacy", "privacy screen": "Hedge / Privacy",
  "climber": "Climber", "medicinal": "Medicinal", "container suitable": "Container Suitable",
  "tropical": "Tropical", "exotic": "Exotic", "rare variety": "Rare Variety",
  "architectural": "Architectural", "heat tolerant": "Heat Tolerant",
  "indian variety": "Traditional", "traditional": "Traditional", "citrus": "Citrus",
};
// tokens that are NOT traits (sizes / marketing / category markers) — dropped from facets
const TRAIT_DROP = new Set(["xl", "large", "medium", "small", "premium", "bundle", "giftable"]);
const driftLog = new Map(); // original -> canonical (only when changed)

function normTraits(rawStr) {
  const out = new Set();
  String(rawStr || "").split(/[,;|/]/).map(s => s.trim()).filter(Boolean).forEach(t => {
    const key = t.toLowerCase();
    if (TRAIT_DROP.has(key)) return;
    const canon = TRAIT_MAP[key] || t;
    if (canon !== t) driftLog.set(t, canon);
    out.add(canon);
  });
  return [...out];
}

/* ---- Shop-by-Goal facets (curated, high-search-value) ------------------- */
const GOALS = [
  { id: "air-purifying",  label: "Air-Purifying",       traits: ["Air Purifying"],   claim: "Air Purifying Claim" },
  { id: "low-maintenance",label: "Low-Maintenance",     traits: ["Low Maintenance"] },
  { id: "low-light",      label: "Low-Light",           traits: ["Low Light"] },
  { id: "pet-friendly",   label: "Pet-Friendly",        traits: ["Pet Friendly"],    claim: "Pet Friendly Claim" },
  { id: "vastu-lucky",    label: "Vastu & Lucky",       traits: ["Vastu Friendly", "Lucky", "Feng Shui"], claim: "Vastu / Wellness Tag" },
  { id: "flowering",      label: "Flowering",           traits: ["Flowering"],       claim: "Flowering" },
  { id: "fruit-at-home",  label: "Fruit at Home",       traits: ["Fruit Bearing"],   claim: "Fruit Bearing" },
  { id: "succulents",     label: "Succulents & Cacti",  traits: ["Succulent"] },
  { id: "fragrant",       label: "Fragrant",            traits: ["Fragrant"] },
  { id: "beginner",       label: "Beginner-Friendly",   traits: ["Beginner Friendly", "Low Maintenance"] },
];
// Claim columns use phrases like "Not assigned" / "Not a primary claim" for
// negatives and "Yes" for positives — so only an explicit yes counts.
const isPositive = v => /^(yes|true|1|y)\b/i.test(String(v || "").trim());

/* ---- Category -> nav taxonomy ------------------------------------------- */
const CAT_MAP = {
  "Indoor":          { group: "Plants", type: "Indoor Plants" },
  "Fruit":           { group: "Plants", type: "Fruit Trees" },
  "Gardenscapes":    { group: "Plants", type: "Outdoor & Landscape" },
  "Garden & Outdoor":{ group: "Plants", type: "Outdoor & Landscape" },
  "Gifts":           { group: "Gifts",  type: "Plant Gifts & Hampers" },
  "Pots & Planters": { group: "Pots & Planters", type: "Planters" },
  "Garden Tools":    { group: "Gardening", type: "Tools" },
  "Gardening":       { group: "Gardening", type: "Tools" },
  "Plant Care":      { group: "Gardening", type: "Plant Care" },
  "Bundles":         { group: "Bundles", type: "Bundles & Kits" },
  "Seeds":           { group: "Hidden", type: "Seeds" },
};

/* ---- Build normalised product records ----------------------------------- */
const products = rows.map(r => {
  const cat = get(r, "Category");
  const map = CAT_MAP[cat] || { group: "Other", type: cat };
  const price = num(get(r, "New price"));
  const mrp = num(get(r, "Old price"));
  const traits = normTraits(get(r, "Functional Traits"));
  const traitSet = new Set(traits.map(t => t.toLowerCase()));

  const goals = GOALS.filter(g =>
    g.traits.some(t => traitSet.has(t.toLowerCase())) ||
    (g.claim && isPositive(get(r, g.claim)))
  ).map(g => g.id);

  return {
    sku: get(r, "My SKU"),
    name: get(r, "Product Name"),
    slug: get(r, "URL Slug") || slugify(get(r, "Product Name")),
    group: map.group, type: map.type,
    category: cat, subcategory: get(r, "Subcategory"), varietyGroup: get(r, "Variety Group"),
    botanical: get(r, "Botanical Name"), searchNames: get(r, "Common / Search Names"),
    size: get(r, "Size"), sizeCode: get(r, "Size Code"),
    price, mrp, discount: mrp > price ? Math.round((mrp - price) / mrp * 100) : 0,
    inStock: /in stock/i.test(get(r, "Stock Status")),
    collection: get(r, "Website Collection"),
    traits, goals,
    light: get(r, "Light Requirement"), watering: get(r, "Watering"),
    maintenance: get(r, "Maintenance"), indoorOutdoor: get(r, "Indoor / Outdoor"),
    seoTitle: get(r, "SEO Title"), seoDesc: get(r, "SEO Meta Description"),
    notes: get(r, "Notes"), productType: get(r, "Product Type"),
    tags: get(r, "Tags").split(/[,;|]/).map(s => s.trim()).filter(Boolean),
    description: get(r, "Product Description"),
    variantTitle: get(r, "Variant Title"),
    // richness score: how publish-ready the copy is
    rich: ["Botanical Name","Light Requirement","Watering","Maintenance","Notes"].filter(f => get(r, f) !== "").length
        + (traits.length ? 1 : 0) + (get(r, "Variety Group") ? 1 : 0),
    image: null, // real photo URL (Cloudflare R2) — to be filled
  };
});

/* ---- Taxonomy tree ------------------------------------------------------ */
const groupsOrder = ["Plants", "Gifts", "Pots & Planters", "Gardening", "Bundles"];
const taxonomy = groupsOrder.map(g => {
  const inGroup = products.filter(p => p.group === g);
  const types = [...new Set(inGroup.map(p => p.type))].map(t => {
    const items = inGroup.filter(p => p.type === t);
    const subs = [...new Set(items.map(p => p.subcategory).filter(Boolean))]
      .map(s => ({ name: s, slug: slugify(s), count: items.filter(p => p.subcategory === s).length }))
      .sort((a, b) => b.count - a.count);
    return { name: t, slug: slugify(t), count: items.length, subcategories: subs };
  }).sort((a, b) => b.count - a.count);
  return { group: g, slug: slugify(g), count: inGroup.length, types };
});

/* ---- Goal facet counts -------------------------------------------------- */
const goalCounts = GOALS.map(g => ({
  id: g.id, label: g.label,
  count: products.filter(p => p.goals.includes(g.id)).length,
  inStock: products.filter(p => p.goals.includes(g.id) && p.inStock).length,
}));

/* ---- Phase-1 curated subset --------------------------------------------- */
// Transparent, tunable selection. In-stock only, prefer rich copy, guarantee
// category coverage + one strong SKU per variety group.
const QUOTAS = { "Fruit Trees": 40, "Indoor Plants": 70, "Outdoor & Landscape": 15, "Plant Gifts & Hampers": 20, "Planters": 10, "Bundles & Kits": 8, "Tools": 6 };
const pool = products.filter(p => p.inStock && p.group !== "Hidden" && p.group !== "Other");
const byScore = (a, b) => b.rich - a.rich || b.discount - a.discount;

const chosen = new Map(); // sku -> product
// 1) best-in-variety-group (diversity)
const groups = {};
for (const p of pool) if (p.varietyGroup) (groups[p.varietyGroup] ||= []).push(p);
for (const g of Object.values(groups)) { const best = g.sort(byScore)[0]; if (best) chosen.set(best.sku, best); }
// 2) fill category quotas by score
for (const [type, q] of Object.entries(QUOTAS)) {
  const have = [...chosen.values()].filter(p => p.type === type).length;
  const need = Math.max(0, q - have);
  pool.filter(p => p.type === type && !chosen.has(p.sku)).sort(byScore).slice(0, need)
    .forEach(p => chosen.set(p.sku, p));
}
const phase1 = [...chosen.values()].sort((a, b) => a.type.localeCompare(b.type) || byScore(a, b));

/* ---- Write outputs ------------------------------------------------------ */
writeFileSync(`${OUT}/catalogue.json`, JSON.stringify(products));
writeFileSync(`${OUT}/taxonomy.json`, JSON.stringify(taxonomy, null, 2));
writeFileSync(`${OUT}/goals.json`, JSON.stringify(goalCounts, null, 2));
writeFileSync(`${OUT}/phase1.json`, JSON.stringify(phase1.map(p => p.sku), null, 2));

/* ---- docs/data-issues.md ------------------------------------------------ */
const fillRate = name => { const i = H[name]; let n = 0; for (const r of rows) if (String(r[i] ?? "").trim() !== "") n++; return Math.round(100 * n / rows.length); };
const issues = [];
issues.push(`# Data audit & issues — generated ${new Date().toISOString().slice(0, 10)}\n`);
issues.push(`**${products.length} products, ${headers.length} columns.** ${pool.length} in stock, ${products.length - pool.length} out of stock.\n`);
issues.push(`## Missing columns to add (after sign-off)\n- **Image URL(s)** — none exist; needed for real photos (Cloudflare R2).\n- **Bengali Name / Bengali Description** — none exist; needed for the Bangla version.\n`);
issues.push(`## Fill rates for detail fields (fill over time)\n` +
  ["Variety Group","Botanical Name","Light Requirement","Watering","Maintenance","Functional Traits","Growth Rate","Mature Size","Container Suitable"]
    .map(f => `- ${f}: ${fillRate(f)}%`).join("\n") + "\n");
issues.push(`## Trait vocabulary normalised (${driftLog.size} variants remapped in code)\n` +
  [...driftLog.entries()].map(([o, c]) => `- \`${o}\` → \`${c}\``).join("\n") + "\n\n" +
  `Dropped from traits (not goals): ${[...TRAIT_DROP].join(", ")}.\n`);
issues.push(`## Tiny subcategories (consider merging/hiding)\n` +
  taxonomy.flatMap(g => g.types.flatMap(t => t.subcategories.filter(s => s.count <= 3)
    .map(s => `- ${g.group} › ${t.name} › ${s.name} (${s.count})`))).join("\n") + "\n");
{
  const bySlug = {}; products.forEach(p => (bySlug[p.slug] ||= []).push(p));
  const dupes = Object.entries(bySlug).filter(([, a]) => a.length > 1);
  issues.push(`## Duplicate listings (${dupes.length} slugs) — likely data-entry dupes to remove\n` +
    dupes.map(([s, a]) => `- \`${s}\` ×${a.length}: ${a.map(p => p.sku).join(", ")}`).join("\n") + "\n");
}
issues.push(`## Category → nav mapping\n` + taxonomy.map(g =>
  `- **${g.group}** (${g.count}): ${g.types.map(t => `${t.name} ${t.count}`).join(", ")}`).join("\n") +
  `\n- **Hidden for now:** Seeds (${products.filter(p => p.group === "Hidden").length}) — too few to feature.\n`);
writeFileSync("docs/data-issues.md", issues.join("\n"));

/* ---- docs/phase-1-subset.md --------------------------------------------- */
const byType = {};
for (const p of phase1) (byType[p.type] ||= []).push(p);
let md = `# Phase-1 subset — ${phase1.length} SKUs (draft for your sign-off)\n\n`;
md += `Selection rule: **in-stock only**, one strongest SKU per variety group, then filled to category quotas by copy-richness. Tunable in \`scripts/build-catalogue.mjs\` (QUOTAS).\n\n`;
md += `| Count | Category |\n|---:|---|\n` + Object.entries(byType).map(([t, a]) => `| ${a.length} | ${t} |`).join("\n") + `\n\n`;
for (const [t, arr] of Object.entries(byType)) {
  md += `## ${t} (${arr.length})\n\n| SKU | Product | Size | ₹ | MRP | Rich |\n|---|---|---|---:|---:|---:|\n`;
  md += arr.map(p => `| ${p.sku} | ${p.name} | ${p.size} | ${p.price} | ${p.mrp} | ${p.rich} |`).join("\n") + "\n\n";
}
writeFileSync("docs/phase-1-subset.md", md);

/* ---- console summary ---------------------------------------------------- */
console.log(`✓ ${products.length} products normalised → ${OUT}/catalogue.json`);
console.log(`✓ taxonomy: ${taxonomy.map(g => `${g.group}(${g.count})`).join(" · ")}`);
console.log(`✓ goals:`); goalCounts.forEach(g => console.log(`    ${g.label.padEnd(18)} ${String(g.inStock).padStart(4)} in stock  (${g.count} total)`));
console.log(`✓ trait variants remapped: ${driftLog.size}`);
console.log(`✓ Phase-1 draft: ${phase1.length} SKUs → docs/phase-1-subset.md`);
Object.entries(byType).forEach(([t, a]) => console.log(`    ${t.padEnd(22)} ${a.length}`));
console.log(`✓ docs/data-issues.md written`);
