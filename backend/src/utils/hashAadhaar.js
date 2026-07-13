import crypto from "crypto";

// One-way SHA-256 hash used as the DB lookup key everywhere an Aadhaar
// number would otherwise be stored — the raw number is never persisted.
export function hashAadhaar(aadhaarNumber) {
  return crypto.createHash("sha256").update(String(aadhaarNumber)).digest("hex");
}

// Last 4 digits are not personally identifying on their own — safe to keep
// in plaintext purely so the UI can show "****-****-1234" style masking.
export function aadhaarLast4(aadhaarNumber) {
  return String(aadhaarNumber).slice(-4);
}
