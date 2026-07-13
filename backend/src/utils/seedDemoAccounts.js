import bcrypt from "bcryptjs";
import { User } from "../models/User.js";

export const DEMO_OFFICER = {
  employeeId: "DEMO001",
  password: "demo1234",
};

export const DEMO_CHANNEL_PARTNER = {
  employeeId: "SHG001",
  password: "demo1234",
};

async function seedAccount({ employeeId, password, role }) {
  const exists = await User.findOne({ employeeId });
  if (exists) return;

  const passwordHash = await bcrypt.hash(password, 10);
  await User.create({
    role,
    employeeId,
    passwordHash,
    isVerified: true,
  });

  console.log(`👤 Seeded demo ${role} account (employeeId: ${employeeId})`);
}

// Idempotently ensures demo officer + channel-partner accounts exist so the
// "Demo Login" buttons (and manual testing) have something real to
// authenticate against. Safe to call on every server start.
export async function seedDemoAccounts() {
  await seedAccount({ ...DEMO_OFFICER, role: "officer" });
  await seedAccount({ ...DEMO_CHANNEL_PARTNER, role: "channel" });
}
