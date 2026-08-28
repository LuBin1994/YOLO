import nodemailer from "nodemailer";

/** 站点信息（用于邮件署名与回复地址） */
const SITE_NAME = "Meridian Apparel Group";
const SITE_EMAIL = "sales@meridianapparel.com";

/**
 * SMTP 发信配置（QQ 邮箱）：
 * - SMTP_HOST: smtp.qq.com
 * - SMTP_PORT: 465（SSL）
 * - SMTP_USER: 你的 QQ 邮箱地址
 * - SMTP_PASS: QQ 邮箱「授权码」（不是登录密码！）
 */
const SMTP_HOST = process.env.SMTP_HOST || "smtp.qq.com";
const SMTP_PORT = Number(process.env.SMTP_PORT || 465);
const SMTP_USER = process.env.SMTP_USER || "";
const SMTP_PASS = process.env.SMTP_PASS || "";

/** 是否已配置可用 SMTP（避免用空值/占位符去发信报错） */
function smtpReady(): boolean {
  return Boolean(
    SMTP_USER &&
      SMTP_PASS &&
      SMTP_USER.length > 0 &&
      SMTP_PASS.length > 0 &&
      SMTP_USER !== "your-qq@qq.com" &&
      SMTP_PASS !== "your-qq-authorization-code"
  );
}

/**
 * 发送询盘自动回复（英文、正式措辞）到客户邮箱。
 * @param to   客户填写的邮箱
 * @param name 客户姓名
 */
export async function sendInquiryAck(to: string, name: string): Promise<void> {
  if (!smtpReady()) {
    console.warn(
      "[email] SMTP 未配置（SMTP_USER/SMTP_PASS 为空或占位符），跳过确认邮件发送。"
    );
    return;
  }

  const displayName = name.trim() || "there";

  const html = [
    `<!DOCTYPE html>`,
    `<html lang="en"><body style="margin:0;padding:0;background-color:#f4f2ec;font-family:Helvetica,Arial,sans-serif;color:#141a16;">`,
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f2ec;padding:40px 16px;">`,
    `<tr><td align="center">`,
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background-color:#ffffff;border-radius:8px;overflow:hidden;">`,
    `<tr><td style="background-color:#16302a;padding:28px 32px;">`,
    `<h1 style="margin:0;font-size:20px;font-weight:600;color:#faf9f6;">${SITE_NAME}</h1>`,
    `<p style="margin:4px 0 0;font-size:12px;letter-spacing:2px;color:#a8c686;">Apparel Manufacturing in Southeast Asia</p>`,
    `</td></tr>`,
    `<tr><td style="padding:36px 32px;">`,
    `<p style="margin:0 0 20px;font-size:16px;line-height:1.6;">Dear ${escapeHtml(displayName)},</p>`,
    `<p style="margin:0 0 20px;font-size:16px;line-height:1.6;">Thank you for contacting ${SITE_NAME}. We have received your message and appreciate your interest in our manufacturing services.</p>`,
    `<p style="margin:0 0 20px;font-size:16px;line-height:1.6;">Our export sales team is currently reviewing your inquiry. We will get back to you as soon as possible, and in most cases within 24 hours on business days.</p>`,
    `<p style="margin:0 0 24px;font-size:16px;line-height:1.6;">Should you have any further questions in the meantime, please do not hesitate to reach out to us.</p>`,
    `<p style="margin:0 0 4px;font-size:16px;line-height:1.6;">Best regards,</p>`,
    `<p style="margin:0;font-size:16px;font-weight:600;">${SITE_NAME} Team</p>`,
    `<p style="margin:4px 0 0;font-size:14px;color:#4a554e;">${SITE_EMAIL}</p>`,
    `</td></tr>`,
    `<tr><td style="background-color:#f4f2ec;padding:18px 32px;">`,
    `<p style="margin:0;font-size:12px;color:#7d877f;">This is an automated confirmation. Please do not reply to this email.</p>`,
    `</td></tr>`,
    `</table>`,
    `</td></tr></table>`,
    `</body></html>`,
  ].join("");

  const text = [
    `Dear ${displayName},`,
    ``,
    `Thank you for contacting ${SITE_NAME}. We have received your message and appreciate your interest in our manufacturing services.`,
    ``,
    `Our export sales team is currently reviewing your inquiry. We will get back to you as soon as possible, and in most cases within 24 hours on business days.`,
    ``,
    `Should you have any further questions in the meantime, please do not hesitate to reach out to us.`,
    ``,
    `Best regards,`,
    `${SITE_NAME} Team`,
    `${SITE_EMAIL}`,
  ].join("\n");

  try {
    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_PORT === 465, // 465 用 SSL，587 用 STARTTLS
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: `${SITE_NAME} <${SMTP_USER}>`,
      to,
      subject: "We have received your inquiry",
      text,
      html,
    });

    console.log(`[email] Confirmation email sent to ${to}`);
  } catch (err) {
    console.error("[email] Failed to send confirmation email:", err);
  }
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
