"use server";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
export async function POST(request: NextRequest) {
  try {
    console.log("=== LOGIN API CALLED ===");
    const body = await request.json();
    const { email, password } = body;
    console.log("Login attempt with email:", email);

    // Validate input
    if (!email || !password) {
      console.log("Missing email or password");
      return NextResponse.json(
        { error: "Email và password là bắt buộc" },
        { status: 400 }
      );
    }

    // Find user by email
    console.log("Attempting to connect to database...");
    const user = await prisma.user.findUnique({
      where: { email },
      include: { employee: { include: { job: true } } },
    });
    console.log(
      "Database query result:",
      user ? "User found" : "User not found"
    );
    console.log("User data:", user);
    if (!user) {
      console.log("User not found for email:", email);
      return NextResponse.json(
        { error: "Email hoặc password không đúng" },
        { status: 401 }
      );
    }

    // Check password
    console.log("Validating password...");
    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log("Password validation result:", isPasswordValid);

    if (!isPasswordValid) {
      console.log("Invalid password for email:", email);
      return NextResponse.json(
        { error: "Email hoặc password không đúng" },
        { status: 401 }
      );
    }

    // Generate JWT token
    console.log("Generating JWT token...");
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    // Create response
    console.log("Creating response...");
    const response = NextResponse.json(
      {
        message: "Đăng nhập thành công",
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          employee: user.employee,
        },
      },
      { status: 200 }
    );

    // Set cookie
    console.log("Setting cookie with token:", token.substring(0, 20) + "...");
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24, // 24 hours
      path: "/", // Ensure cookie is available for all paths
    });

    console.log("Cookie set successfully");
    console.log("Login successful for user:", user.email);
    return response;
  } catch (error) {
    console.error("=== LOGIN ERROR ===");
    console.error("Error type:", error?.constructor?.name);
    console.error("Error message:", (error as Error)?.message);
    console.error("Error stack:", (error as Error)?.stack);
    console.error("Full error:", error);
    return NextResponse.json(
      { error: "Đã có lỗi xảy ra khi đăng nhập" },
      { status: 500 }
    );
  }
}
