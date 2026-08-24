/* READ-ONLY inspector for the "Phase 1" sheet tab. Writes nothing.
   Confirms row count, maps columns, checks pricing/stock/images/variants.
     node --env-file=.env scripts/inspect-phase1.mjs
   Aggregates only — never dumps full rows. */
import { sheetRead } from "./lib/google.mjs";

const TAB = "Phase 1";
const raw = await sheetRead(`${TAB}!A1:BB400`);
if (!raw.length) { console.log("Empty or missing tab:", TAB); process.exit(1); }

const headers = raw[0].map(h => String(h ?? "").trim());
const data = raw.slice(1).filter(r => r.join("").trim() !== "");
const H = {}; headers.forEach((h, i) => { if (h && H[h] === undefined) H[h] = i; });
const idx = n => (H[n] ?? -1);
const val = (r, n) => { const i = idx(n); return i < 0 ? "" : String(r[i] ?? "").trim(); };
const letter = i => { let s = "", n = i; do { s = String.fromCharCode(65 + n % 26) + s; n = Math.floor(n / 26) - 1; } while (n >= 0); return s; };
const pct = n => (100 * n / data.length).toFixed(0) + "%";
const num = x => { const n = parseFloat(String(x ?? "").replace(/[^\d.]/g, "")); return isNaN(n) ? NaN : n; };
const bar = i => { let f = 0; for (const r of data) if (String(r[i] ?? "").trim() !== "") f++; return f; };

const L = "=".repeat(74);
console.log(L, `\nPHASE 1 INSPECTION  tab="${TAB}"  columns=${headers.length}  data rows=${data.length}\n`, L);

// 1. Column map + fill
console.log("\n1) COLUMNS (letter · name · fill%)");
headers.forEach((h, i) => { if (!h) return; console.log(`  ${letter(i).padStart(2)}  ${h.slice(0,28).padEnd(29)} ${pct(bar(i)).padStart(4)} (${bar(i)})`); });

// expected columns check
const expected = ["Category","Subcategory","Variety Group","Product Name","Botanical Name","Common / Search Names","Size","Size Code","My SKU","Buying Price","Transport Cost","Actual Price","Selling Price","Stock","Stock Status","Website Collection","Search Intent","Functional Traits","Light Requirement","Watering","Indoor / Outdoor","Maintenance","Growth Rate","Mature Size","Container Suitable","Fruit Bearing","Flowering","Edible","Pet Friendly Claim","Air Purifying Claim","Vastu / Wellness Tag","SEO Title","SEO Meta Description","SEO Keywords","Notes","URL Slug","Product Type","Variant Title","Option 1","Option 2","Option 3","Tags","Product Description","Weight (g)","Primary Image URL","Requires Shipping","Taxable","Image 2","Image 3","Image 4","Image 5"];
const missing = expected.filter(e => !(e in H));
const extra = headers.filter(h => h && !expected.includes(h));
console.log(`\n   expected 51 cols → missing: ${missing.length ? missing.join(", ") : "none"} | unexpected: ${extra.length ? extra.join(", ") : "none"}`);

// 2. SKU integrity
const skuCol = idx("My SKU");
const skus = new Map();
for (const r of data) { const s = String(r[skuCol] ?? "").trim(); if (s) skus.set(s, (skus.get(s)||0)+1); }
const dupSku = [...skus].filter(([,n]) => n>1);
console.log(`\n2) MY SKU: ${bar(skuCol)} filled (${pct(bar(skuCol))}), ${skus.size} distinct, ${dupSku.length} duplicated`);
dupSku.slice(0,10).forEach(([k,n]) => console.log(`     ⚠ ${k} ×${n}`));

// 3. Distributions
dist("3) CATEGORY", "Category");
dist("4) SUBCATEGORY", "Subcategory", 40);

// 5. Variety group
{ const i = idx("Variety Group"); const set = new Set(); for (const r of data) { const v=String(r[i]??"").trim(); if(v) set.add(v);} console.log(`\n5) VARIETY GROUP: ${set.size} distinct, ${pct(bar(i))} filled`); }

// 6. Functional traits vocab
vocab("6) FUNCTIONAL TRAITS", "Functional Traits");

