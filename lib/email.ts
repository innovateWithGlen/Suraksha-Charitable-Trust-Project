import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL || "Suraksha Trust <onboarding@resend.dev>";
const DEFAULT_TEST_INBOX = "glenmonteiro47@gmail.com";

async function sendWithRecipientFallback(
  payload: Parameters<typeof resend.emails.send>[0]
) {
  const primary = await resend.emails.send(payload);
  if (!(primary as any)?.error) {
    return primary;
  }

  const errorMessage = String((primary as any)?.error?.message || "").toLowerCase();
  const blockedByResendTestMode =
    errorMessage.includes("you can only send testing emails to your own email address") ||
    errorMessage.includes("verify a domain");

  const fallbackRecipient = process.env.ADMIN_EMAIL || DEFAULT_TEST_INBOX;
  const currentRecipient = Array.isArray((payload as any).to)
    ? String((payload as any).to?.[0] || "")
    : String((payload as any).to || "");

  if (!blockedByResendTestMode || !fallbackRecipient || currentRecipient === fallbackRecipient) {
    return primary;
  }

  const retried = await resend.emails.send({
    ...payload,
    to: fallbackRecipient,
  });

  return retried;
}

function toAbsoluteUrl(pathOrUrl: string): string {
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;

  const configuredBase = process.env.NEXT_PUBLIC_APP_URL;
  const vercelProductionUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  const vercelPreviewUrl = process.env.VERCEL_URL;

  const looksLikeLocalhost = (value: string) => /localhost|127\.0\.0\.1/i.test(value);

  let base = configuredBase || "";
  if (process.env.NODE_ENV === "production" && (!base || looksLikeLocalhost(base))) {
    if (vercelProductionUrl) {
      base = `https://${vercelProductionUrl}`;
    } else if (vercelPreviewUrl) {
      base = `https://${vercelPreviewUrl}`;
    }
  }

  if (!base) {
    base = "http://localhost:3000";
  }

  const normalizedBase = base.endsWith("/") ? base.slice(0, -1) : base;
  const normalizedPath = pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`;
  return `${normalizedBase}${normalizedPath}`;
}

function getTestInbox(): string | undefined {
  const explicit = process.env.TEST_EMAIL_INBOX || process.env.DEMO_EMAIL_INBOX;
  if (explicit) return explicit;

  // For this deployment's test setup, always route to admin/owned inbox when no explicit test inbox is set.
  return process.env.ADMIN_EMAIL || DEFAULT_TEST_INBOX;
}

function resolveRecipient(email: string): string {
  const testInbox = getTestInbox();
  if (testInbox) return testInbox;

  const demoEnabled = process.env.DEMO_EMAIL_REDIRECT_ENABLED === "true";
  if (!demoEnabled) return email;
  return process.env.DEMO_EMAIL_INBOX || process.env.ADMIN_EMAIL || email;
}

function maybeRedirectNotice(originalEmail: string): string {
  const routed = resolveRecipient(originalEmail);
  if (routed === originalEmail) return "";

  return `<p style="color:#64748b; font-size:12px; margin-top:10px;">Test mode: original recipient <strong>${escapeHtml(
    originalEmail
  )}</strong> was redirected to <strong>${escapeHtml(routed)}</strong>.</p>`;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export async function sendDonationConfirmation(
  donor: { name: string; email: string },
  donation: {
    transactionId: string;
    amount: number;
    method: string;
    createdAt: Date;
  }
) {
  const formattedAmount = donation.amount.toLocaleString("en-IN");
  const formattedDate = new Date(donation.createdAt).toLocaleDateString(
    "en-IN",
    {
      day: "numeric",
      month: "long",
      year: "numeric",
    }
  );

  const response = await sendWithRecipientFallback({
    from: FROM_EMAIL,
    to: resolveRecipient(donor.email),
    subject: `Donation Confirmation - ₹${formattedAmount} | Suraksha Charitable Trust`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px; padding: 20px; background: #1a365d; border-radius: 12px;">
          <h1 style="color: white; margin: 0; font-size: 24px;">Suraksha Charitable Trust</h1>
        </div>
        
        <h2 style="color: #1a365d;">Thank You for Your Donation! 🙏</h2>
        <p style="color: #334155;">Dear ${donor.name},</p>
        <p style="color: #334155;">We are grateful for your generous contribution. Your donation will help us continue our work in education, healthcare, and community development.</p>
        
        <div style="background: #f8fafc; border-radius: 12px; padding: 24px; margin: 24px 0;">
          <h3 style="color: #1a365d; margin-top: 0;">Donation Details</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px 0; color: #64748b;">Transaction ID</td><td style="padding: 8px 0; color: #1a365d; font-weight: bold; text-align: right;">${donation.transactionId}</td></tr>
            <tr><td style="padding: 8px 0; color: #64748b;">Amount</td><td style="padding: 8px 0; color: #1a365d; font-weight: bold; text-align: right;">₹${formattedAmount}</td></tr>
            <tr><td style="padding: 8px 0; color: #64748b;">Payment Method</td><td style="padding: 8px 0; color: #1a365d; text-align: right;">${donation.method.toUpperCase()}</td></tr>
            <tr><td style="padding: 8px 0; color: #64748b;">Date</td><td style="padding: 8px 0; color: #1a365d; text-align: right;">${formattedDate}</td></tr>
          </table>
        </div>
        
        <p style="color: #334155;">Your 80G tax exemption certificate will be sent to you shortly.</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <p style="color: #94a3b8; font-size: 12px;">
            Suraksha Charitable Trust<br>
            Registered under Section 80G of Income Tax Act<br>
            For queries: contact@surakshatrust.org
          </p>
        </div>
      </div>
    `,
  });

  if ((response as any)?.error) {
    throw new Error((response as any).error.message || "Failed to send donation confirmation email");
  }
}

