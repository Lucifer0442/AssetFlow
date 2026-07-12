// ============================================================================
// AssetFlow ERP — Database Seed Script
// ============================================================================
// Seeds the 6 default roles and an initial admin user.
//
// USAGE:
//   npx prisma db seed
//
// Ensure "prisma.seed" is configured in package.json.
// ============================================================================

import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

// ---------------------------------------------------------------------------
// Seed Data
// ---------------------------------------------------------------------------

const ROLES = [
  {
    name: "admin",
    description: "Full system access, user management, role promotion",
  },
  {
    name: "asset_manager",
    description: "Asset CRUD, allocations, returns, maintenance oversight",
  },
  {
    name: "department_head",
    description:
      "Department asset oversight, transfer/maintenance approval",
  },
  {
    name: "employee",
    description:
      "View own assets, request maintenance, book resources",
  },
  {
    name: "auditor",
    description:
      "Conduct audits, submit findings, create discrepancy reports",
  },
  {
    name: "technician",
    description:
      "View assigned maintenance, update progress, resolve tickets",
  },
];

const DEFAULT_ADMIN = {
  email: "admin@assetflow.local",
  password: "Admin@12345", // Change immediately after first login
  firstName: "System",
  lastName: "Admin",
  employeeCode: "EMP-0001",
};

// ---------------------------------------------------------------------------
// Main Seed Function
// ---------------------------------------------------------------------------

async function main() {
  console.log("🌱 Seeding AssetFlow database...\n");

  // -----------------------------------------------------------------------
  // 1. Seed Roles
  // -----------------------------------------------------------------------
  console.log("📋 Seeding roles...");

  const createdRoles: Record<string, string> = {};

  for (const role of ROLES) {
    const upserted = await prisma.role.upsert({
      where: { name: role.name },
      update: { description: role.description },
      create: {
        name: role.name,
        description: role.description,
      },
    });
    createdRoles[role.name] = upserted.id;
    console.log(`   ✓ Role: ${role.name} (${upserted.id})`);
  }

  // -----------------------------------------------------------------------
  // 2. Seed Default Admin User
  // -----------------------------------------------------------------------
  console.log("\n👤 Seeding default admin user...");

  const existingAdmin = await prisma.user.findUnique({
    where: { email: DEFAULT_ADMIN.email },
  });

  if (!existingAdmin) {
    const passwordHash = await hash(DEFAULT_ADMIN.password, 12);

    const adminUser = await prisma.user.create({
      data: {
        email: DEFAULT_ADMIN.email,
        passwordHash: passwordHash,
        isActive: true,
        emailVerified: true,
        employee: {
          create: {
            employeeCode: DEFAULT_ADMIN.employeeCode,
            firstName: DEFAULT_ADMIN.firstName,
            lastName: DEFAULT_ADMIN.lastName,
            email: DEFAULT_ADMIN.email,
            status: "active",
          },
        },
        userRoles: {
          create: [
            { roleId: createdRoles["admin"] },
            { roleId: createdRoles["employee"] },
          ],
        },
      },
      include: {
        employee: true,
        userRoles: { include: { role: true } },
      },
    });

    console.log(`   ✓ Admin user created: ${adminUser.email}`);
    console.log(`   ✓ Employee record: ${adminUser.employee?.employeeCode}`);
    console.log(
      `   ✓ Roles: ${adminUser.userRoles.map((ur) => ur.role.name).join(", ")}`
    );
    console.log(`\n   ⚠️  Default password: ${DEFAULT_ADMIN.password}`);
    console.log(`   ⚠️  Change this immediately after first login!`);
  } else {
    console.log(`   ℹ️  Admin user already exists: ${DEFAULT_ADMIN.email}`);
  }

  console.log("\n✅ Seed completed successfully!");
}

// ---------------------------------------------------------------------------
// Execute
// ---------------------------------------------------------------------------

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Seed failed:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
