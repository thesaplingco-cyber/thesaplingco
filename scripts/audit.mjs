/* ==========================================================================
   READ-ONLY data audit of the catalogue sheet. Writes nothing.
   Prints only aggregates (never dumps raw rows), so it's safe + compact.
     node --env-file=.env scripts/audit.mjs
   Optional: pass a range override, e.g.
     node --env-file=.env scripts/audit.mjs "A1:AR2100"
   ========================================================================== */
import { sheetRead } from "./lib/google.mjs";

const range = process.argv[2] || "A1:AR2100";
const rows = await sheetRead(range);
if (!rows.length) { console.log("No data in", range); process.exit(0); }

const headers = rows[0].map(h => String(h ?? "").trim());
const data = rows.slice(1).filter(r => r.join("").trim() !== "");
const H = {}; headers.forEach((h, i) => { if (h && H[h] === undefined) H[h] = i; });

const col = name => (H[name] ?? -1);
const val = (r, name) => { const i = col(name); return i < 0 ? "" : String(r[i] ?? "").trim(); };
const pct = n => (100 * n / data.length).toFixed(0) + "%";

const line = "=".repeat(74);
console.log(line);
console.log(`AUDIT  range=${range}  columns=${headers.length}  data rows=${data.length}`);
console.log(line);

/* ---- 1. Column fill rates -------------------------------------------- */
console.log("\n1) COLUMN FILL RATES (non-empty / data rows)");
headers.forEach((h, i) => {
  if (!h) return;
  let filled = 0;
  for (const r of data) if (String(r[i] ?? "").trim() !== "") filled++;
  const bar = "█".repeat(Math.round(filled / data.length * 20)).padEnd(20, "·");
  console.log(`  ${String(colLetter(i)).padStart(2)} ${h.slice(0, 26).padEnd(27)} ${bar} ${pct(filled).padStart(4)} (${filled})`);
});

/* ---- 2. Category distribution ---------------------------------------- */
dist("2) CATEGORY", "Category");
dist("3) SUBCATEGORY (top 30)", "Subcategory", 30);
dist("4) STOCK STATUS", "Stock Status");

/* ---- 5. Variety Group ------------------------------------------------ */
{
  const i = col("Variety Group");
  if (i >= 0) {
    const set = new Map();
    for (const r of data) { const v = String(r[i] ?? "").trim(); if (v) set.set(v, (set.get(v) || 0) + 1); }
    console.log(`\n5) VARIETY GROUP: ${set.size} distinct groups, ${countFilled(i)} rows tagged (${pct(countFilled(i))})`);
  }
}

/* ---- 6. Functional Traits vocabulary --------------------------------- */
traitVocab("6) FUNCTIONAL TRAITS vocabulary", "Functional Traits");
traitVocab("7) SEARCH INTENT vocabulary", "Search Intent");

/* ---- 8. Duplicate SKUs ----------------------------------------------- */
{
  const i = col("My SKU");
  if (i >= 0) {
    const seen = new Map();
    for (const r of data) { const v = String(r[i] ?? "").trim(); if (v) seen.set(v, (seen.get(v) || 0) + 1); }
    const dups = [...seen.entries()].filter(([, n]) => n > 1);
    console.log(`\n8) MY SKU: ${countFilled(i)} filled (${pct(countFilled(i))}), ${seen.size} distinct, ${dups.length} duplicated`);
    dups.slice(0, 15).forEach(([k, n]) => console.log(`     ⚠ ${k} ×${n}`));
    if (dups.length > 15) console.log(`     …and ${dups.length - 15} more`);
  }
}

/* ---- 9. Price sanity ------------------------------------------------- */
{
  const ni = col("New price"), oi = col("Old price");
  if (ni >= 0) {
    let blank = 0, zero = 0, newGtOld = 0, hasOld = 0;
    for (const r of data) {
      const nv = num(r[ni]);
      if (String(r[ni] ?? "").trim() === "") blank++;
      else if (nv === 0) zero++;
      if (oi >= 0) {
        const ov = num(r[oi]);
        if (ov > 0) { hasOld++; if (nv > ov) newGtOld++; }
      }
    }
    console.log(`\n9) PRICING`);
    console.log(`     New price blank: ${blank} (${pct(blank)})   zero: ${zero}`);
    if (oi >= 0) console.log(`     Old price present: ${hasOld} (${pct(hasOld)})   New>Old (odd): ${newGtOld}`);
  }
}

