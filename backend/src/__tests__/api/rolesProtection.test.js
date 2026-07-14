import { jest } from "@jest/globals";
process.env.LOG_LEVEL = "silent";
import request from "supertest";
import jwt from "jsonwebtoken";
import { connectTestDb, clearTestDb, disconnectTestDb } from "../helpers/testDb.js";

process.env.JWT_SECRET = "test-secret";
process.env.FRONTEND_URL = "http://localhost:5173";
process.env.GEMINI_API_KEY = "unused-in-tests";

const { default: app } = await import("../../app.js");

function tokenFor(role, extra = {}) {
  return jwt.sign({ id: "000000000000000000000000", role, ...extra }, "test-secret");
}

describe("Role-based access control", () => {
  beforeAll(async () => {
    await connectTestDb();
  });

  afterEach(async () => {
    await clearTestDb();
  });

  afterAll(async () => {
    await disconnectTestDb();
  });

  it("rejects with 401 when no token is provided at all", async () => {
    const res = await request(app).get("/api/officer/applications");
    expect(res.status).toBe(401);
  });

  it("rejects with 401 on a malformed/garbage token", async () => {
    const res = await request(app)
      .get("/api/officer/applications")
      .set("Authorization", "Bearer this.is.not.a.jwt");
    expect(res.status).toBe(401);
  });

  it("a beneficiary token cannot access officer routes", async () => {
    const res = await request(app)
      .get("/api/officer/applications")
      .set("Authorization", `Bearer ${tokenFor("beneficiary")}`);
    expect(res.status).toBe(403);
  });

  it("a beneficiary token cannot access channel-partner routes", async () => {
    const res = await request(app)
      .get("/api/channel/financial-data")
      .set("Authorization", `Bearer ${tokenFor("beneficiary")}`);
    expect(res.status).toBe(403);
  });

  it("an officer token cannot access beneficiary-only loan application routes", async () => {
    const res = await request(app)
      .post("/api/loans/apply")
      .set("Authorization", `Bearer ${tokenFor("officer")}`)
      .send({ applicantName: "X", aadhaarNumber: "123456789012" });
    expect(res.status).toBe(403);
  });

  it("a channel-partner token cannot access officer-only routes", async () => {
    const res = await request(app)
      .get("/api/officer/applications")
      .set("Authorization", `Bearer ${tokenFor("channel")}`);
    expect(res.status).toBe(403);
  });

  it("an officer token IS allowed onto officer routes", async () => {
    const res = await request(app)
      .get("/api/officer/applications")
      .set("Authorization", `Bearer ${tokenFor("officer")}`);
    expect(res.status).toBe(200);
  });

  it("a channel-partner token IS allowed onto channel routes", async () => {
    const res = await request(app)
      .get("/api/channel/financial-data")
      .set("Authorization", `Bearer ${tokenFor("channel")}`);
    expect(res.status).toBe(200);
  });

  it("rejects a token signed with a different secret (tampering)", async () => {
    const forged = jwt.sign({ id: "x", role: "officer" }, "wrong-secret");
    const res = await request(app)
      .get("/api/officer/applications")
      .set("Authorization", `Bearer ${forged}`);
    expect(res.status).toBe(401);
  });

  it("rejects an expired token even with a valid signature and role", async () => {
    const expired = jwt.sign({ id: "x", role: "officer" }, "test-secret", { expiresIn: -60 });
    const res = await request(app)
      .get("/api/officer/applications")
      .set("Authorization", `Bearer ${expired}`);
    expect(res.status).toBe(401);
  });
});
