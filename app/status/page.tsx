import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { dateText } from "@/lib/csv";
import { PLANS, type MemberStatus, type Plan } from "@/lib/types";

const statusText: Record<MemberStatus, string> = {
  pending: "待审核",
  approved: "已通过",
  rejected: "已拒绝",
};

type LookupRow = {
  name: string;
  student_id: string;
  major_class: string;
  phone: string;
  plan: Plan;
  amount: number;
  status: MemberStatus;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
};

export default async function StatusPage({
  searchParams,
}: {
  searchParams: { student_id?: string; phone?: string };
}) {
  const studentId = searchParams.student_id?.trim() || "";
  const phone = searchParams.phone?.trim() || "";
  let rows: LookupRow[] = [];
  let searched = false;

  if (studentId && phone) {
    searched = true;
    const supabase = createClient();
    const { data } = await supabase.rpc("lookup_my_membership", {
      p_student_id: studentId,
      p_phone: phone,
    });
    rows = (data || []) as LookupRow[];
  }

  return (
    <main className="min-h-screen bg-campus-mist px-4 py-8">
      <section className="mx-auto max-w-3xl">
        <Link className="text-sm font-semibold text-forest-700" href="/">
          返回首页
        </Link>
        <div className="card mt-4 p-6">
          <h1 className="text-2xl font-bold text-slate-950">查询我的会员申请</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            输入学号和手机号，仅返回与你填写信息匹配的申请记录。
          </p>
          <form className="mt-6 grid gap-4 sm:grid-cols-[1fr_1fr_auto]" method="get">
            <label className="field">
              <span className="label">学号</span>
              <input className="input" defaultValue={studentId} name="student_id" required />
            </label>
            <label className="field">
              <span className="label">手机号</span>
              <input className="input" defaultValue={phone} name="phone" required type="tel" />
            </label>
            <div className="flex items-end">
              <button className="btn-primary w-full" type="submit">
                查询
              </button>
            </div>
          </form>
        </div>

        {searched ? (
          <div className="mt-5 grid gap-4">
            {rows.length ? (
              rows.map((row) => (
                <article className="card p-5" key={`${row.student_id}-${row.created_at}`}>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h2 className="text-lg font-bold text-slate-950">{row.name}</h2>
                      <p className="mt-1 text-sm text-slate-500">
                        {row.major_class} / {row.student_id}
                      </p>
                    </div>
                    <span className="w-fit rounded-full bg-forest-50 px-3 py-1 text-sm font-semibold text-forest-700">
                      {statusText[row.status] || row.status}
                    </span>
                  </div>
                  <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                    <Info label="套餐" value={`${PLANS[row.plan]?.label || row.plan} ¥${row.amount}`} />
                    <Info label="提交时间" value={dateText(row.created_at)} />
                    <Info label="开始日期" value={row.start_date || "审核通过后生成"} />
                    <Info label="到期日期" value={row.end_date || "审核通过后生成"} />
                  </dl>
                </article>
              ))
            ) : (
              <div className="card p-5 text-slate-600">没有找到匹配的申请记录。</div>
            )}
          </div>
        ) : null}
      </section>
    </main>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="font-semibold text-slate-500">{label}</dt>
      <dd className="mt-1 text-slate-950">{value}</dd>
    </div>
  );
}
