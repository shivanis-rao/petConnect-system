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
    console.log("Mailer: Gmail →", process.env.EMAIL_USER);
  } else {
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: { user: testAccount.user, pass: testAccount.pass },
    });
    console.log("Mailer: Ethereal (dev) →", testAccount.user);
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
  const mailOptions = {
    from: `"PetConnect" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: "Reset Your PetConnect Password",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto; padding: 32px; border-radius: 12px; border: 1px solid #E5E7EB;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h2 style="color: #1D4ED8;">:feet: PetConnect</h2>
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

  await transporter.sendMail(mailOptions);
};