export async function sendCertificateEmail(
  donor: { name: string; email: string },
  certificateUrl: string,
  donation: { amount: number; transactionId: string }
) {
  const formattedAmount = donation.amount.toLocaleString("en-IN");

  const response = await sendWithRecipientFallback({
    from: FROM_EMAIL,
    to: resolveRecipient(donor.email),
    subject: `80G Tax Certificate - ₹${formattedAmount} | Suraksha Charitable Trust`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px; padding: 20px; background: #1a365d; border-radius: 12px;">
          <h1 style="color: white; margin: 0; font-size: 24px;">Suraksha Charitable Trust</h1>
        </div>
        
        <h2 style="color: #1a365d;">Your 80G Tax Certificate</h2>
        <p style="color: #334155;">Dear ${donor.name},</p>
        <p style="color: #334155;">Please find your 80G tax exemption certificate for your donation of <strong>₹${formattedAmount}</strong> (Transaction: ${donation.transactionId}).</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${certificateUrl}" 
             style="background: #1a365d; color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: bold; display: inline-block;">
            Download Certificate
          </a>
        </div>
        
        <p style="color: #64748b; font-size: 13px;">This certificate can be used for tax deduction under Section 80G of the Income Tax Act.</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <p style="color: #94a3b8; font-size: 12px;">
            Suraksha Charitable Trust<br>
            For queries: contact@surakshatrust.org
          </p>
        </div>
      </div>
    `,
  });

  if ((response as any)?.error) {
    throw new Error((response as any).error.message || "Failed to send certificate email");
  }
}

export async function sendContactNotification(inquiry: {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}) {
  const adminEmail = process.env.ADMIN_EMAIL || "glenmonteiro47@gmail.com";

  const response = await sendWithRecipientFallback({
    from: FROM_EMAIL,
    to: resolveRecipient(adminEmail),
    subject: `New Contact Inquiry: ${inquiry.subject}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #1a365d;">New Contact Form Submission</h2>
        
        <div style="background: #f8fafc; border-radius: 12px; padding: 24px; margin: 16px 0;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px 0; color: #64748b; vertical-align: top; width: 100px;">Name</td><td style="padding: 8px 0; color: #1a365d;">${inquiry.name}</td></tr>
            <tr><td style="padding: 8px 0; color: #64748b; vertical-align: top;">Email</td><td style="padding: 8px 0; color: #1a365d;">${inquiry.email}</td></tr>
            ${inquiry.phone ? `<tr><td style="padding: 8px 0; color: #64748b; vertical-align: top;">Phone</td><td style="padding: 8px 0; color: #1a365d;">${inquiry.phone}</td></tr>` : ""}
            <tr><td style="padding: 8px 0; color: #64748b; vertical-align: top;">Subject</td><td style="padding: 8px 0; color: #1a365d; font-weight: bold;">${inquiry.subject}</td></tr>
            <tr><td style="padding: 8px 0; color: #64748b; vertical-align: top;">Message</td><td style="padding: 8px 0; color: #1a365d;">${inquiry.message}</td></tr>
          </table>
        </div>
        
        <p style="color: #64748b; font-size: 13px;">Reply directly to ${inquiry.email} or manage from the admin panel.</p>
      </div>
    `,
  });

  if ((response as any)?.error) {
    throw new Error((response as any).error.message || "Failed to send contact notification email");
  }
}

export async function sendOTPEmail(email: string, otp: string) {
  const response = await sendWithRecipientFallback({
    from: FROM_EMAIL,
    to: resolveRecipient(email),
    subject: "Your Login OTP - Suraksha Charitable Trust",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #1a365d; margin: 0;">Suraksha Charitable Trust</h1>
          <p style="color: #64748b; margin-top: 5px;">Admin Portal</p>
        </div>
        <div style="background: #f8fafc; border-radius: 12px; padding: 30px; text-align: center;">
          <p style="color: #334155; margin-bottom: 20px;">Your one-time login code is:</p>
          <div style="background: #1a365d; color: white; font-size: 32px; font-weight: bold; letter-spacing: 8px; padding: 16px 24px; border-radius: 8px; display: inline-block;">
            ${otp}
          </div>
          <p style="color: #94a3b8; font-size: 13px; margin-top: 20px;">
            This code expires in 5 minutes. Do not share it with anyone.
          </p>
        </div>
        <p style="color: #94a3b8; font-size: 12px; text-align: center; margin-top: 20px;">
          If you didn't request this code, please ignore this email.
        </p>
      </div>
    `,
  });

  if ((response as any)?.error) {
    throw new Error((response as any).error.message || "Failed to send OTP email");
  }
}

