/* One-off: fill Subcategory (B), Variety Group (C), Notes (K), and a new
   Functional Traits column (L) for rows 2..38. Run:
   node --env-file=.env scripts/fill-classification.mjs
   Safe: verifies row alignment before writing; only touches B, C, K, L. */
import { sheetRead, sheetUpdate } from "./lib/google.mjs";

// rows 2..38, in sheet order
const subcat = [
  "Exotic & Rare Fruit","Exotic & Rare Fruit","Exotic & Rare Fruit","Everyday Orchard",
  "Indian & Traditional","Indian & Traditional","Exotic & Rare Fruit","Everyday Orchard",
  "Exotic & Rare Fruit","Indian & Traditional","Indian & Traditional","Indian & Traditional",
  "Exotic & Rare Fruit","Citrus","Citrus","Citrus","Indian & Traditional","Exotic & Rare Fruit",
  "Indian & Traditional","Citrus","Indian & Traditional","Indian & Traditional",
  "Palms & Cycads","Palms & Cycads","Foliage & Ornamental","Foliage & Ornamental",
  "Foliage & Ornamental","Hedge & Topiary","Hedge & Topiary","Hedge & Topiary",
  "Foliage & Ornamental","Foliage & Ornamental","Palms & Cycads","Foliage & Ornamental",
  "Decorative Foliage","Decorative Foliage","Decorative Foliage",
];

const vgroup = [
  "Mango","Mango","Mango","Coconut","Starfruit","Guava","Guava","Ber","Jackfruit","Jamrul",
  "Jamrul","Pomegranate","Sapota","Citrus","Citrus","Citrus","Amla","Grape","Jamun","Citrus",
  "Custard Apple","Amra","Cycad","Palm","Croton","Dracaena","Croton","Syzygium","Thuja","Thuja",
  "Cypress","Calathea","Palm","Coleus","Aglaonema","Aglaonema","Cordyline",
];

const traits = [
  "Fruit-Bearing, Container/Terrace-Friendly, Full-Sun",
  "Fruit-Bearing, Container/Terrace-Friendly, Full-Sun",
  "Fruit-Bearing, Container/Terrace-Friendly, Full-Sun",
  "Fruit-Bearing, Full-Sun",
  "Fruit-Bearing, Container/Terrace-Friendly, Full-Sun",
  "Fruit-Bearing, Container/Terrace-Friendly, Full-Sun",
  "Fruit-Bearing, Container/Terrace-Friendly, Full-Sun",
  "Fruit-Bearing, Drought-Tolerant, Full-Sun",
  "Fruit-Bearing, Full-Sun",
  "Fruit-Bearing, Container/Terrace-Friendly, Full-Sun",
  "Fruit-Bearing, Container/Terrace-Friendly, Full-Sun",
  "Fruit-Bearing, Drought-Tolerant, Full-Sun",
  "Fruit-Bearing, Container/Terrace-Friendly, Full-Sun",
  "Fruit-Bearing, Container/Terrace-Friendly, Full-Sun",
  "Fruit-Bearing, Container/Terrace-Friendly, Full-Sun",
  "Fruit-Bearing, Container/Terrace-Friendly, Full-Sun",
  "Fruit-Bearing, Medicinal, Drought-Tolerant, Full-Sun",
  "Fruit-Bearing, Container/Terrace-Friendly, Full-Sun",
  "Fruit-Bearing, Full-Sun",
  "Fruit-Bearing, Container/Terrace-Friendly, Fragrant, Full-Sun",
  "Fruit-Bearing, Drought-Tolerant, Full-Sun",
  "Fruit-Bearing, Fast-Growing, Full-Sun",
  "Low-Maintenance, Drought-Tolerant, Evergreen, Full-Sun",
  "Low-Maintenance, Shade-Loving, Evergreen, Container/Terrace-Friendly",
  "Full-Sun, Evergreen, Fast-Growing",
  "Air-Purifying, Low-Maintenance, Drought-Tolerant, Low-Light Tolerant",
  "Full-Sun, Evergreen, Fast-Growing",
  "Hedge/Screening, Evergreen, Fast-Growing",
  "Hedge/Screening, Evergreen, Low-Maintenance",
  "Hedge/Screening, Evergreen, Low-Maintenance",
  "Fragrant, Evergreen, Full-Sun, Container/Terrace-Friendly",
  "Pet-Friendly, Shade-Loving",
  "Air-Purifying, Pet-Friendly, Low-Maintenance, Shade-Loving",
  "Fast-Growing, Low-Maintenance, Shade-Loving",
  "Air-Purifying, Low-Light Tolerant, Low-Maintenance",
  "Air-Purifying, Low-Light Tolerant, Low-Maintenance",
  "Low-Maintenance, Evergreen, Shade-Loving",
];

