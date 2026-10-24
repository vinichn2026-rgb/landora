import { NextResponse } from "next/server";
import { DataAccess } from "@/lib/data-access";

// GET /api/packages - Public active listing packages
export async function GET() {
  try {
    const packages = await DataAccess.getAdminPackages();
    const activePackages = packages.filter((p) => p.isActive);

    return NextResponse.json({
      success: true,
      packages: activePackages,
      count: activePackages.length,
    });
  } catch (error: any) {
    console.error("[API ERROR] GET /api/packages:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch listing packages." },
      { status: 500 }
    );
  }
}
