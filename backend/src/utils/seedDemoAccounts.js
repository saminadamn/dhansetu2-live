import bcrypt from "bcryptjs";
import { User } from "../models/User.js";

export const DEMO_OFFICER = {
  employeeId: "DEMO001",
  password: "demo1234",
};

// Idempotently ensures a demo officer account exists so the "Demo Login"
// button on the Officer login page (and manual testing) has something real
// to authenticate against. Safe to call on every server start.
export async function seedDemoOfficer() {
  const exists = await User.findOne({ employeeId: DEMO_OFFICER.employeeId });
  if (exists) return;

  const passwordHash = await bcrypt.hash(DEMO_OFFICER.password, 10);
  await User.create({
    role: "officer",
    employeeId: DEMO_OFFICER.employeeId,
    passwordHash,
    isVerified: true,
  });

  console.log(`👤 Seeded demo officer account (employeeId: ${DEMO_OFFICER.employeeId})`);
}
