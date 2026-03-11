// import nodemailer from "nodemailer";

// const transporter = nodemailer.createTransport({
//    service:"gmail",
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS,
//   },
// });

// export const sendOtpEmail = async (email, otp) => {
//   await transporter.sendMail({
//     from: `"PetConnect" <${process.env.EMAIL_USER}>`,
//     to: email,
//     subject: "Your OTP - PetConnect",
//     html: `<p>Your OTP is <strong>${otp}</strong>. It expires in 10 minutes.</p>`
//   });
// };
import nodemailer from "nodemailer";

let transporter;

const getTransporter = async () => {
  if (transporter) return transporter;
  const testAccount = await nodemailer.createTestAccount();
  transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });
  return transporter;
};

export const sendOtpEmail = async (email, otp) => {
  const transport = await getTransporter();
  const info = await transport.sendMail({
    from: '"PetConnect" <no-reply@petconnect.com>',
    to: email,
    subject: "Your OTP - PetConnect",
    html: `<p>Your OTP is <strong>${otp}</strong>. It expires in 10 minutes.</p>`
  });
  return nodemailer.getTestMessageUrl(info);
};