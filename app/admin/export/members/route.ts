import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { createClient } from "@/lib/supabase/server";
import { dateText, toCsv } from "@/lib/csv";
import { PAYMENT_METHODS, PLANS, type Member, type PaymentMethod, type Plan } from "@/lib/types";

export async function GET() {
  await requireAdmin();
  const supabase = createClient();
  const { data, error } = await supabase.from("members").select("*").order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const approvedMembers = ((data || []) as Member[]).filter((member) => member.status === "approved");
  const totalIncome = approvedMembers.reduce((sum, member) => sum + Number(member.amount || 0), 0);

  const rows = approvedMembers.map((member) => ({
    提交时间: dateText(member.created_at),
    姓名: member.name,
    学号: member.student_id,
    专业班级: member.major_class,
    手机号: member.phone,
    套餐: PLANS[member.plan as Plan]?.label || member.plan,
    金额: member.amount,
    付款方式: PAYMENT_METHODS[member.payment_method as PaymentMethod] || member.payment_method,
    状态: member.status,
    开始日期: member.start_date,
    到期日期: member.end_date,
    备注: member.remark,
  }));

  rows.push({
    提交时间: "",
    姓名: "预计总收入",
    学号: "",
    专业班级: "",
    手机号: "",
    套餐: "",
    金额: totalIncome,
    付款方式: "",
    状态: "已通过会员合计",
    开始日期: "",
    到期日期: "",
    备注: "",
  });

  return new NextResponse(toCsv(rows), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="members-${Date.now()}.csv"`,
    },
  });
}

