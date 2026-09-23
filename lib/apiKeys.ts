import crypto from "crypto";

const PREFIX = "sk-gw-";

/**
 * Generates a brand-new platform API key.
 * - `fullKey`   -> shown to the user ONCE, right after creation. Never stored.
 * - `hash`      -> sha256 hash stored in the database, used to verify requests.
 * - `display`   -> short, safe-to-display version (e.g. "sk-gw-4f9a1c...9b2d")
 */
export function generateApiKey() {
  const secret = crypto.randomBytes(24).toString("hex"); // 48 hex chars
  const fullKey = `${PREFIX}${secret}`;
  const hash = hashApiKey(fullKey);
  const display = `${fullKey.slice(0, 12)}...${fullKey.slice(-4)}`;
  return { fullKey, hash, display };
}

export function hashApiKey(key: string) {
  return crypto.createHash("sha256").update(key).digest("hex");
}
