import { redirect } from "next/navigation";
import { AdminLoginForm } from "@/components/AdminLoginForm";
import { getAdmin } from "@/lib/admin";

export default async function AdminLoginPage() {
  const admin = await getAdmin();
  if (admin) {
    redirect("/admin");
  }

  return (
    <main className="grid min-h-screen place-items-center bg-campus-mist px-4">
      <section className="card w-full max-w-md p-7">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-forest-600">Admin</p>
        <h1 className="mt-2 text-2xl font-bold text-slate-950">管理员登录</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          只有 Supabase Auth 已登录且邮箱存在于 admin_users 表中的用户可以进入后台。
        </p>
        <div className="mt-6">
          <AdminLoginForm />
        </div>
      </section>
    </main>
  );
}
