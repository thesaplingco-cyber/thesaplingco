/* READ-ONLY sanity check of newly added Phase 1 rows (sheet rows 252–281).
   Compares each new row against patterns learned from the existing rows.
     node --env-file=.env scripts/inspect-new.mjs */
import { sheetRead } from "./lib/google.mjs";

const raw = await sheetRead("Phase 1!A1:AY400");
const headers = raw[0].map(h => String(h ?? "").trim());
const H = {}; headers.forEach((h, i) => { if (h && H[h] === undefined) H[h] = i; });
const idx = n => H[n] ?? -1;
const val = (r, n) => String((r || [])[idx(n)] ?? "").trim();

// raw index = sheetRow - 1.  New rows = sheet 252..281 = raw[251..280].
const dataRows = raw.slice(1).filter(r => (r || []).join("").trim() !== "");
const existing = raw.slice(1, 251);           // sheet rows 2..251
const NEW = [];
for (let s = 252; s <= 281; s++) { const r = raw[s - 1]; if (r && r.join("").trim() !== "") NEW.push({ s, r }); }

console.log(`Total non-empty data rows now: ${dataRows.length}`);
console.log(`New rows found (252–281): ${NEW.length}\n`);

// canonical Website Collection per Category+Subcategory (from existing rows, most common)
const wc = {};
for (const r of existing) {
  const key = val(r, "Category") + " ||| " + val(r, "Subcategory");
  const v = val(r, "Website Collection");
  if (!v) continue;
  (wc[key] ||= {}); wc[key][v] = (wc[key][v] || 0) + 1;
}
const expectedWC = (cat, sub) => {
  const m = wc[cat + " ||| " + sub]; if (!m) return null;
  return Object.entries(m).sort((a, b) => b[1] - a[1])[0][0];
};

// existing SKUs + slugs for dup detection
const exSku = new Set(existing.map(r => val(r, "My SKU")).filter(Boolean));
const exSlug = new Set(existing.map(r => val(r, "URL Slug")).filter(Boolean));

const REQUIRED = headers.filter(h => h && !/^Image [2-5]$/.test(h)); // all except Image 2-5
const line = "─".repeat(80);

for (const { s, r } of NEW) {
  const blanks = REQUIRED.filter(h => val(r, h) === "");
  const cat = val(r, "Category"), sub = val(r, "Subcategory");
  const expWC = expectedWC(cat, sub), actWC = val(r, "Website Collection");
  const sell = parseFloat(val(r, "Selling Price")) || 0, act = parseFloat(val(r, "Actual Price")) || 0;
  console.log(line);
  console.log(`ROW ${s}: ${val(r, "Product Name")}  [${val(r, "My SKU")}]  size:${val(r, "Size")}`);
  console.log(`  ${cat} › ${sub} › ${val(r, "Variety Group")}   | botanical: ${val(r, "Botanical Name") || "(blank)"}`);
  console.log(`  Selling ₹${sell} / Actual ₹${act}` + (act <= sell ? "   ⚠ Actual should be > Selling" : ""));
  if (actWC !== expWC && expWC) console.log(`  ⚠ Website Collection = "${actWC}"  → expected "${expWC}"`);
  if (exSku.has(val(r, "My SKU"))) console.log(`  ⚠ SKU already exists in earlier rows`);
  if (exSlug.has(val(r, "URL Slug"))) console.log(`  ⚠ URL Slug already exists in earlier rows`);
  if (blanks.length) console.log(`  ⚠ BLANK cells (${blanks.length}): ${blanks.join(", ")}`);
  else console.log(`  ✓ all cells filled`);
}

console.log("\n" + line);
console.log("AGGREGATE — blank counts across the new rows:");
const blankCount = {};
for (const { r } of NEW) for (const h of REQUIRED) if (val(r, h) === "") blankCount[h] = (blankCount[h] || 0) + 1;
Object.entries(blankCount).sort((a, b) => b[1] - a[1]).forEach(([h, n]) => console.log(`  ${n}/${NEW.length}  ${h}`));
if (!Object.keys(blankCount).length) console.log("  none — every required cell filled.");

console.log("\nWEBSITE COLLECTION — canonical values seen in existing rows:");
Object.entries(wc).forEach(([k, m]) => { const [c, sub] = k.split(" ||| "); console.log(`  ${c} › ${sub}  →  "${Object.entries(m).sort((a,b)=>b[1]-a[1])[0][0]}"`); });

// duplicate-name check vs existing rows 2–251
const exNames = new Map();
existing.forEach(r => { const n = val(r, "Product Name").toLowerCase(); if (n) exNames.set(n, (exNames.get(n) || 0) + 1); });
console.log("\nDUPLICATE-NAME CHECK (new name already present in rows 2–251):");
let anyDup = false;
for (const { s, r } of NEW) { const n = val(r, "Product Name").toLowerCase(); if (exNames.has(n)) { console.log(`  ⚠ ROW ${s} "${val(r, "Product Name")}" also in earlier rows (${exNames.get(n)}×)`); anyDup = true; } }
if (!anyDup) console.log("  none — all new product names are unique.");

// full dump of copy-paste-suspect rows to catch contaminated SEO/Notes/traits
function dump(s) {
  const r = raw[s - 1]; console.log(`\n===== FULL DUMP · ROW ${s} =====`);
  headers.forEach((h, i) => { if (h) { const v = String(r[i] ?? "").trim(); if (v) console.log(`  ${h}: ${v.slice(0, 110)}`); } });
}
[266, 273, 274].forEach(dump);

console.log("\nIMAGE-COLUMN + SEO-CONTAMINATION CHECKS:");
for (const { s, r } of NEW) {
  const prim = val(r, "Primary Image URL"), weight = val(r, "Weight (g)");
  const seoT = val(r, "SEO Title"), name = val(r, "Product Name");
  const issues = [];
  if (!/^https?:\/\//i.test(prim)) issues.push(`Primary Image URL="${prim}"` + (/^https?:/i.test(weight) ? ` (the real URL is misplaced in Weight(g))` : ``));
  const nw = name.toLowerCase().replace(/[^a-z0-9 ]/g, " ").split(/\s+/).filter(w => w.length > 3)[0];
  if (nw && !seoT.toLowerCase().includes(nw)) issues.push(`SEO Title="${seoT}" (doesn't mention "${nw}" — likely contaminated)`);
  if (issues.length) console.log(`  ROW ${s} ${name}:\n     - ${issues.join("\n     - ")}`);
}