const notes = [
  `The world's most prized luxury mango — Japan's Miyazaki "Egg of the Sun" fruits must top 350 g and 15% sugar, with a pair once auctioned for over ₹3 lakh.`,
  `Named for its slender, banana-like shape, this novelty mango bears heavily and eats sweet, smooth and almost fibreless.`,
  `Thai Katimon is a true all-season (baromasi) mango — it can fruit 3–4 times a year and stays sweet even while still green.`,
  `A true dwarf coconut that starts bearing in just 3–4 years and gives sweet, plentiful tender-coconut water — ideal for smaller gardens.`,
  `Slice it crosswise and every piece is a perfect five-point star — this sweet carambola (kamranga) is juicy, ornamental and rich in vitamin C.`,
  `A GI-tagged pride of Bengal's Baruipur belt, famed for large, crisp, sweet guavas and recognised in 2025 for its distinctive local quality.`,
  `A Thai imported guava with striking golden-yellow skin and crisp, sweet white flesh — a heavy yielder that fruits happily even in pots.`,
  `Apple ber (kul) bears crisp, apple-like fruit within about a year of planting — hardy, fast-growing and remarkably drought-tough.`,
  `A rare jackfruit with vivid pink-red flesh that's crisp, sweet and less fibrous than the common kind — a real collector's tree.`,
  `A prized bell-shaped water-apple (jamrul) — crunchy, sweet and lightly fragrant, and a refreshing Bengal summer favourite.`,
  `Named for its long "missile" shape, this deep-red water-apple bears big, crisp, sweet fruit and can start fruiting within a year.`,
  `Bhagwa is India's leading pomegranate — glossy saffron-red skin over deep-red, soft-seeded arils, and the variety behind most of the country's exports.`,
  `The "King of Sapota" — a long, banana-shaped chikoo named after the langcha sweet, with melt-in-mouth, honey-sweet flesh.`,
  `A semi-dwarf Vietnamese sweet-orange (malta) that can fruit twice a year with juicy 400–600 g fruits — happy in a large terrace pot.`,
  `A semi-dwarf Vietnamese sweet-orange (malta) that can fruit twice a year with juicy 400–600 g fruits — happy in a large terrace pot.`,
  `A semi-dwarf Vietnamese sweet-orange (malta) supplied as a mature, already-fruiting plant — juicy 400–600 g fruits, twice a year.`,
  `Amla (Indian gooseberry) is an Ayurvedic superfruit — one of the richest natural sources of vitamin C, with many times the content of an orange.`,
  `An early Russian hybrid grape with unusually large, elongated berries (12–15 g each) on hefty half-kilo bunches — sweet and crack-resistant.`,
  `KG-10 is a giant Thai hybrid jamun whose fruits can weigh 50–100 g — only about ten make a full kilogram.`,
  `A prolific Bengal lemon that fruits almost year-round in pots, giving thin-skinned, intensely juicy, fragrant lemons for everyday kitchens.`,
  `Custard apple (aata / sitaphal) hides sweet, creamy, custard-like pulp inside a knobbly green shell — hardy and easy even in dry soils.`,
  `Bilati amra (ambarella / June plum) bears crunchy, tangy-sweet fruit in generous bunches and starts cropping remarkably young and fast.`,
  `A living-fossil cycad that predates the dinosaurs — architectural, slow-growing and long-lived, though its seeds are toxic to pets.`,
  `The Chinese fan palm's glossy, pleated fan-shaped fronds make an elegant, low-fuss statement in shaded courtyards and bright interiors.`,
  `Crotons flaunt some of the boldest leaves in the garden — waxy foliage splashed with red, orange and gold; the more light, the brighter the colour.`,
  `A NASA-listed air-purifier with slender, arching red-edged leaves — famously tough, drought-forgiving and nearly impossible to kill.`,
  `The narrow-leaf croton adds fiery, ribbon-like foliage in reds, yellows and greens — a vivid, sun-loving accent for borders and pots.`,
  `A fast, dense evergreen that clips beautifully into hedges and topiary, flushes coppery new growth, and even bears small edible berries.`,
  `A golden-variegated Oriental arborvitae (morpankhi) with soft, feathery sprays — a bright, low-care choice for hedges and screens.`,
  `Morpankhi (Oriental arborvitae) forms soft, feather-textured evergreen columns — a go-to plant for privacy hedges and gate-side pairs.`,
  `Brush its golden foliage and it releases a fresh lemon scent — a bright, conical evergreen that's perfect in pots by a doorway.`,
  `A pet-safe "prayer plant" whose dark leaves are hand-painted with fine pink pinstripes that fold upward at night.`,
  `One of NASA's top air-purifying plants and completely pet-safe — the feathery areca is the classic, easygoing indoor palm.`,
  `Grown purely for its kaleidoscopic leaves, coleus colours shade and sun alike in maroon, lime, pink and cream — and roots from cuttings in days.`,
  `The pink Aglaonema (Chinese Evergreen) marbles rosy-pink through its leaves, thrives in low light and helps freshen indoor air.`,
  `"Lipstick" Aglaonema rims every green leaf in vivid red — a striking, low-light, air-purifying pick that's hard for beginners to kill.`,
  `The Hawaiian "good-luck" ti plant lights up rooms with glossy pink-to-burgundy sword-shaped leaves; happiest in bright, indirect light.`,
];

const N = 37; // rows 2..38
for (const [k, a] of Object.entries({ subcat, vgroup, traits, notes }))
  if (a.length !== N) throw new Error(`${k} has ${a.length} entries, expected ${N}`);

// Safety: verify row alignment against product names in column D.
const names = (await sheetRead("D2:D38")).map(r => (r[0] || "").toLowerCase());
if (!names[0].includes("miyajaki") || !names[N - 1].includes("cordyline")) {
  console.error("ALIGNMENT CHECK FAILED — rows moved. First:", names[0], "Last:", names[N - 1]);
  process.exit(1);
}
console.log("Alignment OK:", names.length, "rows (", names[0], "…", names[N - 1], ")");

await sheetUpdate("B2:B38", subcat.map(v => [v]));
console.log("✓ Subcategory (B)");
await sheetUpdate("C2:C38", vgroup.map(v => [v]));
console.log("✓ Variety Group (C)");
await sheetUpdate("K2:K38", notes.map(v => [v]));
console.log("✓ Notes (K)");
await sheetUpdate("L1:L38", [["Functional Traits"], ...traits.map(v => [v])]);
console.log("✓ Functional Traits (new column L, incl. header)");
console.log("Done.");
