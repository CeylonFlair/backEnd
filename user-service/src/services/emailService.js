
import nodemailer from "nodemailer";
import 'dotenv/config';

const transporter = nodemailer.createTransport({
  host: "smtp.ethereal.email",
  port: 587,
  auth: {
    user: process.env.ETHEREAL_USER,
    pass: process.env.ETHEREAL_PASS,
  },
});

export const sendVerificationEmail = async (user, token) => { 
  console.log("Sending verification email to:", user.email);
  const info = await transporter.sendMail({
    from: '"Ceylon Flair" <no-reply@ceylonflair.com>',
    to: user.email,
    subject: "Verify your email address",
    text: `Please verify your email using this OTP: ${token}`,
    html: `<p>Please verify your email using this OTP: <strong>${token}</strong></p>`,
  });
  console.log("Verification email sent: %s", info.messageId);
  console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
};

export const sendResetPasswordEmail = async (user, token) => {
  const info = await transporter.sendMail({
    from: '"Ceylon Flair" <no-reply@ceylonflair.com>',
    to: user.email,
    subject: "Reset your password",
    text: `Use this token to reset your password: ${token}`,
    html: `<p>Use this token to reset your password: <strong>${token}</strong></p>`,
  });
  console.log("Reset password email sent: %s", info.messageId);
  console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
};
