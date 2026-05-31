# 树人健身房 AI 会员服务智能体 V1.0

基于 Next.js App Router、TypeScript、Tailwind CSS、Supabase 和 Vercel 的全栈网站。项目分为公开用户端和管理员后台，后台数据不再由 GitHub Pages 承载。

## 功能

用户端：

- 展示浙江树人学院杨汛桥校区健身房介绍、地址、营业时间和套餐价格
- 套餐：月卡 ¥200，年卡 ¥365
- 用户选择微信或支付宝付款，并上传付款截图
- 用户填写姓名、学号、专业班级、手机号、套餐和备注
- 提交后生成 `pending` 状态会员申请
- 用户可提交反馈意见
- 用户可通过学号和手机号查询自己的申请状态
- 用户端不展示会员列表、收入统计、反馈列表或导出按钮

管理员端：

- `/admin` 必须登录后访问，未登录自动跳转 `/admin/login`
- 只有 `admin_users` 表中的管理员邮箱可以进入后台
- 查看会员申请、付款截图和反馈列表
- 审核通过或拒绝会员申请
- 通过后自动生成开始日期和到期日期：月卡 30 天，年卡 365 天
- 查看会员总数、待审核人数、反馈条数、预计收入
- 导出会员和反馈 CSV

## 本地运行

1. 安装依赖：

```bash
npm install
```

2. 复制环境变量：

```bash
cp .env.local.example .env.local
```

3. 在 `.env.local` 填入 Supabase 项目信息：

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
NEXT_PUBLIC_WECHAT_QR_URL=/wechat-qr.png
NEXT_PUBLIC_ALIPAY_QR_URL=/alipay-qr.png
```

4. 在 Supabase SQL Editor 执行：

```text
supabase/schema.sql
```

5. 启动开发环境：

```bash
npm run dev
```

访问：

- 用户端：`http://localhost:3000`
- 本人申请查询：`http://localhost:3000/status`
- 管理员端：`http://localhost:3000/admin`

## Vercel 部署

1. 将项目推送到 GitHub 仓库。
2. 打开 Vercel，选择 `Add New Project`，导入该仓库。
3. Framework Preset 选择 `Next.js`。
4. 在 Environment Variables 添加：
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_WECHAT_QR_URL`
   - `NEXT_PUBLIC_ALIPAY_QR_URL`
5. 点击 Deploy。
6. 部署成功后，用户端为 Vercel 生成的域名；管理员后台为 `https://你的域名/admin`。

## 创建第一个管理员账号

1. Supabase 控制台进入 `Authentication` → `Users`。
2. 点击 `Add user`，创建管理员邮箱和密码。
3. 进入 `SQL Editor`，执行：

```sql
insert into public.admin_users (email)
values ('你的管理员邮箱@example.com');
```

4. 打开 `/admin/login`，使用刚创建的邮箱和密码登录。

注意：管理员必须同时满足两个条件：

- 存在于 Supabase Auth 用户列表
- 邮箱存在于 `public.admin_users` 表

## 配置微信和支付宝收款码

推荐方式：

1. 在项目根目录创建 `public` 文件夹。
2. 放入两张图片：
   - `public/wechat-qr.png`
   - `public/alipay-qr.png`
3. 环境变量保持：

```bash
NEXT_PUBLIC_WECHAT_QR_URL=/wechat-qr.png
NEXT_PUBLIC_ALIPAY_QR_URL=/alipay-qr.png
```

也可以把收款码上传到 Supabase Storage 或其他图片服务，然后把环境变量改为完整 HTTPS 图片地址。

## 权限说明

Supabase Row Level Security 已在 `supabase/schema.sql` 中配置：

- 普通匿名用户只能插入会员申请和反馈
- 普通匿名用户不能读取会员列表、反馈列表和后台统计
- 普通用户只能通过 `lookup_my_membership` 按学号和手机号查询自己的申请状态
- 管理员读取和审核数据前必须登录 Supabase Auth
- 管理员邮箱必须存在于 `admin_users`
- 付款截图上传到私有 `payment-screenshots` bucket
- 管理员后台通过临时签名 URL 查看付款截图

## 重要说明

当前版本使用“上传付款截图 + 管理员审核”的方式确认付款，不是自动调用微信支付或支付宝支付接口。若后续要接入真正的微信支付/支付宝支付，需要增加后端下单、支付回调验签和订单状态同步。
