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

const EMAIL_LOGO_FOOTER = 'https://res.cloudinary.com/dgk3gaml0/image/upload/v1756224350/kuc37dmifsg42ojqxwc1.png';
const EMAIL_LOGO_HEADER = 'https://res.cloudinary.com/dgk3gaml0/image/upload/v1756224071/gtgy8nrnhkbcemgyh1ps.png';

function getEmailHeader() {
  return `
    <div style="max-width:600px;margin:0 auto;background:#fff;font-family:'Barlow Condensed',Arial,sans-serif;">
      <div style="background:#8a232c;padding:0 0 0 0;">
        <div style="padding:24px 0 0 0;text-align:center;">
          <img src="${EMAIL_LOGO_HEADER}" width="180" height="60" style="margin-right:10px;object-fit:contain;" alt="Jiffy Lube Logo" />
        </div>
      </div>
      <div style="background:#fff;padding:0 0 0 0;">
        <div style="padding:32px 24px 0 24px;">
  `;
}

function getEmailFooter() {
  return `
        <div style="margin-top:45px;padding:24px;background:#F5F5F5;border-radius:8px;text-align:center;">
          <div style="font-size:28px;font-weight:600;margin-bottom:8px;color:#000000">Want to save again on your next visit?</div>
          <div style="font-size:17px;color:#444;margin-bottom:20px;color:#63666A">Stock up on more oil change vouchers today and keep your vehicle ready for the road ahead.</div>
          <a href="#" style="display:inline-block;background:#862633;color:#fff;font-weight:600;padding:12px 36px;border-radius:6px;text-decoration:none;font-size:18px;">BUNDLE & SAVE</a>
        </div>
        <div style="text-align:center;margin:32px 0 0 0;">
          <img src="${EMAIL_LOGO_FOOTER}" width="120" height="40" style="object-fit:contain;" alt="Jiffy Lube Logo" />
        </div>
      </div>
    </div>
  `;
}

function getVoucherRedeemEmail({voucherCode, product, location}) {
  return `
    ${getEmailHeader()}
      <div style="margin-bottom:32px;">
        <h2 style="color:#862633;font-size:36px;font-weight:600;margin:0 0 12px 0;">Thank you <span style='color:#000000'>for choosing Jiffy Lube!</span></h2>
        <div style="font-size:18px;color:#000000;margin-bottom:18px;font-weight:400;">We noticed you recently used your oil change voucher.</div>
        <div style="font-size:17px;color:#000000;margin-bottom:8px;"><b>Voucher #:</b><span style="color:#63666A">[ <span>${voucherCode}</span> ]</span></div>
        <div style="font-size:17px;color:#000000;margin-bottom:8px;"><b>Product:</b><span style="color:#63666A">[ <span>${product}</span> ]</span></div>
        <div style="font-size:17px;color:#000000;margin-bottom:18px;"><b>Location Used:</b><span style="color:#63666A">[ <span>${location}</span> ]</span></div>
        <div style="font-size:17px;color:#63666A;margin-bottom:8px;font-weight:400;">Thanks for trusting us to help keep your car running smoothly.</div>
        <div style="font-size:18px;color:#000000;font-weight:400;">We appreciate your business.</div>
      </div>
    ${getEmailFooter()}
  `;
}

function getGiftCardRedeemEmail({giftCardCode, amountUsed, remainingBalance, location}) {
  return `
    ${getEmailHeader()}
      <div style="margin-bottom:32px;">
        <h2 style="color:#8a232c;font-size:32px;font-weight:700;margin:0 0 12px 0;">Thank you <span style='color:#222'>for choosing Jiffy Lube!</span></h2>
        <div style="font-size:18px;color:#000000;margin-bottom:18px;">We noticed you recently used your gift card.</div>
        <div style="font-size:16px;color:#000000;margin-bottom:8px;"><b>Gift Card #:</b><span style="color:#63666A">[ <span>${giftCardCode}</span> ]</span></div>
        <div style="font-size:16px;color:#000000;margin-bottom:8px;"><b>Amount Used:</b><span style="color:#63666A">[ <span>$${amountUsed}</span> ]</span></div>
        <div style="font-size:16px;color:#000000;margin-bottom:8px;"><b>Remaining Balance:</b><span style="color:#63666A">[ <span>$${remainingBalance}</span> ]</span></div>
        <div style="font-size:16px;color:#000000;margin-bottom:18px;"><b>Location Used:</b><span style="color:#63666A">[ <span>${location}</span> ]</span></div>
        <div style="font-size:15px;color:#63666A;margin-bottom:8px;font-weight:400;">Thanks for trusting us to help keep your car running smoothly.</div>
        <div style="font-size:15px;color:#000000;font-weight:500;">We appreciate your business.</div>
      </div>
    ${getEmailFooter()}
  `;
}

export async function sendVoucherRedeemEmail({ to, code, location, productTitle }) {
  const mailOptions = {
    from: smtpUser,
    to,
    subject: 'Voucher Redeemed Notification',
    html: getVoucherRedeemEmail({voucherCode: code, product: productTitle, location}),
  };
  return transporter.sendMail(mailOptions);
}

export async function sendGiftCardRedeemEmail({ to, giftCardCode, amountUsed, remainingBalance, location }) {
  const mailOptions = {
    from: smtpUser,
    to,
    subject: 'Gift Card Redeemed Notification',
    html: getGiftCardRedeemEmail({giftCardCode, amountUsed, remainingBalance, location}),
  };
  return transporter.sendMail(mailOptions);
}
