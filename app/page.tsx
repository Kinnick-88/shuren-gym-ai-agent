import { BadgeAlert, Clock, MapPin, Phone, ShieldCheck, Sparkles } from "lucide-react";
import { submitFeedback, submitMemberApplication } from "@/app/actions";
import { SectionTitle } from "@/components/SectionTitle";
import { SubmitButton } from "@/components/SubmitButton";
import { PLANS } from "@/lib/types";

const wechatQr = process.env.NEXT_PUBLIC_WECHAT_QR_URL || "/wechat-qr.png";
const alipayQr = process.env.NEXT_PUBLIC_ALIPAY_QR_URL || "/alipay-qr.png";

export default function HomePage() {
  return (
    <main>
      <section className="bg-forest-900 text-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:px-8 lg:py-16">
          <div className="flex flex-col justify-center">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-forest-100">Zhejiang Shuren University</p>
            <h1 className="mt-4 text-4xl font-bold leading-tight sm:text-5xl">
              树人健身房 AI 会员服务智能体
            </h1>
            <p className="mt-4 max-w-2xl text-sm font-semibold leading-6 text-red-200">
              杨汛桥校内健身房自 2024 年开放起就是会员制，健身房公约为校方制定，明确规定为会员制。
              请大家遵守规定，会安排相关工作人员进行审核，逃卡私用会公示，请自觉遵守。
            </p>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-forest-50">
              面向浙江树人学院杨汛桥校区会员，提供套餐咨询、线上办卡申请、付款截图提交和反馈收集。
            </p>
            <div className="mt-8 grid gap-3 text-sm text-forest-50 sm:grid-cols-2">
              <div className="flex items-center gap-3 rounded-lg border border-white/15 bg-white/10 p-4">
                <MapPin className="h-5 w-5 text-campus-gold" />
                地点：浙江树人学院杨汛桥校区游泳馆二楼
              </div>
              <div className="flex items-center gap-3 rounded-lg border border-white/15 bg-white/10 p-4">
                <Clock className="h-5 w-5 text-campus-gold" />
                营业时间：每日 10:00 - 20:00
              </div>
              <div className="flex items-center gap-3 rounded-lg border border-white/15 bg-white/10 p-4 sm:col-span-2">
                <BadgeAlert className="h-5 w-5 text-campus-gold" />
                周三 18:00 - 19:20 因课程安排不对外开放
              </div>
              <div className="flex items-center gap-3 rounded-lg border border-white/15 bg-white/10 p-4 sm:col-span-2">
                <Phone className="h-5 w-5 text-campus-gold" />
                管理人员联系方式：16609405727
              </div>
              <div className="flex items-center gap-3 rounded-lg border border-white/15 bg-white/10 p-4 sm:col-span-2">
                <MapPin className="h-5 w-5 text-campus-gold" />
                淋浴房：一楼大厅左转直走，男女淋浴间皆有
              </div>
            </div>
          </div>
          <div className="card bg-white/95 p-5 text-slate-950">
            <div className="flex items-center gap-3">
              <Sparkles className="h-6 w-6 text-campus-gold" />
              <h2 className="text-xl font-bold">套餐价格</h2>
            </div>
            <div className="mt-5 grid gap-4">
              <div className="rounded-lg border border-forest-100 bg-forest-50 p-5">
                <p className="font-semibold text-forest-700">月卡</p>
                <p className="mt-2 text-4xl font-bold">¥{PLANS.month.amount}</p>
                <p className="mt-2 text-sm text-slate-600">适合短期体验和阶段训练。</p>
              </div>
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-5">
                <p className="font-semibold text-amber-700">年卡</p>
                <p className="mt-2 text-4xl font-bold">¥{PLANS.year.amount}</p>
                <p className="mt-2 text-sm text-slate-600">适合长期稳定训练，性价比更高。</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_0.9fr] lg:px-8">
        <div className="card p-5 sm:p-7">
          <SectionTitle
            eyebrow="Membership"
            title="线上办卡申请"
            description="请先通过微信或支付宝完成付款，再上传付款截图。提交后管理员审核，通过后生成会员开始日期和到期日期。"
          />

          <div className="mt-6 grid gap-4 rounded-lg bg-slate-50 p-4 sm:grid-cols-2">
            <QrCard title="微信收款码" imageUrl={wechatQr} />
            <QrCard title="支付宝收款码" imageUrl={alipayQr} />
          </div>

          <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
            <p className="font-bold">办卡声明</p>
            <p className="mt-2">
              会员办理后不得退费。会员可转售给其他学生，但需联系管理人员登记转售同学的信息后方可生效。
              所得皆用于校内健身房的运营，无盈利性质。社团是为广大师生服务。
              管理人员联系方式：16609405727。最终解释权归学校健身房所有。
            </p>
          </div>

          <div className="mt-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-900">
            <p className="font-bold">注意事项</p>
            <p className="mt-2">
              出现问题请第一时间联系工作人员。器械问题以及安全问题切莫自己处理。请大家仔细阅读器械说明书，
              掌握正确训练方式，不得损坏器械。室内有监控，损坏器械者一经查出，将批评通报并罚款。
            </p>
          </div>

          <form action={submitMemberApplication} className="mt-6 grid gap-4 sm:grid-cols-2">
            <label className="field">
              <span className="label">姓名</span>
              <input className="input" name="name" required />
            </label>
            <label className="field">
              <span className="label">学号</span>
              <input className="input" name="student_id" required />
            </label>
            <label className="field">
              <span className="label">专业班级</span>
              <input className="input" name="major_class" placeholder="例如：计算机2401" required />
            </label>
            <label className="field">
              <span className="label">手机号</span>
              <input className="input" name="phone" required type="tel" />
            </label>
            <label className="field">
              <span className="label">套餐</span>
              <select className="input" name="plan" required>
                <option value="month">月卡 ¥200</option>
                <option value="year">年卡 ¥365</option>
              </select>
            </label>
            <label className="field">
              <span className="label">付款方式</span>
              <select className="input" name="payment_method" required>
                <option value="wechat">微信</option>
                <option value="alipay">支付宝</option>
              </select>
            </label>
            <label className="field sm:col-span-2">
              <span className="label">付款截图</span>
              <input accept="image/*" className="input" name="payment_screenshot" required type="file" />
            </label>
            <label className="field sm:col-span-2">
              <span className="label">备注</span>
              <textarea className="input min-h-24" name="remark" placeholder="可填写训练需求或其他说明" />
            </label>
            <div className="sm:col-span-2">
              <SubmitButton pendingText="正在提交申请...">提交会员申请</SubmitButton>
            </div>
          </form>
          <div className="mt-5 rounded-lg bg-forest-50 p-4 text-sm text-slate-700">
            已提交过申请？{" "}
            <a className="font-semibold text-forest-700 underline-offset-4 hover:underline" href="/status">
              查询我的会员状态
            </a>
          </div>
        </div>

        <div className="grid gap-8">
          <div className="card p-5 sm:p-7">
            <SectionTitle
              eyebrow="Feedback"
              title="提交反馈意见"
              description="反馈只会提交给管理员，普通用户无法查看他人的反馈。"
            />
            <form action={submitFeedback} className="mt-6 grid gap-4">
              <label className="field">
                <span className="label">姓名</span>
                <input className="input" name="feedback_name" required />
              </label>
              <label className="field">
                <span className="label">电话</span>
                <input className="input" name="feedback_phone" type="tel" />
              </label>
              <label className="field">
                <span className="label">反馈类型</span>
                <select className="input" name="feedback_type" required>
                  <option>环境</option>
                  <option>淋浴间</option>
                  <option>服务</option>
                  <option>其他</option>
                </select>
              </label>
              <label className="field">
                <span className="label">满意度</span>
                <select className="input" name="satisfaction" required>
                  <option value="5">5 - 很满意</option>
                  <option value="4">4 - 满意</option>
                  <option value="3">3 - 一般</option>
                  <option value="2">2 - 不满意</option>
                  <option value="1">1 - 很不满意</option>
                </select>
              </label>
              <label className="field">
                <span className="label">反馈内容</span>
                <textarea className="input min-h-28" name="content" required />
              </label>
              <SubmitButton pendingText="正在提交反馈...">提交反馈</SubmitButton>
            </form>
          </div>

          <div className="rounded-lg border border-forest-100 bg-forest-50 p-5">
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 h-5 w-5 text-forest-600" />
              <div>
                <h3 className="font-bold text-forest-900">隐私说明</h3>
                <p className="mt-2 text-sm leading-6 text-slate-700">
                  用户端只提供申请和反馈提交，不展示会员名单、收入统计、反馈列表或导出按钮。后台数据仅管理员登录后可见。
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function QrCard({ title, imageUrl }: { title: string; imageUrl: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <p className="font-semibold text-slate-900">{title}</p>
      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img alt={title} className="mt-3 aspect-square w-full rounded-lg border border-slate-100 object-cover" src={imageUrl} />
      ) : (
        <div className="mt-3 grid aspect-square place-items-center rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-center text-sm text-slate-500">
          在环境变量中配置图片地址
        </div>
      )}
    </div>
  );
}
