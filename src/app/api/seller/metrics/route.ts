import { NextRequest, NextResponse } from "next/server";
import { getServerSessionUser } from "@/lib/auth";
import { DataAccess } from "@/lib/data-access";

// GET /api/seller/metrics - Summary statistics for the seller dashboard
export async function GET() {
  try {
    const user = await getServerSessionUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized." },
        { status: 401 }
      );
    }

    const metrics = await DataAccess.getSellerMetrics(user.id);

    return NextResponse.json({
      success: true,
      metrics,
    });
  } catch (error: any) {
    console.error("[API ERROR] GET /api/seller/metrics:", error);
    return NextResponse.json(
      { success: false, error: "Failed to retrieve seller metrics." },
      { status: 500 }
    );
  }
}
