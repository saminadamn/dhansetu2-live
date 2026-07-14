import { hashAadhaar, aadhaarLast4 } from "../hashAadhaar.js";

describe("hashAadhaar", () => {
  it("produces a deterministic SHA-256 hex digest", () => {
    const hash1 = hashAadhaar("123456789012");
    const hash2 = hashAadhaar("123456789012");
    expect(hash1).toBe(hash2);
    expect(hash1).toMatch(/^[0-9a-f]{64}$/);
  });

  it("produces different hashes for different inputs", () => {
    expect(hashAadhaar("123456789012")).not.toBe(hashAadhaar("123456789013"));
  });

  it("coerces non-string input (e.g. a number) consistently", () => {
    expect(hashAadhaar(123456789012)).toBe(hashAadhaar("123456789012"));
  });

  it("never returns the raw input as output", () => {
    const aadhaar = "999988887777";
    expect(hashAadhaar(aadhaar)).not.toContain(aadhaar);
  });
});

describe("aadhaarLast4", () => {
  it("returns the last 4 digits", () => {
    expect(aadhaarLast4("123456789012")).toBe("9012");
  });

  it("handles a full 12-digit number correctly regardless of leading content", () => {
    expect(aadhaarLast4("000000001234")).toBe("1234");
  });

  it("does not throw on short input, just returns what's available", () => {
    expect(aadhaarLast4("12")).toBe("12");
  });
});
