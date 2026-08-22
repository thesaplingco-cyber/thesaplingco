/* ==========================================================================
   CLI to read/edit the Google Sheet as directed (local dev).
   Run with Node 20+ using the env file (never commit .env):

     node --env-file=.env scripts/sheet.mjs read  "Sheet1!A1:Z100"
     node --env-file=.env scripts/sheet.mjs json  "Sheet1!A1:Z100"   # rows as objects (header row)
     node --env-file=.env scripts/sheet.mjs append "Sheet1!A:Z"  val1 val2 val3
     node --env-file=.env scripts/sheet.mjs update "Sheet1!C2"    "New value"
   ========================================================================== */
import { sheetRead, sheetAppend, sheetUpdate } from "./lib/google.mjs";

const [, , cmd, range, ...cells] = process.argv;

function toObjects(rows) {
  if (!rows.length) return [];
  const headers = rows[0].map((h) => String(h).trim());
  return rows.slice(1)
    .filter((r) => r.join("").trim() !== "")
    .map((r) => headers.reduce((o, h, i) => ((o[h] = r[i] ?? ""), o), {}));
}

try {
  if (cmd === "read") {
    console.log(JSON.stringify(await sheetRead(range || "A1:Z200"), null, 2));
  } else if (cmd === "json") {
    console.log(JSON.stringify(toObjects(await sheetRead(range || "A1:Z200")), null, 2));
  } else if (cmd === "append") {
    console.log(JSON.stringify(await sheetAppend(range, cells), null, 2));
  } else if (cmd === "update") {
    console.log(JSON.stringify(await sheetUpdate(range, [cells]), null, 2));
  } else {
    console.log("usage: node --env-file=.env scripts/sheet.mjs <read|json|append|update> <range> [cells...]");
    process.exit(1);
  }
} catch (e) {
  console.error("ERROR:", e.message);
  process.exit(1);
}
