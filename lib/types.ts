export type Plan = "month" | "year";
export type PaymentMethod = "wechat" | "alipay";
export type MemberStatus = "pending" | "approved" | "rejected";

export const PLANS: Record<Plan, { label: string; amount: number; days: number }> = {
  month: { label: "月卡", amount: 200, days: 30 },
  year: { label: "年卡", amount: 365, days: 365 },
};

export const PAYMENT_METHODS: Record<PaymentMethod, string> = {
  wechat: "微信",
  alipay: "支付宝",
};

export type Member = {
  id: string;
  name: string;
  student_id: string;
  major_class: string;
  phone: string;
  plan: Plan;
  amount: number;
  payment_method: PaymentMethod;
  payment_screenshot_url: string | null;
  status: MemberStatus;
  remark: string | null;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
};

export type Feedback = {
  id: string;
  name: string;
  phone: string | null;
  type: string;
  satisfaction: number;
  content: string;
  created_at: string;
};
