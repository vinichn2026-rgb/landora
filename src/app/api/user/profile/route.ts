import { NextRequest, NextResponse } from "next/server";
import { getServerSessionUser } from "@/lib/auth";
import { DataAccess } from "@/lib/data-access";

// GET /api/user/profile - Get current profile
export async function GET() {
  try {
    const sessionUser = await getServerSessionUser();
    if (!sessionUser) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Please sign in." },
        { status: 401 }
      );
    }

    const user = await DataAccess.findUserById(sessionUser.id);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "User profile not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
        profile: user.profile,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("[API ERROR] GET /api/user/profile:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch user profile." },
      { status: 500 }
    );
  }
}

// PUT /api/user/profile - Update user profile
export async function PUT(request: NextRequest) {
  try {
    const sessionUser = await getServerSessionUser();
    if (!sessionUser) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Please sign in." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, phoneNumber, bio, companyName, reraRegistration, taxId, address, city, state, pinCode } = body;

    const updated = await DataAccess.updateUserProfile(sessionUser.id, {
      name: name?.trim(),
      phoneNumber: phoneNumber?.trim(),
      bio: bio?.trim(),
      companyName: companyName?.trim(),
      reraRegistration: reraRegistration?.trim(),
      taxId: taxId?.trim(),
      address: address?.trim(),
      city: city?.trim(),
      state: state?.trim(),
      pinCode: pinCode?.trim(),
    });

    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Failed to update profile." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        phoneNumber: updated.phoneNumber,
        role: updated.role,
        profile: updated.profile,
      },
      message: "Profile updated successfully.",
    });
  } catch (error) {
    console.error("[API ERROR] PUT /api/user/profile:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update profile." },
      { status: 500 }
    );
  }
}
