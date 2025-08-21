import { PrismaClient } from "../db/prisma";

const main = async () => {
  const prisma = new PrismaClient();

  console.log("🌱 Starting to seed user data...");

  const users = [
    {
      email: "admin@company.com",
      firstName: "Admin",
      lastName: "System",
      password: "admin123",
      employeeId: null,
      role: "admin",
    },
    {
      email: "manager@company.com",
      firstName: "Manager",
      lastName: "System",
      password: "manager123",
      role: "manager",
    },
  ];

  let createdUsersCount = 0;
  for (const userData of users) {
    try {
      await prisma.user.create({
        data: userData,
      });
      createdUsersCount++;
      console.log(`✅ Created user: ${userData.email}`);
    } catch {
      console.log(`⚠️ Skipped user ${userData.email} - might already exist`);
    }
  }

  console.log(`✅ Created ${createdUsersCount} users total`);
  console.log("🎉 User seeding completed successfully!");

  await prisma.$disconnect();
};

main();
