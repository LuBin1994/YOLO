import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * POST /api/inquiries
 * 前台联系表单提交入口：服务端写入 Supabase inquiries 表。
 * RLS 允许匿名插入，此处仍做基础校验与限流兜底。
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  try {
    const body = await request.json();

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
    if (name.length > 120 || message.length > 5000) {
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

    return NextResponse.json(
      { message: "Thank you. Our team will get back to you within 24 hours." },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { error: "Invalid request." },
      { status: 400 }
    );
  }
}
