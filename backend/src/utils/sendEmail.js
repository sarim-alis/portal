import nodemailer from 'nodemailer';

const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: smtpUser,
    pass: smtpPass,
  },
});

export async function sendVoucherRedeemEmail({ to, code, location, productTitle }) {
  const mailOptions = {
    from: smtpUser,
    to,
    subject: 'Voucher Redeemed Notification',
    html: `<div>
      <h2>Voucher Redeemed</h2>
      <p><strong>Voucher Code:</strong> ${code}</p>
      <p><strong>Product:</strong> ${productTitle}</p>
      <p><strong>Location Used:</strong> ${location}</p>
      <p>Thank you for using our service!</p>
    </div>`
  };
  return transporter.sendMail(mailOptions);
}
