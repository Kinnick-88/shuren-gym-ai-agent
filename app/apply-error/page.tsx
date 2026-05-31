import Link from "next/link";

export default function ApplyErrorPage({
  searchParams,
}: {
  searchParams: { message?: string };
}) {
  const message = searchParams.message || "会员申请提交失败，请检查信息后重新提交。";

  return (
    <main className="grid min-h-screen place-items-center bg-campus-mist px-4">
      <div className="card max-w-lg p-8 text-center">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-campus-gold">Submit Failed</p>
        <h1 className="mt-3 text-2xl font-bold text-slate-950">会员申请提交失败</h1>
        <p className="mt-4 rounded-lg bg-red-50 p-4 text-left text-sm leading-6 text-red-700">{message}</p>
        <Link className="btn-primary mt-6" href="/">
          返回重新提交
        </Link>
      </div>
    </main>
  );
}
