import { jest } from "@jest/globals";
process.env.LOG_LEVEL = "silent";
import request from "supertest";
import nock from "nock";
import jwt from "jsonwebtoken";
import { connectTestDb, clearTestDb, disconnectTestDb } from "../helpers/testDb.js";

process.env.JWT_SECRET = "test-secret";
process.env.FRONTEND_URL = "http://localhost:5173";
process.env.GEMINI_API_KEY = "unused-in-tests";
process.env.ML_API_URL = "http://ml-service.test/predict";
// Deliberately no RABBITMQ_URL — exercises the synchronous fallback path.

const { default: app } = await import("../../app.js");
const LoanApplication = (await import("../../models/LoanApplication.js")).default;
const { Score } = await import("../../models/Score.js");
const DocumentUpload = (await import("../../models/DocumentUpload.js")).default;

function beneficiaryToken() {
  return jwt.sign({ id: "000000000000000000000000", role: "beneficiary" }, "test-secret");
}

const mockMlResult = {
  repayment_score: 20,
  income_proxy_score: 10,
  ccs: 15,
  risk_band: "Low Risk – Low Priority",
  explanation: {
    repayment_contributors: [{ feature: "on_time_payment_ratio", impact: 1.2 }],
    income_contributors: [{ feature: "declared_monthly_income", impact: 0.8 }],
    insights: ["This applicant's repayment score was increased by their on-time payment ratio."],
  },
};

describe("POST /api/loans/apply", () => {
  beforeAll(async () => {
    await connectTestDb();
  });

  afterEach(async () => {
    await clearTestDb();
    nock.cleanAll();
  });

  afterAll(async () => {
    await disconnectTestDb();
  });

  it("rejects the request with 401 when unauthenticated", async () => {
    const res = await request(app).post("/api/loans/apply").send({});
    expect(res.status).toBe(401);
  });

  it("rejects document IDs that were not created for the authenticated beneficiary", async () => {
    const res = await request(app)
      .post("/api/loans/apply")
      .set("Authorization", `Bearer ${beneficiaryToken()}`)
      .send({
        applicantName: "Untrusted Document",
        aadhaarNumber: "123456789012",
        documents: ["000000000000000000000001"],
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/do not belong/);
  });

  it("attaches only the beneficiary's verified upload record", async () => {
    const upload = await DocumentUpload.create({
      ownerId: "000000000000000000000000",
      label: "Electricity Bill",
      originalName: "bill.pdf",
      mimeType: "application/pdf",
      resourceType: "raw",
      publicId: "dhansetu/documents/test-bill",
    });
    nock("http://ml-service.test").post("/predict").reply(200, mockMlResult);

    const res = await request(app)
      .post("/api/loans/apply")
      .set("Authorization", `Bearer ${beneficiaryToken()}`)
      .send({
        applicantName: "Verified Document",
        aadhaarNumber: "123456789012",
        documents: [upload._id.toString()],
      });

    expect(res.status).toBe(201);
    expect(res.body.application.documents[0].uploadId.toString()).toBe(upload._id.toString());
    expect(res.body.application.documents[0]).not.toHaveProperty("url");
    expect((await DocumentUpload.findById(upload._id)).applicationId.toString()).toBe(res.body.application._id);
  });

  it("scores synchronously and returns 201 when RabbitMQ isn't configured", async () => {
    nock("http://ml-service.test").post("/predict").reply(200, mockMlResult);

    const res = await request(app)
      .post("/api/loans/apply")
      .set("Authorization", `Bearer ${beneficiaryToken()}`)
      .send({
        applicantName: "Jane Doe",
        aadhaarNumber: "123456789012",
        gender: "female",
        occupation_type: "Daily Wage",
        education_level: "Primary",
        household_size: 4,
        ration_card_type: "BPL",
        district: "Test District",
      });

    expect(res.status).toBe(201);
    expect(res.body.async).toBe(false);
    expect(res.body.risk_band).toBe(mockMlResult.risk_band);
    expect(typeof res.body.risk_score).toBe("number");
  });

  it("never stores the raw Aadhaar number — only its hash and last 4 digits", async () => {
    nock("http://ml-service.test").post("/predict").reply(200, mockMlResult);

    await request(app)
      .post("/api/loans/apply")
      .set("Authorization", `Bearer ${beneficiaryToken()}`)
      .send({
        applicantName: "Jane Doe",
        aadhaarNumber: "123456789012",
        gender: "female",
        occupation_type: "Daily Wage",
        education_level: "Primary",
        household_size: 4,
        ration_card_type: "BPL",
        district: "Test District",
      });

    const stored = await LoanApplication.findOne({ applicantName: "Jane Doe" });
    expect(stored).not.toBeNull();
    expect(stored.aadhaarLast4).toBe("9012");
    expect(JSON.stringify(stored)).not.toContain("123456789012");
    expect(stored.aadhaarHash).toMatch(/^[0-9a-f]{64}$/);
  });

  it("persists the Score document with the SHAP explanation attached", async () => {
    nock("http://ml-service.test").post("/predict").reply(200, mockMlResult);

    const res = await request(app)
      .post("/api/loans/apply")
      .set("Authorization", `Bearer ${beneficiaryToken()}`)
      .send({
        applicantName: "Explanation Test",
        aadhaarNumber: "111122223333",
        gender: "male",
        occupation_type: "Self Employed",
        education_level: "Secondary",
        household_size: 2,
        ration_card_type: "APL",
        district: "Test District",
      });

    const application = await LoanApplication.findById(res.body.application._id);
    const score = await Score.findById(application.scoresRef);

    expect(score.explanation.repayment_contributors).toHaveLength(1);
    expect(score.explanation.insights[0]).toMatch(/on-time payment ratio/);
  });

  it("returns 500 when the ML service call fails", async () => {
    nock("http://ml-service.test").post("/predict").reply(500);

    const res = await request(app)
      .post("/api/loans/apply")
      .set("Authorization", `Bearer ${beneficiaryToken()}`)
      .send({
        applicantName: "Failure Case",
        aadhaarNumber: "444455556666",
        gender: "male",
        occupation_type: "Farmer",
        education_level: "Primary",
        household_size: 3,
        ration_card_type: "BPL",
        district: "Test District",
      });

    expect(res.status).toBe(500);
  });
});
