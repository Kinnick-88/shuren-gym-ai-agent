"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function AdminLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (loginError) {
      setError(loginError.message);
      return;
    }

    router.replace("/admin");
    router.refresh();
  }

  return (
    <form className="grid gap-4" onSubmit={handleSubmit}>
      <label className="field">
        <span className="label">管理员邮箱</span>
        <input className="input" onChange={(event) => setEmail(event.target.value)} required type="email" value={email} />
      </label>
      <label className="field">
        <span className="label">密码</span>
        <input className="input" onChange={(event) => setPassword(event.target.value)} required type="password" value={password} />
      </label>
      {error ? <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
      <button className="btn-primary" disabled={loading} type="submit">
        {loading ? "登录中..." : "登录后台"}
      </button>
    </form>
  );
}
