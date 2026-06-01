import Link from "next/link";
import { Check, Download, Eye, LogOut, Save, X } from "lucide-react";
import { reviewMemberApplication, signOutAdmin, updateApprovedMember } from "@/app/actions";
import { requireAdmin } from "@/lib/admin";
import { createClient } from "@/lib/supabase/server";
import { dateText } from "@/lib/csv";
import { PAYMENT_METHODS, PLANS, type Feedback, type Member, type MemberStatus, type PaymentMethod, type Plan } from "@/lib/types";

export const dynamic = "force-dynamic";

const statusLabel: Record<MemberStatus, string> = {
  pending: "待审核",
  approved: "已通过",
  rejected: "已拒绝",
};

export default async function AdminPage() {
  const { user } = await requireAdmin();
  const supabase = createClient();

  const [{ data: members }, { data: feedbacks }] = await Promise.all([
    supabase.from("members").select("*").order("created_at", { ascending: false }),
    supabase.from("feedbacks").select("*").order("created_at", { ascending: false }),
  ]);

  const memberRows = (members || []) as Member[];
  const feedbackRows = (feedbacks || []) as Feedback[];
  const approvedMembers = memberRows.filter((member) => member.status === "approved");
  const pendingMembers = memberRows.filter((member) => member.status === "pending");
  const projectedIncome = memberRows
    .filter((member) => member.status !== "rejected")
    .reduce((sum, member) => sum + Number(member.amount || 0), 0);

  const screenshotUrls = await createScreenshotMap(memberRows);

  return (
    <main className="min-h-screen bg-campus-mist">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-forest-600">Admin Dashboard</p>
            <h1 className="mt-1 text-2xl font-bold text-slate-950">树人健身房会员后台</h1>
            <p className="mt-1 text-sm text-slate-500">{user.email}</p>
          </div>
          <form action={signOutAdmin}>
            <button className="btn-secondary gap-2" type="submit">
              <LogOut className="h-4 w-4" />
              退出登录
            </button>
          </form>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:px-8">
        <section className="grid gap-4 md:grid-cols-4">
          <StatCard label="会员总数" value={approvedMembers.length} />
          <StatCard label="待审核人数" value={pendingMembers.length} />
          <StatCard label="反馈条数" value={feedbackRows.length} />
          <StatCard label="预计收入" value={`¥${projectedIncome.toLocaleString("zh-CN")}`} />
        </section>

        <section className="card overflow-hidden">
          <div className="flex flex-col gap-3 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-950">会员申请列表</h2>
              <p className="mt-1 text-sm text-slate-500">管理员可以查看付款截图，并审核通过或拒绝。</p>
            </div>
            <Link className="btn-secondary gap-2" href="/admin/export/members">
              <Download className="h-4 w-4" />
              导出会员 CSV
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-[1180px] w-full border-collapse text-left text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-4 py-3">提交时间</th>
                  <th className="px-4 py-3">姓名</th>
                  <th className="px-4 py-3">学号</th>
                  <th className="px-4 py-3">专业班级</th>
                  <th className="px-4 py-3">手机</th>
                  <th className="px-4 py-3">套餐</th>
                  <th className="px-4 py-3">付款</th>
                  <th className="px-4 py-3">截图</th>
                  <th className="px-4 py-3">状态</th>
                  <th className="px-4 py-3">有效期</th>
                  <th className="px-4 py-3">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {memberRows.map((member) => (
                  <tr key={member.id} className="align-top">
                    <td className="px-4 py-3">{dateText(member.created_at)}</td>
                    <td className="px-4 py-3 font-semibold">{member.name}</td>
                    <td className="px-4 py-3">{member.student_id}</td>
                    <td className="px-4 py-3">{member.major_class}</td>
                    <td className="px-4 py-3">{member.phone}</td>
                    <td className="px-4 py-3">{PLANS[member.plan as Plan]?.label || member.plan} ¥{member.amount}</td>
                    <td className="px-4 py-3">{PAYMENT_METHODS[member.payment_method as PaymentMethod] || member.payment_method}</td>
                    <td className="px-4 py-3">
                      {screenshotUrls.get(member.id) ? (
                        <a className="inline-flex items-center gap-1 font-semibold text-forest-700" href={screenshotUrls.get(member.id)} rel="noreferrer" target="_blank">
                          <Eye className="h-4 w-4" />
                          查看
                        </a>
                      ) : (
                        <span className="text-slate-400">无</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                        {statusLabel[member.status] || member.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {member.start_date && member.end_date ? `${member.start_date} 至 ${member.end_date}` : "-"}
                    </td>
                    <td className="px-4 py-3">
                      {member.status === "pending" ? (
                        <div className="flex gap-2">
                          <form action={reviewMemberApplication.bind(null, member.id, "approved")}>
                            <button className="btn-secondary gap-1 text-forest-700" type="submit">
                              <Check className="h-4 w-4" />
                              通过
                            </button>
                          </form>
                          <form action={reviewMemberApplication.bind(null, member.id, "rejected")}>
                            <button className="btn-secondary gap-1 text-red-600" type="submit">
                              <X className="h-4 w-4" />
                              拒绝
                            </button>
                          </form>
                        </div>
                      ) : (
                        <span className="text-slate-400">已处理</span>
                      )}
                    </td>
                  </tr>
                ))}
                {!memberRows.length ? (
                  <tr>
                    <td className="px-4 py-8 text-center text-slate-500" colSpan={11}>暂无会员申请</td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </section>

        <section className="card overflow-hidden">
          <div className="border-b border-slate-200 p-5">
            <h2 className="text-xl font-bold text-slate-950">会员状态表</h2>
            <p className="mt-1 text-sm text-slate-500">
              审核通过的会员会同步显示在这里，可直接修改学号、专业班级、姓名、套餐、电话、开卡日期和到期日期。
            </p>
          </div>
          <div className="grid gap-4 p-5">
            {approvedMembers.map((member) => (
              <form
                action={updateApprovedMember.bind(null, member.id)}
                className="grid gap-3 rounded border border-slate-200 bg-white p-4 lg:grid-cols-[1fr_1fr_1.2fr_1fr_0.8fr_1fr_1fr_auto]"
                key={member.id}
              >
                <Field label="姓名" name="name" defaultValue={member.name} />
                <Field label="学号" name="student_id" defaultValue={member.student_id} />
                <Field label="专业班级" name="major_class" defaultValue={member.major_class} />
                <Field label="电话" name="phone" defaultValue={member.phone} />
                <label className="grid gap-1 text-xs font-semibold text-slate-500">
                  套餐
                  <select
                    className="h-10 rounded border border-slate-200 bg-white px-3 text-sm font-medium text-slate-900 outline-none focus:border-forest-500"
                    defaultValue={member.plan}
                    name="plan"
                  >
                    {Object.entries(PLANS).map(([value, plan]) => (
                      <option key={value} value={value}>
                        {plan.label} ¥{plan.amount}
                      </option>
                    ))}
                  </select>
                </label>
                <Field label="开卡日期" name="start_date" type="date" defaultValue={member.start_date || ""} />
                <Field label="到期日期" name="end_date" type="date" defaultValue={member.end_date || ""} />
                <div className="flex items-end">
                  <button className="btn-secondary h-10 w-full justify-center gap-2 text-forest-700" type="submit">
                    <Save className="h-4 w-4" />
                    保存
                  </button>
                </div>
              </form>
            ))}
            {!approvedMembers.length ? (
              <p className="rounded border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
                暂无已通过会员。审核通过后会自动显示在这里。
              </p>
            ) : null}
          </div>
        </section>

        <section className="card overflow-hidden">
          <div className="flex flex-col gap-3 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-950">反馈意见列表</h2>
              <p className="mt-1 text-sm text-slate-500">普通用户只能提交反馈，不能读取列表。</p>
            </div>
            <Link className="btn-secondary gap-2" href="/admin/export/feedbacks">
              <Download className="h-4 w-4" />
              导出反馈 CSV
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-[920px] w-full border-collapse text-left text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-4 py-3">提交时间</th>
                  <th className="px-4 py-3">姓名</th>
                  <th className="px-4 py-3">电话</th>
                  <th className="px-4 py-3">类型</th>
                  <th className="px-4 py-3">满意度</th>
                  <th className="px-4 py-3">内容</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {feedbackRows.map((feedback) => (
                  <tr key={feedback.id}>
                    <td className="px-4 py-3">{dateText(feedback.created_at)}</td>
                    <td className="px-4 py-3 font-semibold">{feedback.name}</td>
                    <td className="px-4 py-3">{feedback.phone || "-"}</td>
                    <td className="px-4 py-3">{feedback.type}</td>
                    <td className="px-4 py-3">{feedback.satisfaction}</td>
                    <td className="max-w-xl px-4 py-3 leading-6">{feedback.content}</td>
                  </tr>
                ))}
                {!feedbackRows.length ? (
                  <tr>
                    <td className="px-4 py-8 text-center text-slate-500" colSpan={6}>暂无反馈</td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}

function Field({
  label,
  name,
  defaultValue,
  type = "text",
}: {
  label: string;
  name: string;
  defaultValue: string;
  type?: string;
}) {
  return (
    <label className="grid gap-1 text-xs font-semibold text-slate-500">
      {label}
      <input
        className="h-10 rounded border border-slate-200 px-3 text-sm font-medium text-slate-900 outline-none focus:border-forest-500"
        defaultValue={defaultValue}
        name={name}
        required
        type={type}
      />
    </label>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="card p-5">
      <p className="text-sm font-semibold text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-bold text-slate-950">{value}</p>
    </div>
  );
}

async function createScreenshotMap(members: Member[]) {
  const supabase = createClient();
  const map = new Map<string, string>();

  await Promise.all(
    members.map(async (member) => {
      if (!member.payment_screenshot_url) return;
      const { data } = await supabase.storage
        .from("payment-screenshots")
        .createSignedUrl(member.payment_screenshot_url, 60 * 10);
      if (data?.signedUrl) {
        map.set(member.id, data.signedUrl);
      }
    }),
  );

  return map;
}
