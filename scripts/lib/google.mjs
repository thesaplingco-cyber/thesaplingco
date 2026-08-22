/* ==========================================================================
   Google service-account auth (no SDK) + Sheets REST v4.
   - Hand-builds an RS256 JWT, signs it with Web Crypto (crypto.subtle),
     exchanges it for a 1h OAuth token, then calls the Sheets v4 REST API.
   - Runs both in Node 20+ (global crypto.subtle) and Cloudflare Workers,
     so the SAME code powers local edits now and the cart backend later.
   - Least privilege: read uses spreadsheets.readonly, write uses spreadsheets.
   Credentials come from env (never hard-coded, never committed):
     GOOGLE_SERVICE_ACCOUNT_B64  base64 of the service-account JSON key
     GOOGLE_SHEET_ID             the spreadsheet id
   ========================================================================== */

const TOKEN_URL = "https://oauth2.googleapis.com/token";
const SHEETS = "https://sheets.googleapis.com/v4/spreadsheets";
export const SCOPE_READ = "https://www.googleapis.com/auth/spreadsheets.readonly";
export const SCOPE_WRITE = "https://www.googleapis.com/auth/spreadsheets";

function envVal(name, env) {
  if (env && env[name] != null) return env[name];
  if (typeof process !== "undefined" && process.env && process.env[name] != null) return process.env[name];
  return undefined;
}

function b64urlFromBytes(input) {
  const arr = input instanceof Uint8Array ? input : new Uint8Array(input);
  let bin = "";
  for (let i = 0; i < arr.length; i++) bin += String.fromCharCode(arr[i]);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function b64urlFromString(s) { return b64urlFromBytes(new TextEncoder().encode(s)); }

function decodeB64ToString(b64) {
  if (typeof Buffer !== "undefined") return Buffer.from(b64, "base64").toString("utf8");
  return atob(b64); // service-account JSON is ASCII, so atob is safe in Workers
}

function getServiceAccount(env) {
  const b64 = envVal("GOOGLE_SERVICE_ACCOUNT_B64", env);
  if (!b64) throw new Error("GOOGLE_SERVICE_ACCOUNT_B64 is not set");
  return JSON.parse(decodeB64ToString(b64.trim()));
}

function pkcs8FromPem(pem) {
  const body = pem.replace(/-----BEGIN PRIVATE KEY-----/, "")
                  .replace(/-----END PRIVATE KEY-----/, "")
                  .replace(/\s+/g, "");
  const raw = atob(body);
  const bytes = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
  return bytes.buffer;
}

export async function getGoogleToken(scope, env) {
  const sa = getServiceAccount(env);
  const now = Math.floor(Date.now() / 1000);
  const header = b64urlFromString(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claim = b64urlFromString(JSON.stringify({
    iss: sa.client_email, scope, aud: TOKEN_URL, iat: now, exp: now + 3600,
  }));
  const signingInput = `${header}.${claim}`;
  const key = await crypto.subtle.importKey(
    "pkcs8", pkcs8FromPem(sa.private_key),
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["sign"]
  );
  const sig = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", key, new TextEncoder().encode(signingInput));
  const jwt = `${signingInput}.${b64urlFromBytes(sig)}`;

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion: jwt }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error("token exchange failed: " + JSON.stringify(data));
  return data.access_token;
}

function sheetId(env) {
  const id = envVal("GOOGLE_SHEET_ID", env);
  if (!id) throw new Error("GOOGLE_SHEET_ID is not set");
  return id;
}

/** Read a range → 2D array of values. */
export async function sheetRead(range, env) {
  const token = await getGoogleToken(SCOPE_READ, env);
  const url = `${SHEETS}/${sheetId(env)}/values/${encodeURIComponent(range)}`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  const data = await res.json();
  if (!res.ok) throw new Error("read failed: " + JSON.stringify(data));
  return data.values || [];
}

/** Append one row to a range (INSERT_ROWS, never overwrites). */
export async function sheetAppend(range, row, env) {
  const token = await getGoogleToken(SCOPE_WRITE, env);
  const url = `${SHEETS}/${sheetId(env)}/values/${encodeURIComponent(range)}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`;
  const res = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ values: [row] }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error("append failed: " + JSON.stringify(data));
  return data;
}

/** In-place update of a range (PUT). values = 2D array. */
export async function sheetUpdate(range, values, env) {
  const token = await getGoogleToken(SCOPE_WRITE, env);
  const url = `${SHEETS}/${sheetId(env)}/values/${encodeURIComponent(range)}?valueInputOption=USER_ENTERED`;
  const res = await fetch(url, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ values }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error("update failed: " + JSON.stringify(data));
  return data;
}
