"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PAYMENT_METHODS, PLANS, type MemberStatus, type PaymentMethod, type Plan } from "@/lib/types";
import { requireAdmin } from "@/lib/admin";

function readRequired(formData: FormData, key: string) {
  const value = String(formData.get(key) || "").trim();
  if (!value) {
    throw new Error(`${key} is required`);
  }
  return value;
}

function assertPlan(value: string): asserts value is Plan {
  if (!Object.keys(PLANS).includes(value)) {
    throw new Error("套餐类型无效");
  }
}

function assertPaymentMethod(value: string): asserts value is PaymentMethod {
  if (!Object.keys(PAYMENT_METHODS).includes(value)) {
    throw new Error("付款方式无效");
  }
}

export async function submitMemberApplication(formData: FormData) {
  const supabase = createClient();

  const name = readRequired(formData, "name");
  const studentId = readRequired(formData, "student_id");
  const majorClass = readRequired(formData, "major_class");
  const phone = readRequired(formData, "phone");
  const planValue = readRequired(formData, "plan");
  const paymentValue = readRequired(formData, "payment_method");
  const remark = String(formData.get("remark") || "").trim();
  const screenshot = formData.get("payment_screenshot");

  assertPlan(planValue);
  assertPaymentMethod(paymentValue);

  if (!(screenshot instanceof File) || screenshot.size === 0) {
    throw new Error("请上传付款截图");
  }

  if (!screenshot.type.startsWith("image/")) {
    throw new Error("付款截图必须是图片文件");
  }

  if (screenshot.size > 5 * 1024 * 1024) {
    throw new Error("付款截图不能超过 5MB");
  }

  const extension = screenshot.name.split(".").pop() || "png";
  const objectPath = `${studentId}/${Date.now()}-${crypto.randomUUID()}.${extension}`;

  const { error: uploadError } = await supabase.storage
    .from("payment-screenshots")
    .upload(objectPath, screenshot, {
      contentType: screenshot.type,
      upsert: false,
    });

  if (uploadError) {
    throw new Error(uploadError.message);
  }

  const plan = PLANS[planValue];
  const { error } = await supabase.from("members").insert({
    name,
    student_id: studentId,
    major_class: majorClass,
    phone,
    plan: planValue,
    amount: plan.amount,
    payment_method: paymentValue,
    payment_screenshot_url: objectPath,
    status: "pending",
    remark,
  });

  if (error) {
    throw new Error(error.message);
  }

  redirect("/apply-success");
}

export async function submitFeedback(formData: FormData) {
  const supabase = createClient();

  const { error } = await supabase.from("feedbacks").insert({
    name: readRequired(formData, "feedback_name"),
    phone: String(formData.get("feedback_phone") || "").trim(),
    type: readRequired(formData, "feedback_type"),
    satisfaction: Number(readRequired(formData, "satisfaction")),
    content: readRequired(formData, "content"),
  });

  if (error) {
    throw new Error(error.message);
  }

  redirect("/feedback-success");
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next.toISOString().slice(0, 10);
}

export async function reviewMemberApplication(memberId: string, status: MemberStatus) {
  await requireAdmin();

  if (!["approved", "rejected"].includes(status)) {
    throw new Error("审核状态无效");
  }

  const supabase = createClient();
  const { data: member, error: memberError } = await supabase
    .from("members")
    .select("id,plan")
    .eq("id", memberId)
    .single();

  if (memberError || !member) {
    throw new Error(memberError?.message || "会员申请不存在");
  }

  const payload: Record<string, string | null> = { status };
  if (status === "approved") {
    const today = new Date();
    const plan = member.plan as Plan;
    payload.start_date = today.toISOString().slice(0, 10);
    payload.end_date = addDays(today, PLANS[plan].days);
  } else {
    payload.start_date = null;
    payload.end_date = null;
  }

  const { error } = await supabase.from("members").update(payload).eq("id", memberId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin");
}

export async function signOutAdmin() {
  const supabase = createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}
