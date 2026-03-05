import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL || "Suraksha Trust <onboarding@resend.dev>";

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

  await resend.emails.send({
    from: FROM_EMAIL,
    to: donor.email,
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
}

export async function sendCertificateEmail(
  donor: { name: string; email: string },
  certificateUrl: string,
  donation: { amount: number; transactionId: string }
) {
  const formattedAmount = donation.amount.toLocaleString("en-IN");

  await resend.emails.send({
    from: FROM_EMAIL,
    to: donor.email,
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
}

export async function sendContactNotification(inquiry: {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}) {
  const adminEmail = process.env.ADMIN_EMAIL || "glenmonteiro47@gmail.com";

  await resend.emails.send({
    from: FROM_EMAIL,
    to: adminEmail,
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
}

export async function sendOTPEmail(email: string, otp: string) {
  await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
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
}
