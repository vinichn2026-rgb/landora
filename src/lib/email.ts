/**
 * Landora Real Estate Platform - Email Notification Service
 * Supports 8 core platform notification triggers with branded HTML templates.
 * 
 * Strict Provider Rule:
 * Never claim an email was dispatched unless confirmed by a configured live provider
 * (e.g. Resend, SendGrid, or SMTP). If unconfigured, clearly returns providerConfigured: false.
 */

import nodemailer from "nodemailer";

export interface EmailDispatchResult {
  success: boolean;
  providerConfigured: boolean;
  event: string;
  recipient: string;
  subject: string;
  error?: string;
  messageId?: string;
}

export const isEmailProviderConfigured = (): boolean => {
  const rawResend = process.env.RESEND_API_KEY?.trim().replace(/^["']|["']$/g, "");
  const hasResend = Boolean(rawResend && rawResend.startsWith("re_") && rawResend.length > 10 && !rawResend.includes("your_api_key"));
  const hasSmtp = Boolean(
    process.env.SMTP_HOST && 
    process.env.SMTP_USER && 
    process.env.SMTP_PASS &&
    !process.env.SMTP_PASS.includes("your-16-char")
  );
  return hasResend || hasSmtp;
};

// Base HTML Wrapper with Landora Brand Design System
function renderBrandedHtml(title: string, bodyContent: string, actionButton?: { text: string; url: string }): string {
  const currentYear = new Date().getFullYear();
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://landora.in";

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f6f8f7; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f6f8f7; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 580px; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8e0; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.04);">
          <!-- Header -->
          <tr>
            <td style="background-color: #0c4a3e; padding: 28px 32px; text-align: left;">
              <table role="presentation" width="100%">
                <tr>
                  <td>
                    <span style="font-size: 22px; font-weight: 900; color: #ffffff; letter-spacing: -0.5px;">Landora<span style="color: #dfb33d;">.</span></span>
                    <p style="margin: 4px 0 0; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #a7f3d0; font-weight: 700;">Tamil Nadu Land & Real Estate Marketplace</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Body -->
          <tr>
            <td style="padding: 36px 32px 28px;">
              <h1 style="margin: 0 0 16px; font-size: 20px; font-weight: 800; color: #0f172a; line-height: 1.3;">${title}</h1>
              <div style="font-size: 14px; line-height: 1.6; color: #334155;">
                ${bodyContent}
              </div>

              ${actionButton ? `
              <table role="presentation" cellspacing="0" cellpadding="0" style="margin-top: 28px;">
                <tr>
                  <td style="border-radius: 10px; background-color: #0c4a3e;">
                    <a href="${actionButton.url}" target="_blank" style="padding: 12px 26px; border-radius: 10px; font-size: 13px; font-weight: 700; color: #ffffff; text-decoration: none; display: inline-block;">
                      ${actionButton.text} &rarr;
                    </a>
                  </td>
                </tr>
              </table>
              ` : ""}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 24px 32px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #64748b; line-height: 1.5;">
              <p style="margin: 0 0 8px;"><strong>Landora Real Estate Platform</strong> &bull; Coimbatore, Tamil Nadu, India</p>
              <p style="margin: 0;">This email was sent to notify you of activity on your account. To manage notification preferences, visit your <a href="${baseUrl}/dashboard/notifications" style="color: #0c4a3e; text-decoration: underline;">notification settings</a>.</p>
              <p style="margin: 8px 0 0; color: #94a3b8;">&copy; ${currentYear} Landora Technologies Pvt. Ltd. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * Low-level dispatch handler.
 * Only returns success: true if a live provider was successfully called and confirmed.
 */
async function dispatchEmail(params: {
  to: string;
  subject: string;
  html: string;
  event: string;
}): Promise<EmailDispatchResult> {
  const configured = isEmailProviderConfigured();

  if (!configured) {
    // Explicit disclosure: provider not configured
    console.log(`[EMAIL SERVICE] Notice: Live provider not configured. Event: "${params.event}" to: "${params.to}". Subject: "${params.subject}"`);
    return {
      success: false,
      providerConfigured: false,
      event: params.event,
      recipient: params.to,
      subject: params.subject,
      error: "Provider not configured. Set RESEND_API_KEY or SMTP credentials in environment.",
    };
  }

  // If Resend API Key is provided
  const rawResendKey = process.env.RESEND_API_KEY?.trim().replace(/^["']|["']$/g, "");
  if (rawResendKey) {
    try {
      const fromEmail = (process.env.EMAIL_FROM || "Landora <onboarding@resend.dev>").trim().replace(/^["']|["']$/g, "");
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${rawResendKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: fromEmail,
          to: [params.to],
          subject: params.subject,
          html: params.html,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return {
          success: true,
          providerConfigured: true,
          event: params.event,
          recipient: params.to,
          subject: params.subject,
          messageId: data.id,
        };
      } else {
        const err = await response.text();
        let cleanMsg = err;
        try {
          const parsed = JSON.parse(err);
          if (parsed.message) {
            cleanMsg = parsed.message;
          }
        } catch {}

        return {
          success: false,
          providerConfigured: true,
          event: params.event,
          recipient: params.to,
          subject: params.subject,
          error: `Resend error: ${cleanMsg}`,
        };
      }
    } catch (err: any) {
      return {
        success: false,
        providerConfigured: true,
        event: params.event,
        recipient: params.to,
        subject: params.subject,
        error: err.message || "Failed to reach email provider",
      };
    }
  }

  // If SMTP credentials are provided
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT || 587),
        secure: process.env.SMTP_SECURE === "true" || process.env.SMTP_PORT === "465",
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      const info = await transporter.sendMail({
        from: process.env.EMAIL_FROM || `"Landora Marketplace" <${process.env.SMTP_USER}>`,
        to: params.to,
        subject: params.subject,
        html: params.html,
      });

      return {
        success: true,
        providerConfigured: true,
        event: params.event,
        recipient: params.to,
        subject: params.subject,
        messageId: info.messageId,
      };
    } catch (err: any) {
      return {
        success: false,
        providerConfigured: true,
        event: params.event,
        recipient: params.to,
        subject: params.subject,
        error: err.message || "SMTP transmission failed",
      };
    }
  }

  return {
    success: false,
    providerConfigured: false,
    event: params.event,
    recipient: params.to,
    subject: params.subject,
    error: "No active email transport driver found. Configure RESEND_API_KEY or SMTP credentials.",
  };
}

// =============================================================================
// PLATFORM EMAIL NOTIFICATION TRIGGERS
// =============================================================================

// 0. Email One-Time Verification Code (OTP) for Login & Auth
export async function sendOtpEmail(email: string, otpCode: string, expiryMinutes: number = 10): Promise<EmailDispatchResult> {
  const html = renderBrandedHtml(
    "Your Landora Verification Code",
    `
      <p>Hello,</p>
      <p>Use the one-time verification code (OTP) below to securely sign in to your <strong>Landora</strong> account:</p>
      
      <div style="background-color: #f0f5f3; border: 2px dashed #0c4a3e; border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0;">
        <span style="font-size: 38px; font-weight: 900; letter-spacing: 10px; color: #0c4a3e; font-family: 'SF Mono', Consolas, Menlo, monospace; display: block;">
          ${otpCode}
        </span>
        <p style="margin: 10px 0 0; font-size: 12px; color: #526b63; font-weight: 600;">
          Valid for ${expiryMinutes} minutes &bull; Single-use verification code
        </p>
      </div>

      <p style="font-size: 13px; color: #475569;">
        If you did not request this code, you can safely ignore this email. Someone may have entered your email address by mistake. Your account remains secure.
      </p>

      <p style="font-size: 11px; color: #94a3b8; margin-top: 20px; border-top: 1px solid #e2e8f0; pt: 12px;">
        &bull; <strong>Security Tip:</strong> Never share this code with anyone. Landora staff will never ask for your verification code.
      </p>
    `
  );

  return dispatchEmail({
    to: email,
    subject: `${otpCode} is your Landora verification code`,
    html,
    event: "LOGIN_OTP",
  });
}

// 1. Registration Verification
export async function sendRegistrationVerificationEmail(email: string, name: string, verifyToken: string): Promise<EmailDispatchResult> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const verifyUrl = `${baseUrl}/verify-email?token=${verifyToken}&email=${encodeURIComponent(email)}`;

  const html = renderBrandedHtml(
    "Verify Your Landora Account",
    `
      <p>Vanakkam <strong>${name}</strong>,</p>
      <p>Thank you for registering on <strong>Landora</strong>, Tamil Nadu's dedicated real estate and land marketplace.</p>
      <p>Please confirm your email address by clicking the verification button below. This ensures you receive direct buyer inquiries, moderation notices, and listing alerts.</p>
    `,
    { text: "Verify Email Address", url: verifyUrl }
  );

  return dispatchEmail({
    to: email,
    subject: "Verify Your Email Address - Landora",
    html,
    event: "REGISTRATION_VERIFICATION",
  });
}

// 2. Password Reset
export async function sendPasswordResetEmail(email: string, name: string, resetToken: string): Promise<EmailDispatchResult> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const resetUrl = `${baseUrl}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;

  const html = renderBrandedHtml(
    "Reset Your Landora Password",
    `
      <p>Hello <strong>${name}</strong>,</p>
      <p>We received a request to reset your password for your Landora account (${email}).</p>
      <p>Click the link below to choose a new secure password. This password reset link is valid for <strong>1 hour</strong>.</p>
      <p style="margin-top: 16px; font-size: 12px; color: #64748b;">If you did not request a password reset, you can safely ignore this email. Your account remains completely secure.</p>
    `,
    { text: "Reset Password", url: resetUrl }
  );

  return dispatchEmail({
    to: email,
    subject: "Password Reset Request - Landora Security",
    html,
    event: "PASSWORD_RESET",
  });
}

// 3. Listing Submitted
export async function sendListingSubmittedEmail(email: string, sellerName: string, propertyTitle: string, propertyId: string): Promise<EmailDispatchResult> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const listingUrl = `${baseUrl}/dashboard/seller/listings`;

  const html = renderBrandedHtml(
    "Property Listing Submitted for Review",
    `
      <p>Hello <strong>${sellerName}</strong>,</p>
      <p>Your property listing has been successfully submitted and is currently in our moderation queue:</p>
      <div style="background-color: #f1f5f9; padding: 14px 18px; border-radius: 8px; margin: 16px 0; border-left: 4px solid #0c4a3e;">
        <strong style="color: #0f172a; font-size: 15px;">${propertyTitle}</strong>
        <p style="margin: 4px 0 0; font-size: 12px; color: #475569;">Listing ID: ${propertyId}</p>
      </div>
      <p>Our moderation team reviews layout approvals (DTCP/CMDA), patta details, and guidelines before publishing to ensure 100% verified listings for buyers. You will receive an update once approved.</p>
    `,
    { text: "View Listing Status", url: listingUrl }
  );

  return dispatchEmail({
    to: email,
    subject: `Listing Submitted: ${propertyTitle}`,
    html,
    event: "LISTING_SUBMITTED",
  });
}

// 4. Listing Approved or Rejected
export async function sendListingModerationEmail(
  email: string,
  sellerName: string,
  propertyTitle: string,
  status: "ACTIVE" | "REJECTED",
  slug?: string,
  rejectionReason?: string
): Promise<EmailDispatchResult> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const isApproved = status === "ACTIVE";

  const actionUrl = isApproved
    ? `${baseUrl}/properties/${slug || ""}`
    : `${baseUrl}/dashboard/seller/listings`;

  const bodyContent = isApproved
    ? `
      <p>Congratulations <strong>${sellerName}</strong>!</p>
      <p>Your property listing has been verified and is now <strong>live on Landora</strong>:</p>
      <div style="background-color: #ecfdf5; padding: 14px 18px; border-radius: 8px; margin: 16px 0; border-left: 4px solid #10b981;">
        <strong style="color: #065f46; font-size: 15px;">${propertyTitle}</strong>
        <p style="margin: 4px 0 0; font-size: 12px; color: #047857;">Status: Approved &amp; Published &bull; Visible in search results</p>
      </div>
      <p>Potential buyers can now discover your property, view uploaded photos, and contact you directly via phone and enquiry forms.</p>
    `
    : `
      <p>Hello <strong>${sellerName}</strong>,</p>
      <p>Our moderation team reviewed your property listing <strong>${propertyTitle}</strong> and was unable to approve it at this time.</p>
      <div style="background-color: #fff1f2; padding: 14px 18px; border-radius: 8px; margin: 16px 0; border-left: 4px solid #f43f5e;">
        <strong style="color: #9f1239; font-size: 13px;">Reason for Rejection:</strong>
        <p style="margin: 4px 0 0; font-size: 14px; color: #881337;">${rejectionReason || "Missing required layout documentation or guidelines compliance."}</p>
      </div>
      <p>Please edit your listing in your Seller Dashboard to address this feedback and resubmit for approval.</p>
    `;

  const html = renderBrandedHtml(
    isApproved ? "Your Listing is Now Live on Landora!" : "Update Required: Property Listing Not Approved",
    bodyContent,
    { text: isApproved ? "View Live Property" : "Edit Listing", url: actionUrl }
  );

  return dispatchEmail({
    to: email,
    subject: isApproved ? `Listing Approved: ${propertyTitle}` : `Action Required: Listing Review for ${propertyTitle}`,
    html,
    event: isApproved ? "LISTING_APPROVED" : "LISTING_REJECTED",
  });
}

// 5. New Property Enquiry (To Seller)
export async function sendNewEnquiryEmail(
  sellerEmail: string,
  sellerName: string,
  propertyTitle: string,
  buyerName: string,
  buyerPhone: string,
  buyerEmail: string,
  message: string,
  enquiryId: string
): Promise<EmailDispatchResult> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const enquiryUrl = `${baseUrl}/dashboard/seller/enquiries`;

  const html = renderBrandedHtml(
    `New Buyer Enquiry for ${propertyTitle}`,
    `
      <p>Hello <strong>${sellerName}</strong>,</p>
      <p>A prospective buyer has expressed interest in your property on Landora:</p>
      
      <div style="background-color: #f8fafc; padding: 18px; border-radius: 12px; border: 1px solid #e2e8f0; margin: 18px 0;">
        <p style="margin: 0 0 8px; font-size: 13px;"><strong>Buyer Name:</strong> ${buyerName}</p>
        <p style="margin: 0 0 8px; font-size: 13px;"><strong>Phone:</strong> <a href="tel:${buyerPhone}" style="color: #0c4a3e; font-weight: bold;">${buyerPhone}</a></p>
        <p style="margin: 0 0 12px; font-size: 13px;"><strong>Email:</strong> <a href="mailto:${buyerEmail}" style="color: #0c4a3e;">${buyerEmail}</a></p>
        <div style="background-color: #ffffff; padding: 12px; border-radius: 6px; border: 1px solid #e2e8f0;">
          <strong style="font-size: 11px; text-transform: uppercase; color: #64748b;">Buyer Message:</strong>
          <p style="margin: 4px 0 0; font-size: 13px; color: #1e293b; font-style: italic;">&ldquo;${message}&rdquo;</p>
        </div>
      </div>

      <p style="font-size: 12px; color: #64748b;">Tip: Responding within 2 hours increases genuine deal closure rates by over 60%.</p>
    `,
    { text: "Respond in Seller Hub", url: enquiryUrl }
  );

  return dispatchEmail({
    to: sellerEmail,
    subject: `New Lead: ${buyerName} enquired about ${propertyTitle}`,
    html,
    event: "NEW_ENQUIRY",
  });
}

// 6. Enquiry Confirmation (To Buyer)
export async function sendEnquiryConfirmationEmail(
  buyerEmail: string,
  buyerName: string,
  propertyTitle: string,
  sellerName: string
): Promise<EmailDispatchResult> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const dashboardUrl = `${baseUrl}/dashboard/enquiries`;

  const html = renderBrandedHtml(
    "Enquiry Dispatched Successfully",
    `
      <p>Vanakkam <strong>${buyerName}</strong>,</p>
      <p>Your enquiry for <strong>${propertyTitle}</strong> has been forwarded directly to the property owner/promoter (<strong>${sellerName}</strong>).</p>
      <p>The seller will reach out to you via your provided phone number or email to arrange site visits and share documentation.</p>
      <p>You can track all your submitted enquiries and conversations anytime in your Buyer Dashboard.</p>
    `,
    { text: "View My Enquiries", url: dashboardUrl }
  );

  return dispatchEmail({
    to: buyerEmail,
    subject: `Enquiry Sent: ${propertyTitle}`,
    html,
    event: "ENQUIRY_CONFIRMATION",
  });
}

// 7. Listing Expiry Reminder
export async function sendListingExpiryReminderEmail(
  email: string,
  sellerName: string,
  propertyTitle: string,
  daysRemaining: number,
  propertyId: string
): Promise<EmailDispatchResult> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const renewUrl = `${baseUrl}/dashboard/packages`;

  const html = renderBrandedHtml(
    `Listing Expiry Reminder: ${daysRemaining} Days Left`,
    `
      <p>Hello <strong>${sellerName}</strong>,</p>
      <p>This is a courtesy reminder that your listing <strong>${propertyTitle}</strong> will expire in <strong>${daysRemaining} days</strong>.</p>
      <p>Once expired, the property will no longer appear in buyer search results. To keep receiving buyer leads, you can renew your listing or boost it with a Featured Listing Package.</p>
    `,
    { text: "Renew / Boost Listing", url: renewUrl }
  );

  return dispatchEmail({
    to: email,
    subject: `Action Required: Your listing expires in ${daysRemaining} days - ${propertyTitle}`,
    html,
    event: "LISTING_EXPIRY_REMINDER",
  });
}

// 8. Payment Confirmation or Failure
export async function sendPaymentStatusEmail(
  email: string,
  userName: string,
  status: "SUCCESS" | "FAILED",
  packageName: string,
  amount: number,
  transactionId: string,
  failureReason?: string
): Promise<EmailDispatchResult> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const isSuccess = status === "SUCCESS";
  const targetUrl = isSuccess ? `${baseUrl}/dashboard/packages` : `${baseUrl}/dashboard/packages`;

  const bodyContent = isSuccess
    ? `
      <p>Hello <strong>${userName}</strong>,</p>
      <p>Your payment on Landora has been successfully verified and confirmed. Your listing package benefits have been activated immediately.</p>
      
      <div style="background-color: #f8fafc; padding: 18px; border-radius: 12px; border: 1px solid #e2e8f0; margin: 18px 0;">
        <table role="presentation" width="100%" style="font-size: 13px;">
          <tr>
            <td style="color: #64748b; padding: 4px 0;">Package:</td>
            <td style="color: #0f172a; font-weight: bold; text-align: right;">${packageName}</td>
          </tr>
          <tr>
            <td style="color: #64748b; padding: 4px 0;">Amount Paid:</td>
            <td style="color: #0f172a; font-weight: bold; text-align: right;">₹${amount.toLocaleString("en-IN")} INR</td>
          </tr>
          <tr>
            <td style="color: #64748b; padding: 4px 0;">Transaction ID:</td>
            <td style="color: #0f172a; font-family: monospace; text-align: right;">${transactionId}</td>
          </tr>
          <tr>
            <td style="color: #64748b; padding: 4px 0;">Status:</td>
            <td style="color: #059669; font-weight: bold; text-align: right;">Confirmed (Paid)</td>
          </tr>
        </table>
      </div>
      <p>GST tax invoices and receipt records can be accessed anytime from your Dashboard.</p>
    `
    : `
      <p>Hello <strong>${userName}</strong>,</p>
      <p>We were unable to complete your payment for <strong>${packageName}</strong> (Amount: ₹${amount.toLocaleString("en-IN")}).</p>
      <div style="background-color: #fff1f2; padding: 14px 18px; border-radius: 8px; margin: 16px 0; border-left: 4px solid #f43f5e;">
        <strong style="color: #9f1239; font-size: 13px;">Failure Reason:</strong>
        <p style="margin: 4px 0 0; font-size: 13px; color: #881337;">${failureReason || "Transaction was declined or cancelled by bank."}</p>
      </div>
      <p>No money was deducted. You can retry the transaction using UPI, Netbanking, or another card.</p>
    `;

  const html = renderBrandedHtml(
    isSuccess ? "Payment Confirmation & Receipt" : "Payment Incomplete: Action Required",
    bodyContent,
    { text: isSuccess ? "View Active Package" : "Retry Payment", url: targetUrl }
  );

  return dispatchEmail({
    to: email,
    subject: isSuccess ? `Receipt: Payment confirmed for ${packageName}` : `Payment Failed: ${packageName}`,
    html,
    event: isSuccess ? "PAYMENT_CONFIRMATION" : "PAYMENT_FAILED",
  });
}
