import bcrypt from "bcryptjs";
import { PrismaClient } from "../src/db/prisma";

const prisma = new PrismaClient();

async function createAdminUser() {
  try {
    // Check if admin user already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: "admin@hrm.com" },
    });

    if (existingAdmin) {
      console.log("Admin user already exists!");
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash("admin123", 12);

    // Create admin user
    const adminUser = await prisma.user.create({
      data: {
        email: "admin@hrm.com",
        password: hashedPassword,
        firstName: "Admin",
        lastName: "System",
        role: "admin",
      },
    });

    console.log("Admin user created successfully:", {
      id: adminUser.id,
      email: adminUser.email,
      role: adminUser.role,
    });

    console.log("\nLogin credentials:");
    console.log("Email: admin@hrm.com");
    console.log("Password: admin123");
  } catch (error) {
    console.error("Error creating admin user:", error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUser();
