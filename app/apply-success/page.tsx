import Link from "next/link";

export default function ApplySuccessPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-campus-mist px-4">
      <div className="card max-w-lg p-8 text-center">
        <h1 className="text-2xl font-bold text-slate-950">会员申请已提交</h1>
        <p className="mt-3 text-slate-600">管理员审核通过后会生成会员开始日期和到期日期。</p>
        <Link className="btn-primary mt-6" href="/">
          返回首页
        </Link>
      </div>
    </main>
  );
}
