const nodemailer = require('nodemailer');

// Create transporter using environment variables
// Supports common SMTP providers. For development, you can use Ethereal if creds not provided.
async function createTransporter() {
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: Boolean(process.env.SMTP_SECURE === 'true'),
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }

  // Fallback to Ethereal (test SMTP) if no SMTP creds provided
  const testAccount = await nodemailer.createTestAccount();
  return nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass
    }
  });
}

async function sendEmail({ to, subject, html }) {
  const transporter = await createTransporter();

  const info = await transporter.sendMail({
    from: process.env.MAIL_FROM || 'no-reply@example.com',
    to,
    subject,
    html
  });

  if (nodemailer.getTestMessageUrl(info)) {
    console.log('Preview URL: ' + nodemailer.getTestMessageUrl(info));
  }

  return info;
}

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

module.exports = { sendEmail, generateOtp };


