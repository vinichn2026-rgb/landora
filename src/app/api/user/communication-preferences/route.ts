import { NextRequest, NextResponse } from "next/server";
import { getServerSessionUser } from "@/lib/auth";
import { DataAccess } from "@/lib/data-access";
import { normalizePhoneNumber } from "@/lib/sms";

// GET /api/user/communication-preferences - Retrieve current preferences
export async function GET(request: NextRequest) {
  try {
    const user = await getServerSessionUser();
    const { searchParams } = new URL(request.url);
    const phoneParam = searchParams.get("phone");
    const normalizedPhone = phoneParam ? normalizePhoneNumber(phoneParam).e164 : (user?.phoneNumber || null);

    const identifier = user?.id || normalizedPhone;
    if (!identifier) {
      return NextResponse.json(
        { success: false, error: "Please provide a user session or phone number." },
        { status: 400 }
      );
    }

    const consent = await DataAccess.getCommunicationConsent(identifier);

    return NextResponse.json({
      success: true,
      preferences: {
        phoneNumber: consent ? consent.phoneNumber : normalizedPhone,
        transactionalSms: consent ? consent.transactionalSms : true,
        transactionalWhatsapp: consent ? consent.transactionalWhatsapp : true,
        promotionalOffers: consent ? consent.promotionalOffers : false, // strictly false by default
        consentTimestamp: consent ? consent.consentTimestamp : null,
        consentSource: consent ? consent.consentSource : null,
        optOutTimestamp: consent ? consent.optOutTimestamp : null,
        optOutReason: consent ? consent.optOutReason : null,
      },
    });
  } catch (error: any) {
    console.error("[API ERROR] GET /api/user/communication-preferences:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch communication preferences." },
      { status: 500 }
    );
  }
}

// POST /api/user/communication-preferences - Update or save preferences
export async function POST(request: NextRequest) {
  try {
    const user = await getServerSessionUser();
    const body = await request.json();
    const {
      action,
      withdrawConsent,
      reason,
      phone,
      phoneNumber,
      transactionalSms,
      transactionalWhatsapp,
      promotionalOffers,
      consentSource,
    } = body;

    const targetPhone = phone || phoneNumber || user?.phoneNumber;
    if (!targetPhone) {
      return NextResponse.json(
        { success: false, error: "A valid mobile number is required to save preferences." },
        { status: 400 }
      );
    }

    const norm = normalizePhoneNumber(targetPhone);
    if (!norm.isValid) {
      return NextResponse.json(
        { success: false, error: "Invalid mobile number format." },
        { status: 400 }
      );
    }

    // Explicit opt-out / consent withdrawal
    if (action === "withdraw" || withdrawConsent === true) {
      await DataAccess.withdrawCommunicationConsent(
        norm.e164,
        reason || "User requested full withdrawal of communication consent"
      );
      return NextResponse.json({
        success: true,
        message: "You have successfully withdrawn communication consent. All future SMS and WhatsApp alerts have been paused.",
        preferences: {
          transactionalSms: false,
          transactionalWhatsapp: false,
          promotionalOffers: false,
          optOutTimestamp: new Date().toISOString(),
          optOutReason: reason || "User requested full withdrawal of communication consent",
        },
      });
    }

    const savedConsent = await DataAccess.saveCommunicationConsent({
      userId: user?.id || null,
      phoneNumber: norm.e164,
      transactionalSms: transactionalSms !== undefined ? Boolean(transactionalSms) : true,
      transactionalWhatsapp: transactionalWhatsapp !== undefined ? Boolean(transactionalWhatsapp) : true,
      promotionalOffers: promotionalOffers !== undefined ? Boolean(promotionalOffers) : false,
      consentSource: consentSource || "USER_PREFERENCES",
      ipAddress: request.headers.get("x-forwarded-for") || "127.0.0.1",
    });

    return NextResponse.json({
      success: true,
      message: "Communication preferences saved successfully.",
      preferences: {
        transactionalSms: savedConsent.transactionalSms,
        transactionalWhatsapp: savedConsent.transactionalWhatsapp,
        promotionalOffers: savedConsent.promotionalOffers,
        consentTimestamp: savedConsent.consentTimestamp,
      },
    });
  } catch (error: any) {
    console.error("[API ERROR] POST /api/user/communication-preferences:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update communication preferences." },
      { status: 500 }
    );
  }
}
