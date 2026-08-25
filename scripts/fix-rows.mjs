/* Fix the new Phase-1 rows + standardise Website Collection.
   Dry-run by default; pass --apply to write to the sheet.
     node --env-file=.env scripts/fix-rows.mjs          # preview
     node --env-file=.env scripts/fix-rows.mjs --apply  # write */
import { sheetRead, sheetUpdate } from "./lib/google.mjs";
const APPLY = process.argv.includes("--apply");

const raw = await sheetRead("Phase 1!A1:AY400");
const headers = raw[0].map(h => String(h ?? "").trim());
const H = {}; headers.forEach((h, i) => { if (h && H[h] === undefined) H[h] = i; });
const v = (r, n) => String((r || [])[H[n]] ?? "").trim();
const LAST = 281; // last data row

const LABEL = { Fruit: "Fruit Plants", Indoor: "Indoor Plants", Gardenscapes: "Gardenscapes" };

// 1) Website Collection for every row 2..281
const wcVals = [];
let wcChanged = 0;
for (let s = 2; s <= LAST; s++) {
  const r = raw[s - 1]; const cat = v(r, "Category"), sub = v(r, "Subcategory");
  const want = (cat && sub) ? `${LABEL[cat] || cat} > ${sub}` : v(r, "Website Collection");
  if (want !== v(r, "Website Collection")) wcChanged++;
  wcVals.push([want]);
}

// 2) Image column shift for new rows 252..281
const imgVals = []; let imgChanged = 0;
for (let s = 252; s <= LAST; s++) {
  const r = raw[s - 1];
  const w = v(r, "Weight (g)"), p = v(r, "Primary Image URL"), rs = v(r, "Requires Shipping");
  // new: Weight="", Primary=oldWeight(url), RequiresShipping=oldPrimary("TRUE"), Taxable=oldReqShip("FALSE")
  imgVals.push(["", w, p || "TRUE", rs || "FALSE"]);
  if (!/^https?:/i.test(p)) imgChanged++;
}

// 3) Pomegranate SEO (row 273)
const pom = [[
  "Pomegranate Plant with Grow Bag | Buy Online in India | The Sapling Co.",
  "Buy Pomegranate plant (Punica granatum) online in India from The Sapling Co. A hardy, container-friendly fruit tree with bright red-orange flowers and juicy, antioxidant-rich arils.",
  "Pomegranate plant, buy pomegranate online, Anar plant, Punica granatum, fruit plants India, grow bag pomegranate",
]];

// 4) Vietnam typo (row 260 SEO Title)
const t260 = v(raw[259], "SEO Title").replace(/Vitenam/gi, "Vietnam");

console.log(`Website Collection: ${wcChanged} of ${LAST - 1} rows will change`);
console.log("  samples:");
[252, 253, 266, 273, 274, 2, 100].forEach(s => { const r = raw[s - 1]; console.log(`   row ${s}: "${v(r, "Website Collection")}"  →  "${wcVals[s - 2][0]}"`); });
console.log(`\nImage shift: fixing ${imgChanged} new rows (Primary Image URL currently not a URL)`);
console.log("  sample row 252: Weight→\"\", Primary→\"" + imgVals[0][1].slice(0, 55) + "…\", ReqShip→\"" + imgVals[0][2] + "\", Taxable→\"" + imgVals[0][3] + "\"");
console.log(`\nPomegranate SEO (273): "${pom[0][0]}"`);
console.log(`Vietnam typo (260):    "${t260}"`);

if (!APPLY) { console.log("\nDRY RUN — re-run with --apply to write."); process.exit(0); }

await sheetUpdate("Phase 1!P2:P" + LAST, wcVals);          console.log("✓ Website Collection");
await sheetUpdate("Phase 1!AR252:AU" + LAST, imgVals);     console.log("✓ Image columns (252–281)");
await sheetUpdate("Phase 1!AF273:AH273", pom);             console.log("✓ Pomegranate SEO");
await sheetUpdate("Phase 1!AF260", [[t260]]);              console.log("✓ Vietnam typo");
console.log("Done.");
