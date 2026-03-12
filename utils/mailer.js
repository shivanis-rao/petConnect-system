import nodemailer from "nodemailer";

let transporter = null;

const createTransporter = async () => {
  if (transporter) return transporter;

  const useGmail = process.env.EMAIL_USER && process.env.EMAIL_PASS;

  if (useGmail) {
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  } else {
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: { user: testAccount.user, pass: testAccount.pass },
    });
  }

  return transporter;
};

export const sendOtpEmail = async (email, otp) => {
  try {
    const transport = await createTransporter();

    const info = await transport.sendMail({
      from: `"PetConnect" <${process.env.EMAIL_USER || "no-reply@petconnect.com"}>`,
      to: email,
      subject: "Your OTP Code - PetConnect",
      text: `Your PetConnect OTP is: ${otp}. Valid for 10 minutes. Do not share it.`,

      html: `
        <div style="font-family: Arial, sans-serif; max-width: 400px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
          <h2 style="color: #06b6d4;">🐾 PetConnect</h2>
          <p>Your OTP code is:</p>
          <h1 style="letter-spacing: 8px; color: #06b6d4;">${otp}</h1>
          <p>Valid for <strong>10 minutes</strong>. Do not share it with anyone.</p>
        </div>
      `,
    });

    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log("Preview URL:", previewUrl);
    } else {
      console.log("OTP email sent to:", email);
    }

    return previewUrl || false;
  } catch (error) {
    console.error("sendOtpEmail failed:", error.message);
    throw new Error("Failed to send OTP email. Please try again.");
  }
};

//ResetLink for Forgot password
export const sendResetEmail = async (toEmail, resetLink) => {
  const transport = await createTransporter();
  const mailOptions = {
    from: `"PetConnect" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: "Reset Your PetConnect Password",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto; padding: 32px; border-radius: 12px; border: 1px solid #E5E7EB;">
        <div style="text-align: center; margin-bottom: 24px;">
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-9 h-9 text-blue-600">
            <ellipse cx="7" cy="6" rx="1.2" ry="1.6" />
            <ellipse cx="4.5" cy="7.5" rx="1" ry="1.4" />
            <ellipse cx="9.5" cy="7.5" rx="1" ry="1.4" />
            <path d="M7 10 C4 10 3 13 4.5 14.5 C5.5 15.5 8.5 15.5 9.5 14.5 C11 13 10 10 7 10Z" />
            <ellipse cx="17" cy="4" rx="1.2" ry="1.6" />
            <ellipse cx="14.5" cy="5.5" rx="1" ry="1.4" />
            <ellipse cx="19.5" cy="5.5" rx="1" ry="1.4" />
            <path d="M17 8 C14 8 13 11 14.5 12.5 C15.5 13.5 18.5 13.5 19.5 12.5 C21 11 20 8 17 8Z" />
          </svg>
        </div>
        <h3 style="color: #111827;">Reset Your Password</h3>
        <p style="color: #6B7280;">We received a request to reset your password. Click the button below to set a new password. This link expires in <strong>1 hour</strong>.</p>
        <div style="text-align: center; margin: 32px 0;">
          <a href="${resetLink}"
            style="background-color: #3B82F6; color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px;">
            Reset Password
          </a>
        </div>
        <p style="color: #9CA3AF; font-size: 13px;">If you didn't request this, you can safely ignore this email. Your password won't change.</p>
        <hr style="border-color: #E5E7EB; margin: 24px 0;" />
        <p style="color: #9CA3AF; font-size: 12px; text-align: center;">© 2026 PetConnect Adoption Services. All rights reserved.</p>
      </div>
    `,
  };

  await transport.sendMail(mailOptions);
};
