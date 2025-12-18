import crypto from "crypto";

const ENC_ALGO = "aes-256-gcm";

// 32-byte secret from env, e.g. TOKEN_ENCRYPTION_KEY="base64-encoded-32-bytes"
const ENC_KEY = Buffer.from(process.env.TOKEN_ENCRYPTION_KEY!, "base64");
// sanity check in dev
if (ENC_KEY.length !== 32) {
  throw new Error("TOKEN_ENCRYPTION_KEY must be 32 bytes (base64 encoded)");
}

export function encryptToken(plain: string): string {
  const iv = crypto.randomBytes(12); // 96-bit IV is recommended for GCM
  const cipher = crypto.createCipheriv(ENC_ALGO, ENC_KEY, iv);

  const ciphertext = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();

  // store iv:ciphertext:tag as base64 segments
  return [
    iv.toString("base64"),
    ciphertext.toString("base64"),
    authTag.toString("base64"),
  ].join(".");
}

export function decryptToken(enc: string): string {
  const [ivB64, ctB64, tagB64] = enc.split(".");
  if (!ivB64 || !ctB64 || !tagB64) {
    throw new Error("Invalid encrypted token format");
  }

  const iv = Buffer.from(ivB64, "base64");
  const ciphertext = Buffer.from(ctB64, "base64");
  const authTag = Buffer.from(tagB64, "base64");

  const decipher = crypto.createDecipheriv(ENC_ALGO, ENC_KEY, iv);
  decipher.setAuthTag(authTag);

  const plain = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  return plain.toString("utf8");
}