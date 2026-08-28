"use client";

import { useState } from "react";

type FormState = {
  status: "idle" | "submitting" | "success" | "error";
  message?: string;
};

interface ContactFormProps {
  /** 来自产品详情页的询盘来源（/contact?product=<slug>） */
  product?: string;
}

/**
 * 联系表单：提交到 /api/inquiries（服务端写入 Supabase inquiries 表）。
 */
export default function ContactForm({ product }: ContactFormProps) {
  const [state, setState] = useState<FormState>({ status: "idle" });

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);

    setState({ status: "submitting" });

    try {
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.get("name"),
          email: data.get("email"),
          phone: data.get("phone"),
          message: data.get("message"),
          product: data.get("product") ?? product,
        }),
      });

      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? "Submission failed");

      form.reset();
      setState({ status: "success", message: body.message });
    } catch (err) {
      setState({
        status: "error",
        message:
          err instanceof Error ? err.message : "Something went wrong. Please try again.",
      });
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-10" noValidate={false}>
      {product ? (
        <input type="hidden" name="product" value={product} />
      ) : null}

      <div className="grid gap-10 md:grid-cols-2">
        <div>
          <label htmlFor="name" className="text-[11px] uppercase tracking-[0.22em] text-ink-400">
            Name *
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            autoComplete="name"
            className="input-field mt-2"
            placeholder="Your full name"
          />
        </div>
        <div>
          <label htmlFor="email" className="text-[11px] uppercase tracking-[0.22em] text-ink-400">
            Email *
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className="input-field mt-2"
            placeholder="you@company.com"
          />
        </div>
      </div>

      <div>
        <label htmlFor="phone" className="text-[11px] uppercase tracking-[0.22em] text-ink-400">
          Tel
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          autoComplete="tel"
          className="input-field mt-2"
          placeholder="+84 90 000 0000"
        />
      </div>

      <div>
        <label htmlFor="message" className="text-[11px] uppercase tracking-[0.22em] text-ink-400">
          Message *
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={5}
          className="input-field mt-2 resize-none"
          placeholder="Tell us about your program — product type, estimated quantity, target market..."
        />
      </div>

      <div className="flex flex-col items-start gap-4">
        <button
          type="submit"
          disabled={state.status === "submitting"}
          className="btn-primary disabled:cursor-not-allowed disabled:opacity-60"
        >
          {state.status === "submitting" ? "Sending..." : "Send Inquiry"}
        </button>

        {state.status === "success" ? (
          <p className="text-sm font-medium text-forest-600">{state.message}</p>
        ) : null}
        {state.status === "error" ? (
          <p className="text-sm font-medium text-red-600">{state.message}</p>
        ) : null}
      </div>
    </form>
  );
}
