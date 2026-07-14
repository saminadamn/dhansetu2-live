import { jest } from "@jest/globals";
process.env.LOG_LEVEL = "silent";
import request from "supertest";
import bcrypt from "bcryptjs";
import { connectTestDb, clearTestDb, disconnectTestDb } from "../helpers/testDb.js";

process.env.JWT_SECRET = "test-secret";
process.env.FRONTEND_URL = "http://localhost:5173";
process.env.GEMINI_API_KEY = "unused-in-tests";

const { default: app } = await import("../../app.js");
const { User } = await import("../../models/User.js");

describe("Auth API", () => {
  beforeAll(async () => {
    await connectTestDb();
  });

  afterEach(async () => {
    await clearTestDb();
  });

  afterAll(async () => {
    await disconnectTestDb();
  });

  describe("POST /api/auth/beneficiary-login", () => {
    it("rejects a missing mobile number", async () => {
      const res = await request(app).post("/api/auth/beneficiary-login").send({});
      expect(res.status).toBe(400);
    });

    it("rejects a mobile number that isn't 10 digits", async () => {
      const res = await request(app)
        .post("/api/auth/beneficiary-login")
        .send({ mobileNumber: "12345" });
      expect(res.status).toBe(400);
    });

    it("creates a new beneficiary account and returns a JWT on first login", async () => {
      const res = await request(app)
        .post("/api/auth/beneficiary-login")
        .send({ mobileNumber: "9876543210" });

      expect(res.status).toBe(200);
      expect(res.body.role).toBe("beneficiary");
      expect(typeof res.body.token).toBe("string");

      const user = await User.findOne({ mobileNumber: "9876543210" });
      expect(user).not.toBeNull();
      expect(user.role).toBe("beneficiary");
    });

    it("reuses the existing account on a second login instead of creating a duplicate", async () => {
      await request(app).post("/api/auth/beneficiary-login").send({ mobileNumber: "9876543210" });
      await request(app).post("/api/auth/beneficiary-login").send({ mobileNumber: "9876543210" });

      const count = await User.countDocuments({ mobileNumber: "9876543210" });
      expect(count).toBe(1);
    });

    it("echoes an X-Correlation-Id response header", async () => {
      const res = await request(app)
        .post("/api/auth/beneficiary-login")
        .send({ mobileNumber: "9876543210" });
      expect(res.headers["x-correlation-id"]).toBeDefined();
    });
  });

  describe("POST /api/auth/officer-login", () => {
    beforeEach(async () => {
      const passwordHash = await bcrypt.hash("correct-password", 10);
      await User.create({
        role: "officer",
        employeeId: "OFF001",
        passwordHash,
        isVerified: true,
      });
    });

    it("rejects missing credentials", async () => {
      const res = await request(app).post("/api/auth/officer-login").send({});
      expect(res.status).toBe(400);
    });

    it("rejects an unknown employee ID", async () => {
      const res = await request(app)
        .post("/api/auth/officer-login")
        .send({ employeeId: "NOBODY", password: "whatever" });
      expect(res.status).toBe(404);
    });

    it("rejects a wrong password", async () => {
      const res = await request(app)
        .post("/api/auth/officer-login")
        .send({ employeeId: "OFF001", password: "wrong-password" });
      expect(res.status).toBe(401);
    });

    it("logs in successfully with correct credentials and never returns the password hash", async () => {
      const res = await request(app)
        .post("/api/auth/officer-login")
        .send({ employeeId: "OFF001", password: "correct-password" });

      expect(res.status).toBe(200);
      expect(typeof res.body.token).toBe("string");
      expect(res.body.officer.role).toBe("officer");
      expect(res.body.officer.passwordHash).toBeUndefined();
      expect(JSON.stringify(res.body)).not.toContain("correct-password");
    });
  });
});
