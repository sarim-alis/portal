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
        <div style="padding:10px 0 0 0;text-align:center;">
          <img src="${EMAIL_LOGO_HEADER}" width="50%" height="40" style="margin-right:10px; object-fit: contain;" alt="Jiffy Lube Logo" />
        </div>
      </div>
      <div style="background:#fff;padding:0 0 0 0;">
        <div style="padding:32px 40px 24px 40px;">
  `;
}

function getEmailFooter() {
  return `
        <div style="margin-top:45px;padding:24px;background:#F5F5F5;border-radius:8px;text-align:center;">
          <div style="font-size:22px;font-weight:600;margin-bottom:8px;color:#000000">Want to save again on your next visit?</div>
          <div style="font-size:14px;color:#63666A;margin-bottom:20px;color:#63666A">Stock up on oil change vouchers to keep your car road ready—or pick up a gift card and give friends or family the same peace of mind.</div>
          <a href="https://redemptionsolution.myshopify.com/" style="display:inline-block;background:#862633;color:#fff;font-weight:600;padding:12px 36px;border-radius:6px;text-decoration:none;font-size:16px; width:100%;box-sizing: border-box; ">BUNDLE & SAVE</a>
        </div>
        <div style="text-align:center;margin:32px 0 0 0;">
          <img src="${EMAIL_LOGO_FOOTER}" width="50%" height="40" style="margin-right:10px; object-fit: contain;" alt="Jiffy Lube Logo" />
        </div>
      </div>
    </div>
  `;
}

function wrapEmailHtml(content) {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Jiffy Lube Email</title>
    <style>body { font-family: Arial, sans-serif !important; }</style>
  </head>
  <body style="margin:0;padding:20px 0; background:#F5F5F5;">
    ${content}
  </body>
</html>`;
}

function getVoucherRedeemEmail({voucherCode, product, location}) {
  const inner = `
    ${getEmailHeader()}
      <div style="margin-bottom:32px;">
        <h2 style="color:#862633;font-size:26px;font-weight:600;margin:0 0 10px 0;"><span style="color:#862633;">Thank you </span><span style='color:#000000'>for choosing Jiffy Lube!</span></h2>
        <div style="font-size:16px;color:#000000;margin-bottom:24px;">We noticed you recently used your oil change voucher.</div>
        <div style="font-size:14px;color:#000000;margin-bottom:10px;"><b>Voucher #:</b> <span style="color:#63666A"><span> ${voucherCode}</span></span></div>
        <div style="font-size:14px;color:#000000;margin-bottom:10px;"><b>Product:</b> <span style="color:#63666A"><span> ${product}</span></span></div>
        <div style="font-size:14px;color:#000000;margin-bottom:25px;"><b>Location Used:</b> <span style="color:#63666A"><span> ${location}</span></span></div>
        <div style="font-size:14px;color:#63666A;margin-bottom:7px;">Thanks for trusting us to help keep your car running smoothly.</div>
        <div style="font-size:14px;color:#000000;font-weight:600;">We appreciate your business.</div>
      </div>
    ${getEmailFooter()}
  `;
  return wrapEmailHtml(inner);
}

function getGiftCardRedeemEmail({giftCardCode, amountUsed, remainingBalance, location}) {
  const inner = `
    ${getEmailHeader()}
      <div style="margin-bottom:32px;">
        <h2 style="color:#8a232c;font-size:26px;font-weight:600;margin:0 0 10px 0;"><span style="color:#862633;">Thank you </span><span style='color:#000000'> for choosing Jiffy Lube!</span></h2>
        <div style="font-size:18px;color:#000000;margin-bottom:24px;">We noticed you recently used your gift card.</div>
        <div style="font-size:16px;color:#000000;margin-bottom:10px;"><b>Gift Card #:</b> <span style="color:#63666A"><span> ${giftCardCode}</span></span></div>
        <div style="font-size:16px;color:#000000;margin-bottom:10px;"><b>Amount Used:</b> <span style="color:#63666A"><span> $${amountUsed}</span></span></div>
        <div style="font-size:16px;color:#000000;margin-bottom:10px;"><b>Remaining Balance:</b> <span style="color:#63666A"><span> $${remainingBalance}</span></span></div>
        <div style="font-size:16px;color:#000000;margin-bottom:25px;"><b>Location Used:</b> <span style="color:#63666A"><span> ${location}</span></span></div>
        <div style="font-size:15px;color:#63666A;margin-bottom:7px;">Thanks for trusting us to help keep your car running smoothly.</div>
        <div style="font-size:15px;color:#000000;font-weight:600;">We appreciate your business.</div>
      </div>
    ${getEmailFooter()}
  `;
  return wrapEmailHtml(inner);
}

export async function sendVoucherRedeemEmail({ to, code, location, productTitle }) {
  const mailOptions = {
    from: `Jiffy Lube Specials <${smtpUser}>`,
    to,
    subject: 'Voucher Redeemed Notification',
    html: getVoucherRedeemEmail({voucherCode: code, product: productTitle, location}),
  };
  return transporter.sendMail(mailOptions);
}

export async function sendGiftCardRedeemEmail({ to, giftCardCode, amountUsed, remainingBalance, location }) {
  const mailOptions = {
    from: `Jiffy Lube Specials <${smtpUser}>`,
    to,
    subject: 'Gift Card Redeemed Notification',
    html: getGiftCardRedeemEmail({giftCardCode, amountUsed, remainingBalance, location}),
  };
  return transporter.sendMail(mailOptions);
}
