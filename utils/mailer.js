import nodemailer from "nodemailer";

let transporter = null;

const createTransporter = async () => {
  if (transporter) return transporter;

  const useGmail = process.env.EMAIL_USER && process.env.EMAIL_PASS;

  if (useGmail) {
    // ✅ Real Gmail delivery → lands in actual inbox
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // App Password from Google Account
      },
    });
    console.log("📧 Mailer: Gmail →", process.env.EMAIL_USER);
  } else {
    // 🛠️ Dev fallback → Ethereal fake inbox
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: { user: testAccount.user, pass: testAccount.pass },
    });
    console.log("📧 Mailer: Ethereal (dev) →", testAccount.user);
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
      html: buildOtpHtml(otp),
    });

    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log("📬 Preview URL:", previewUrl);
    } else {
      console.log("📬 OTP email sent to:", email);
    }

    return previewUrl || false;

  } catch (error) {
    console.error("❌ sendOtpEmail failed:", error.message);
    throw new Error("Failed to send OTP email. Please try again.");
  }
};