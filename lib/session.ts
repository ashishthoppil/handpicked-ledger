// Shared by proxy.ts and server code — uses Web Crypto only.

export const SESSION_COOKIE = "ledger_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 400; // ~13 months (browser max)

const encoder = new TextEncoder();

/** The session token is an HMAC of a fixed label, keyed by the passcode. */
export async function sessionToken(passcode: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(passcode),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode("ledger-session-v1"));
  return Buffer.from(signature).toString("base64url");
}

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function isValidSession(token: string | undefined): Promise<boolean> {
  const passcode = process.env.APP_PASSCODE;
  // Without a passcode the app is open in development and locked in production.
  if (!passcode) return process.env.NODE_ENV !== "production";
  if (!token) return false;
  return safeEqual(token, await sessionToken(passcode));
}
