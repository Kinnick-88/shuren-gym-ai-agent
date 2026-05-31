import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { createClient } from "@/lib/supabase/server";
import { dateText, toCsv } from "@/lib/csv";
import type { Feedback } from "@/lib/types";

export async function GET() {
  await requireAdmin();
  const supabase = createClient();
  const { data, error } = await supabase.from("feedbacks").select("*").order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const rows = ((data || []) as Feedback[]).map((feedback) => ({
    提交时间: dateText(feedback.created_at),
    姓名: feedback.name,
    电话: feedback.phone,
    类型: feedback.type,
    满意度: feedback.satisfaction,
    内容: feedback.content,
  }));

  return new NextResponse(toCsv(rows), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="feedbacks-${Date.now()}.csv"`,
    },
  });
}
