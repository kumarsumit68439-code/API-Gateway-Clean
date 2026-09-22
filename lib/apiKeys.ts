import crypto from "crypto";

const PREFIX = "sk-gw-";

/**
 * Generate a new API key.
 * Returns:
 *  - fullKey  -> the plaintext key (show once to the user)
 *  - hash     -> SHA-256 hash stored in DB
 *  - display  -> short, safe-to-display version (e.g. "sk-gw-4f9a1c...9b2d")
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
