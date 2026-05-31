import Link from "next/link";

export default function FeedbackSuccessPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-campus-mist px-4">
      <div className="card max-w-lg p-8 text-center">
        <h1 className="text-2xl font-bold text-slate-950">反馈已提交</h1>
        <p className="mt-3 text-slate-600">感谢你的反馈，管理员会在后台查看并处理。</p>
        <Link className="btn-primary mt-6" href="/">
          返回首页
        </Link>
      </div>
    </main>
  );
}
