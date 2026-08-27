// src/lib/mailer.ts
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false, // true for 465, false for 587
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendWelcomeCredentialsEmail(data: {
  toEmail: string;
  customerName: string;
  custId: string;
  tempPassword: string;
  accountNumber: string;
  accountType: string;
}) {
  const mailOptions = {
    from: `"JKBank Support" <${process.env.SMTP_USER}>`,
    to: data.toEmail,
    subject: "Official Account Opening & Security Credentials - JKBank",
    // Plain text fallback reduces spam penalty score:
    text: `JKBank Corporate Notification\n\nDear ${data.customerName},\nYour new account has been provisioned.\nCustomer ID: ${data.custId}\nAccount Number: ${data.accountNumber} (${data.accountType})\nTemporary Access Code: ${data.tempPassword}\n\nPlease log in and update your password immediately.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
        <div style="border-bottom: 2px solid #1e3a8a; padding-bottom: 12px; margin-bottom: 20px;">
          <h2 style="color: #1e3a8a; margin: 0; font-size: 20px; font-weight: 700;">JKBank Corporate Notification</h2>
          <p style="font-size: 12px; color: #6b7280; margin: 4px 0 0 0;">Secure Core Banking Services Division</p>
        </div>

        <p style="font-size: 14px; line-height: 1.5; margin-bottom: 16px;">
          Dear <strong>${data.customerName}</strong>,
        </p>
        
        <p style="font-size: 14px; line-height: 1.5; margin-bottom: 16px;">
          We are pleased to inform you that your new banking account has been successfully registered and provisioned by your home branch. Please find your official account credentials below:
        </p>

        <div style="background-color: #f3f4f6; padding: 16px; border-radius: 6px; margin: 20px 0; border: 1px solid #e5e7eb;">
          <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
            <tr>
              <td style="padding: 6px 0; color: #4b5563; width: 45%;"><strong>Customer ID:</strong></td>
              <td style="padding: 6px 0; font-family: monospace; color: #111827;">${data.custId}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #4b5563;"><strong>Account Number:</strong></td>
              <td style="padding: 6px 0; font-family: monospace; color: #111827;">${data.accountNumber} (${data.accountType})</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #4b5563;"><strong>Temporary Access Code:</strong></td>
              <td style="padding: 6px 0; font-family: monospace; color: #1f2937; font-weight: bold;">${data.tempPassword}</td>
            </tr>
          </table>
        </div>

        <div style="background-color: #eff6ff; border-left: 4px solid #1e40af; padding: 12px 16px; margin-bottom: 20px; border-radius: 0 6px 6px 0;">
          <p style="font-size: 13px; color: #1e3a8a; margin: 0; line-height: 1.4;">
            <strong>Security Mandate:</strong> In compliance with financial security regulations, please log in to your portal immediately using the temporary access code above and update your password. JKBank representatives will never ask you to disclose your password or PIN.
          </p>
        </div>

        <p style="font-size: 14px; line-height: 1.5; margin-bottom: 24px;">
          If you did not request this account creation or believe you have received this communication in error, please contact our support desk immediately.
        </p>

        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
        
        <p style="font-size: 11px; color: #9ca3af; line-height: 1.4; margin: 0;">
          <strong>Legal Notice:</strong> This electronic mail transmission contains confidential information, which may be legally privileged. If you are not the intended recipient, be aware that any review, disclosure, copying, distribution, or use of the contents of this information is strictly prohibited. 
        </p>
        <p style="font-size: 11px; color: #9ca3af; margin: 8px 0 0 0;">
          © ${new Date().getFullYear()} JKBank Corporation. All rights reserved. Registered Banking Institution.
        </p>
      </div>
    `,
  };

  try {
    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      await transporter.sendMail(mailOptions);
      console.log(`[Email Sent] Official credentials dispatched to ${data.toEmail}`);
    } else {
      console.log(`[Mock Email] SMTP credentials not set. Password for ${data.toEmail}: ${data.tempPassword}`);
    }
  } catch (error) {
    console.error("[Email Error] Failed to send credentials email:", error);
  }
}