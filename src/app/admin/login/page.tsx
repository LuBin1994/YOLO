"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { createClient } from "@/lib/supabase/client";

/**
 * 后台登录页：Supabase Auth 邮箱/密码登录。
 * 位于 admin/ 下但不继承 (protected) 守卫。
 */
function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(
    searchParams.get("error") === "unauthorized"
      ? "该账号未获后台访问授权。"
      : null
  );
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      setError(
        error.message === "Invalid login credentials"
          ? "邮箱或密码错误。"
          : error.message
      );
      setSubmitting(false);
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label
          htmlFor="email"
          className="text-[11px] uppercase tracking-[0.22em] text-ink-400"
        >
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="input-field mt-2"
          placeholder="admin@yourcompany.com"
        />
      </div>

      <div>
        <label
          htmlFor="password"
          className="text-[11px] uppercase tracking-[0.22em] text-ink-400"
        >
          密码
        </label>
        <input
          id="password"
          type="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="input-field mt-2"
          placeholder="••••••••"
        />
      </div>

      {error ? (
        <p className="text-sm font-medium text-red-600">{error}</p>
      ) : null}

      <button
        type="submit"
        disabled={submitting}
        className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? "登录中..." : "登录"}
      </button>
    </form>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* 品牌区 */}
      <div className="relative hidden overflow-hidden bg-forest-950 lg:block">
        <Image
          src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1600&q=80"
          alt="Factory"
          fill
          priority
          sizes="50vw"
          className="object-cover opacity-50"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-forest-950 via-transparent to-transparent" />
        <div className="relative z-10 flex h-full flex-col justify-end p-12">
          <p className="text-[11px] uppercase tracking-[0.3em] text-sand-200/80">
            管理后台
          </p>
          <p className="display-lg mt-4 text-sand-50">
            Meridian Apparel Group
          </p>
        </div>
      </div>

      {/* 表单区 */}
      <div className="flex items-center justify-center bg-sand-50 px-6 py-16">
        <div className="w-full max-w-sm">
          <Link
            href="/"
            className="text-xs tracking-wide text-ink-400 transition-colors hover:text-forest-700"
          >
            ← 返回官网
          </Link>
          <h1 className="mt-8 text-3xl font-semibold tracking-tight">
            登录管理后台
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-ink-600">
            仅限授权管理员。管理产品、内容、询盘与访客数据。
          </p>

          <div className="mt-10">
            <Suspense fallback={null}>
              <LoginForm />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}
