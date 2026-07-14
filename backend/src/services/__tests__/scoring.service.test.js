import { jest } from "@jest/globals";
import { connectTestDb, clearTestDb, disconnectTestDb } from "../../__tests__/helpers/testDb.js";
import { normalizeScore, persistScoreAndUpdateApplication } from "../scoring.service.js";
import LoanApplication from "../../models/LoanApplication.js";
import { Score } from "../../models/Score.js";

describe("normalizeScore", () => {
  it("maps 0 to 50 (sigmoid midpoint)", () => {
    expect(normalizeScore(0)).toBe(50);
  });

  it("maps a large positive value close to 100", () => {
    expect(normalizeScore(50)).toBeGreaterThanOrEqual(99);
  });

  it("maps a large negative value close to 0", () => {
    expect(normalizeScore(-50)).toBeLessThanOrEqual(1);
  });

  it("always returns an integer between 0 and 100", () => {
    for (const v of [-100, -10, -1, 0, 1, 10, 100]) {
      const result = normalizeScore(v);
      expect(Number.isInteger(result)).toBe(true);
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThanOrEqual(100);
    }
  });
});

describe("persistScoreAndUpdateApplication", () => {
  beforeAll(async () => {
    await connectTestDb();
  });

  afterEach(async () => {
    await clearTestDb();
  });

  afterAll(async () => {
    await disconnectTestDb();
  });

  it("persists a Score document and attaches it to the LoanApplication", async () => {
    const application = await LoanApplication.create({
      applicantName: "Test Applicant",
      aadhaarHash: "deadbeef",
      aadhaarLast4: "1234",
      status: "PENDING",
      scoresRef: null,
    });

    const mlResult = {
      ccs: 20,
      repayment_score: 15,
      income_proxy_score: 5,
      explanation: { repayment_contributors: [], income_contributors: [], insights: [] },
    };

    const { application: updated, savedScore } = await persistScoreAndUpdateApplication({
      applicationId: application._id,
      aadhaarHash: "deadbeef",
      mlResult,
    });

    expect(savedScore.aadhaarHash).toBe("deadbeef");
    expect(savedScore.risk_score).toBe(normalizeScore(20));
    expect(savedScore.repayment_score).toBe(normalizeScore(15));
    expect(savedScore.income_proxy_score).toBe(normalizeScore(5));

    expect(updated.scoresRef.toString()).toBe(savedScore._id.toString());

    // Confirm it's really persisted, not just returned in-memory
    const fromDb = await LoanApplication.findById(application._id);
    expect(fromDb.scoresRef.toString()).toBe(savedScore._id.toString());

    const scoreFromDb = await Score.findById(savedScore._id);
    expect(scoreFromDb).not.toBeNull();
  });

  it("defaults explanation to {} when the ML result doesn't include one", async () => {
    const application = await LoanApplication.create({
      applicantName: "No Explanation",
      aadhaarHash: "cafef00d",
      aadhaarLast4: "5678",
      status: "PENDING",
    });

    const { savedScore } = await persistScoreAndUpdateApplication({
      applicationId: application._id,
      aadhaarHash: "cafef00d",
      mlResult: { ccs: 0, repayment_score: 0, income_proxy_score: 0 },
    });

    expect(savedScore.explanation).toEqual({});
  });

  it("returns a null application if the applicationId doesn't exist", async () => {
    const fakeId = "507f1f77bcf86cd799439011";
    const { application } = await persistScoreAndUpdateApplication({
      applicationId: fakeId,
      aadhaarHash: "abc123",
      mlResult: { ccs: 10, repayment_score: 10, income_proxy_score: 10 },
    });

    expect(application).toBeNull();
  });
});
