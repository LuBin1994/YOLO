import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendInquiryAck } from "@/lib/email";
import { clientIp, rateLimit } from "@/lib/rate-limit";

/**
 * POST /api/inquiries
 * 前台联系表单提交入口：服务端写入 Supabase inquiries 表。
 * RLS 允许匿名插入，此处做四层防护：
 *   1) IP 限流（挡脚本刷库 + 打爆 SMTP 日发信限额）
 *   2) honeypot 蜜罐字段（机器人填了就静默丢弃）
 *   3) 最小填写耗时（机器人秒提交直接丢弃）
 *   4) 字段与长度校验
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** 同一 IP 每 60 秒最多 5 次提交 */
const RATE_LIMIT = 5;
const RATE_WINDOW_MS = 60_000;

/** 表单渲染到提交的最小间隔（毫秒），低于此值判定为机器人 */
const MIN_FILL_MS = 2_000;

const OK_MESSAGE =
  "Thank you. Our team will get back to you within 24 hours.";

/** 机器人命中时返回成功文案但不落库，避免给攻击者反馈信号 */
function silentSuccess() {
  return NextResponse.json({ message: OK_MESSAGE }, { status: 201 });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // ---- 1) 限流 ----
    const limited = rateLimit(`inquiry:${clientIp(request)}`, RATE_LIMIT, RATE_WINDOW_MS);
    if (!limited.ok) {
      return NextResponse.json(
        { error: "Too many submissions. Please try again later." },
        { status: 429, headers: { "Retry-After": String(limited.retryAfter) } }
      );
    }

    // ---- 2) honeypot：正常用户看不到也不会填 ----
    if (String(body.website ?? "").trim()) return silentSuccess();

    // ---- 3) 最小填写耗时 ----
    const elapsed = Number(body.elapsed);
    if (!Number.isFinite(elapsed) || elapsed < MIN_FILL_MS) return silentSuccess();

    const name = String(body.name ?? "").trim();
    const email = String(body.email ?? "").trim().toLowerCase();
    const phone = String(body.phone ?? "").trim();
    const message = String(body.message ?? "").trim();
    const product = String(body.product ?? "").trim().slice(0, 120);

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Name, email and message are required." },
        { status: 400 }
      );
    }
    if (name.length > 120 || message.length > 5000 || phone.length > 60) {
      return NextResponse.json({ error: "Input too long." }, { status: 400 });
    }
    if (!EMAIL_RE.test(email)) {
      return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
    }

    const finalMessage = product
      ? `[Inquiry about: ${product}]\n${message}`
      : message;

    const supabase = await createClient();
    const { error } = await supabase.from("inquiries").insert({
      name,
      email,
      phone: phone || null,
      message: finalMessage,
      status: "new",
      source: "contact-form",
    });

    if (error) {
      console.error("[inquiries] insert failed:", error.message);
      return NextResponse.json(
        { error: "Failed to save your inquiry. Please try again." },
        { status: 500 }
      );
    }

    // 提交成功后向客户发送英文确认邮件（发送失败不阻塞表单成功返回）
    await sendInquiryAck(email, name);

    return NextResponse.json({ message: OK_MESSAGE }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Invalid request." },
      { status: 400 }
    );
  }
}
