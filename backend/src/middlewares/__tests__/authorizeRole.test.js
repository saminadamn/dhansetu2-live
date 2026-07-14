import { jest } from "@jest/globals";
import { authorizeRole } from "../authorizeRole.js";

function mockRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe("authorizeRole", () => {
  it("calls next() when req.user.role matches an allowed role", () => {
    const req = { user: { role: "officer" } };
    const res = mockRes();
    const next = jest.fn();

    authorizeRole("officer", "channel")(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });

  it("rejects with 403 when req.user.role isn't in the allowed list", () => {
    const req = { user: { role: "beneficiary" } };
    const res = mockRes();
    const next = jest.fn();

    authorizeRole("officer")(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.any(String) })
    );
  });

  it("rejects with 403 when req.user is missing entirely (no auth ran)", () => {
    const req = {};
    const res = mockRes();
    const next = jest.fn();

    authorizeRole("officer")(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(403);
  });

  it("supports multiple allowed roles", () => {
    const res1 = mockRes();
    const next1 = jest.fn();
    authorizeRole("officer", "channel")({ user: { role: "channel" } }, res1, next1);
    expect(next1).toHaveBeenCalled();

    const res2 = mockRes();
    const next2 = jest.fn();
    authorizeRole("officer", "channel")({ user: { role: "beneficiary" } }, res2, next2);
    expect(next2).not.toHaveBeenCalled();
    expect(res2.status).toHaveBeenCalledWith(403);
  });
});
