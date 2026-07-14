import { jest } from "@jest/globals";
import { correlationId } from "../correlationId.js";

function mockRes() {
  const headers = {};
  return {
    setHeader: jest.fn((name, value) => { headers[name] = value; }),
    _headers: headers,
  };
}

describe("correlationId middleware", () => {
  it("mints a fresh UUID when no inbound header is present", () => {
    const req = { headers: {} };
    const res = mockRes();
    const next = jest.fn();

    correlationId(req, res, next);

    expect(req.correlationId).toMatch(/^[0-9a-f-]{36}$/i);
    expect(res.setHeader).toHaveBeenCalledWith("x-correlation-id", req.correlationId);
    expect(next).toHaveBeenCalledTimes(1);
  });

  it("reuses an inbound X-Correlation-Id instead of minting a new one", () => {
    const req = { headers: { "x-correlation-id": "my-existing-id-123" } };
    const res = mockRes();
    const next = jest.fn();

    correlationId(req, res, next);

    expect(req.correlationId).toBe("my-existing-id-123");
    expect(res.setHeader).toHaveBeenCalledWith("x-correlation-id", "my-existing-id-123");
  });

  it("generates a different ID on each call with no inbound header", () => {
    const ids = new Set();
    for (let i = 0; i < 5; i++) {
      const req = { headers: {} };
      correlationId(req, mockRes(), jest.fn());
      ids.add(req.correlationId);
    }
    expect(ids.size).toBe(5);
  });
});
