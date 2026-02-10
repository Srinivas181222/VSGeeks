const nodemailer = require("nodemailer");

const buildTransport = () => {
  if (!process.env.SMTP_HOST) return null;
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

const sendVerificationEmail = async ({ to, token }) => {
  const transporter = buildTransport();
  const baseUrl = process.env.APP_BASE_URL || "http://localhost:5173";
  const verifyUrl = `${baseUrl}/verify?token=${token}`;

  if (!transporter) {
    console.log(`Verify email for ${to}: ${verifyUrl}`);
    return true;
  }

  await transporter.sendMail({
    from: process.env.SMTP_FROM || "CodeLearn <no-reply@codelearn.local>",
    to,
    subject: "Verify your CodeLearn account",
    html: `<p>Welcome to CodeLearn.</p>
           <p>Verify your email by clicking the link below:</p>
           <p><a href="${verifyUrl}">${verifyUrl}</a></p>`,
  });

  return true;
};

module.exports = { sendVerificationEmail };
