"use server";
import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const { isValid, user, error } = await getUserFromRequest(request);

    if (!isValid || !user) {
      return NextResponse.json(
        { error: error || "Authentication failed" },
        { status: 401 }
      );
    }

    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    console.error("Auth check error:", error);
    return NextResponse.json({ error: "Token không hợp lệ" }, { status: 401 });
  }
}