export async function send80GReceiptEmail(params: {
  donor: { name: string; email: string };
  transactionId: string;
  amount: number;
  certificateNumber: string;
  urnUsed: string;
  pdfUrl: string;
  pdfBase64?: string;
}) {
  const { donor, transactionId, amount, certificateNumber, urnUsed, pdfUrl, pdfBase64 } = params;
  const receiptUrl = toAbsoluteUrl(pdfUrl);
  const formattedAmount = amount.toLocaleString("en-IN");
  const recipient = resolveRecipient(donor.email);
  const commonPayload = {
    to: recipient,
    subject: `80G Receipt ${certificateNumber} | Suraksha Charitable Trust`,
    attachments: pdfBase64
      ? [
          {
            filename: `${certificateNumber}.pdf`,
            content: pdfBase64,
          },
        ]
      : undefined,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #1a365d; margin-bottom: 8px;">Suraksha Charitable Trust, Sirsi</h2>
        <p style="color: #334155;">Dear ${escapeHtml(donor.name)},</p>
        <p style="color: #334155;">Your 80G receipt has been generated successfully.</p>

        <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:10px; padding:16px; margin:20px 0;">
          <p style="margin:6px 0;"><strong>Receipt Number:</strong> ${escapeHtml(certificateNumber)}</p>
          <p style="margin:6px 0;"><strong>Donation Amount:</strong> INR ${formattedAmount}</p>
          <p style="margin:6px 0;"><strong>Transaction ID:</strong> ${escapeHtml(transactionId)}</p>
          <p style="margin:6px 0;"><strong>URN:</strong> ${escapeHtml(urnUsed)}</p>
          <p style="margin:6px 0;"><strong>Tax Clause:</strong> Eligible for 50% tax deduction under Section 80G of the IT Act.</p>
        </div>

        <p><a href="${receiptUrl}" style="background:#1a365d; color:#fff; text-decoration:none; padding:10px 16px; border-radius:8px; display:inline-block;">Download 80G Receipt</a></p>
        ${maybeRedirectNotice(donor.email)}
      </div>
    `,
  };

  const primary = await sendWithRecipientFallback({ from: FROM_EMAIL, ...commonPayload });
  if (!primary.error) {
    return;
  }

  const fallbackFrom = "Suraksha Trust <onboarding@resend.dev>";
  const fallback = await resend.emails.send({ from: fallbackFrom, ...commonPayload });
  if (fallback.error) {
    throw new Error(fallback.error.message || primary.error.message || "Failed to send 80G receipt email");
  }
}

export async function sendInquiryReplyEmail(params: {
  toEmail: string;
  toName: string;
  subject: string;
  replyContent: string;
}) {
  const { toEmail, toName, subject, replyContent } = params;

  const response = await sendWithRecipientFallback({
    from: FROM_EMAIL,
    to: resolveRecipient(toEmail),
    subject: `Re: ${subject} | Suraksha Charitable Trust`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #1a365d; margin-bottom: 8px;">Suraksha Charitable Trust</h2>
        <p style="color: #334155;">Dear ${escapeHtml(toName)},</p>
        <p style="color: #334155;">Thank you for contacting us. Please find our response below:</p>
        <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:10px; padding:16px; margin:20px 0; white-space:pre-wrap; color:#0f172a;">${escapeHtml(replyContent)}</div>
        ${maybeRedirectNotice(toEmail)}
      </div>
    `,
  });

  if ((response as any)?.error) {
    throw new Error((response as any).error.message || "Failed to send inquiry reply email");
  }
}
