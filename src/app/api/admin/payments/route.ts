import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth";
import { DataAccess } from "@/lib/data-access";

// GET /api/admin/payments - View payment records and gateway status
export async function GET() {
  try {
    await requireAdminSession();
    const data = await DataAccess.getAdminPayments();

    return NextResponse.json({
      success: true,
      ...data,
      notice: "Payment gateway integration is in Sandbox/Test mode. No real live transactions are simulated or fake data generated.",
    });
  } catch (error: any) {
    const isAuth = error.message?.includes("UNAUTHORIZED") || error.message?.includes("FORBIDDEN");
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch payment records." },
      { status: isAuth ? 403 : 500 }
    );
  }
}
