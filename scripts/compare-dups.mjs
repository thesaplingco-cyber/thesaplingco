/* Compare existing vs newly-added variants for the duplicated products. */
import { sheetRead } from "./lib/google.mjs";
const raw = await sheetRead("Phase 1!A1:AY400");
const headers = raw[0].map(h => String(h ?? "").trim());
const H = {}; headers.forEach((h, i) => { if (h && H[h] === undefined) H[h] = i; });
const v = (r, n) => String((r || [])[H[n]] ?? "").trim();

for (const name of ["Fiddle Leaf Fig Plant - Bambino", "Rubber Plant"]) {
  console.log("\n" + "=".repeat(90) + `\n${name}\n` + "=".repeat(90));
  const rows = [];
  raw.forEach((r, i) => { if (r && v(r, "Product Name") === name) rows.push({ sheetRow: i + 1, r }); });
  console.log("row  where     SKU                              size  Option1/2/3                    ₹sell  slug");
  for (const { sheetRow, r } of rows) {
    const where = sheetRow <= 251 ? "EXISTING" : "NEW";
    const opts = [v(r, "Option 1"), v(r, "Option 2"), v(r, "Option 3")].filter(Boolean).join(" / ");
    console.log(
      String(sheetRow).padEnd(4),
      where.padEnd(9),
      v(r, "My SKU").padEnd(33),
      v(r, "Size").padEnd(5),
      opts.padEnd(30),
      v(r, "Selling Price").padEnd(6),
      v(r, "URL Slug")
    );
  }
  // overlap by option-combo
  const combo = r => [v(r, "Size"), v(r, "Option 1"), v(r, "Option 2"), v(r, "Option 3")].join("|").toLowerCase();
  const ex = new Set(rows.filter(x => x.sheetRow <= 251).map(x => combo(x.r)));
  const newRows = rows.filter(x => x.sheetRow > 251);
  const overlapping = newRows.filter(x => ex.has(combo(x.r)));
  const fresh = newRows.filter(x => !ex.has(combo(x.r)));
  console.log(`\n  → new rows that DUPLICATE an existing size/pot combo: ${overlapping.length}`);
  console.log(`  → new rows that add a genuinely NEW size/pot combo:  ${fresh.length}` + (fresh.length ? " → " + fresh.map(x => x.sheetRow).join(", ") : ""));
}