/* ---- 10. Image column check ------------------------------------------ */
{
  const imgCols = headers.filter(h => /image|img|photo|url/i.test(h) && !/seo|slug/i.test(h));
  console.log(`\n10) IMAGE COLUMNS: ${imgCols.length ? imgCols.join(", ") : "NONE FOUND"}`);
}

/* ---- 11. Bengali column check --------------------------------------- */
{
  const bn = headers.filter(h => /bengali|bangla|\bbn\b/i.test(h));
  console.log(`11) BENGALI COLUMNS: ${bn.length ? bn.join(", ") : "NONE FOUND"}`);
}

/* ---- 12. Phase-1 readiness: rows complete enough to publish --------- */
{
  const need = ["Category", "Product Name", "My SKU", "New price"];
  const nice = ["Botanical Name", "Light Requirement", "Watering", "Notes", "Functional Traits"];
  let core = 0, rich = 0;
  for (const r of data) {
    if (need.every(n => val(r, n) !== "")) {
      core++;
      if (nice.filter(n => val(r, n) !== "").length >= 3) rich++;
    }
  }
  console.log(`\n12) PHASE-1 READINESS`);
  console.log(`     Rows with core fields (Cat+Name+SKU+Price): ${core} (${pct(core)})`);
  console.log(`     …of those, also ≥3 rich fields (photo-shoot ready copy): ${rich}`);
}

console.log("\n" + line + "\nEND AUDIT\n" + line);

/* ---- helpers -------------------------------------------------------- */
function countFilled(i) { let n = 0; for (const r of data) if (String(r[i] ?? "").trim() !== "") n++; return n; }
function num(x) { const n = parseFloat(String(x ?? "").replace(/[^\d.]/g, "")); return isNaN(n) ? 0 : n; }
function colLetter(i) { let s = "", n = i; do { s = String.fromCharCode(65 + (n % 26)) + s; n = Math.floor(n / 26) - 1; } while (n >= 0); return s; }
function dist(title, name, limit = 99) {
  const i = col(name);
  if (i < 0) { console.log(`\n${title}: (column not found)`); return; }
  const m = new Map();
  for (const r of data) { const v = String(r[i] ?? "").trim() || "(blank)"; m.set(v, (m.get(v) || 0) + 1); }
  const sorted = [...m.entries()].sort((a, b) => b[1] - a[1]);
  console.log(`\n${title}: ${sorted.filter(([k]) => k !== "(blank)").length} distinct`);
  sorted.slice(0, limit).forEach(([k, n]) => console.log(`     ${String(n).padStart(5)}  ${k}`));
  if (sorted.length > limit) console.log(`     …and ${sorted.length - limit} more`);
}
function traitVocab(title, name) {
  const i = col(name);
  if (i < 0) { console.log(`\n${title}: (column not found)`); return; }
  const m = new Map(); let tagged = 0;
  for (const r of data) {
    const raw = String(r[i] ?? "").trim();
    if (!raw) continue;
    tagged++;
    raw.split(/[,;|/]/).map(s => s.trim()).filter(Boolean).forEach(t => m.set(t, (m.get(t) || 0) + 1));
  }
  const sorted = [...m.entries()].sort((a, b) => b[1] - a[1]);
  console.log(`\n${title}: ${tagged} rows tagged (${pct(tagged)}), ${sorted.size} distinct tokens`);
  sorted.slice(0, 40).forEach(([k, n]) => console.log(`     ${String(n).padStart(5)}  ${k}`));
  if (sorted.length > 40) console.log(`     …and ${sorted.length - 40} more tokens (possible vocabulary drift)`);
}