// 7. Pricing
{
  const s = idx("Selling Price"), a = idx("Actual Price");
  let sBlank=0,sZero=0, aGt=0,aEq=0,aLt=0,aBlank=0;
  for (const r of data) {
    const sv = num(r[s]); if (String(r[s]??"").trim()==="") sBlank++; else if (sv===0) sZero++;
    const av = num(r[a]); if (String(r[a]??"").trim()==="") aBlank++;
    else if (!isNaN(sv)) { if (av>sv) aGt++; else if (av===sv) aEq++; else aLt++; }
  }
  console.log(`\n7) PRICING`);
  console.log(`     Selling Price: blank ${sBlank}, zero ${sZero}`);
  console.log(`     Actual Price: blank ${aBlank} | Actual>Selling ${aGt}, Actual==Selling ${aEq}, Actual<Selling ${aLt}`);
  console.log(`     (if Actual>Selling dominates → Actual is a compare-at/MRP; if mostly == → same as selling)`);
}

// 8. Stock
dist("8) STOCK STATUS", "Stock Status");

// 9. Images
{
  const p = idx("Primary Image URL");
  console.log(`\n9) IMAGES`);
  console.log(`     Primary Image URL filled: ${bar(p)} (${pct(bar(p))})`);
  const hosts = new Map();
  for (const r of data) { const u=String(r[p]??"").trim(); if(!u) continue; try { const h=new URL(u).hostname; hosts.set(h,(hosts.get(h)||0)+1);}catch{ hosts.set("(not a URL)",(hosts.get("(not a URL)")||0)+1);} }
  [...hosts].sort((a,b)=>b[1]-a[1]).forEach(([h,n])=>console.log(`       ${String(n).padStart(4)}  ${h}`));
  ["Image 2","Image 3","Image 4","Image 5"].forEach(c => { const i=idx(c); console.log(`     ${c}: ${bar(i)} filled (${pct(bar(i))})`); });
}

// 10. Variants (same slug, different size)
{
  const sl = idx("URL Slug"), sz = idx("Size");
  const bySlug = {}; for (const r of data) { const s=String(r[sl]??"").trim()||("__"+String(r[skuCol]??"")); (bySlug[s]??=[]).push(r); }
  const multi = Object.entries(bySlug).filter(([,a]) => a.length>1);
  const trueVar = multi.filter(([,a]) => new Set(a.map(r=>String(r[sz]??"").trim())).size > 1);
  const exactDup = multi.filter(([,a]) => new Set(a.map(r=>String(r[sz]??"").trim())).size === 1);
  console.log(`\n10) VARIANTS / SLUGS`);
  console.log(`     ${Object.keys(bySlug).length} distinct slugs; ${multi.length} slugs with >1 row`);
  console.log(`     → ${trueVar.length} look like real size-variant groups (same slug, different sizes)`);
  console.log(`     → ${exactDup.length} look like duplicate listings (same slug, same size)`);
  trueVar.slice(0,8).forEach(([s,a]) => console.log(`       variant: ${s} → ${a.map(r=>String(r[sz]??"").trim()||"?").join(", ")}`));
  exactDup.slice(0,8).forEach(([s,a]) => console.log(`       ⚠ dup: ${s} ×${a.length} (${a.map(r=>String(r[skuCol]??"").trim()).join(", ")})`));
}

// 11. Flags column presence
["Requires Shipping","Taxable"].forEach(c => dist(`11) ${c}`, c));

console.log("\n" + L + "\nEND\n" + L);

function dist(title, name, limit=99) {
  const i = idx(name); if (i<0) { console.log(`\n${title}: (column not found)`); return; }
  const m = new Map(); for (const r of data){ const v=String(r[i]??"").trim()||"(blank)"; m.set(v,(m.get(v)||0)+1);}
  const s = [...m].sort((a,b)=>b[1]-a[1]);
  console.log(`\n${title}: ${s.filter(([k])=>k!=="(blank)").length} distinct`);
  s.slice(0,limit).forEach(([k,n]) => console.log(`     ${String(n).padStart(4)}  ${k}`));
  if (s.length>limit) console.log(`     …and ${s.length-limit} more`);
}
function vocab(title, name) {
  const i = idx(name); if (i<0) { console.log(`\n${title}: (column not found)`); return; }
  const m = new Map(); let tagged=0;
  for (const r of data){ const raw=String(r[i]??"").trim(); if(!raw) continue; tagged++; raw.split(/[,;|/]/).map(x=>x.trim()).filter(Boolean).forEach(t=>m.set(t,(m.get(t)||0)+1)); }
  const s=[...m].sort((a,b)=>b[1]-a[1]);
  console.log(`\n${title}: ${tagged} rows tagged (${pct(tagged)}), ${s.length} distinct tokens`);
  s.slice(0,30).forEach(([k,n])=>console.log(`     ${String(n).padStart(4)}  ${k}`));
  if (s.length>30) console.log(`     …and ${s.length-30} more`);
}
