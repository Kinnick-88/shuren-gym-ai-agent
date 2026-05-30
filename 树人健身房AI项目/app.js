const PLANS = {
  "年卡": 365,
  "月卡": 200,
};

const STORAGE_KEYS = {
  members: "shuren_gym_members_v1",
  feedback: "shuren_gym_feedback_v1",
};

const titles = {
  consult: "智能咨询",
  recommend: "套餐推荐",
  register: "入会登记",
  manage: "会员管理",
  feedback: "反馈收集",
};

let members = readStore(STORAGE_KEYS.members);
let feedback = readStore(STORAGE_KEYS.feedback);

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => Array.from(document.querySelectorAll(selector));

function readStore(key) {
  try {
    return JSON.parse(localStorage.getItem(key)) || [];
  } catch {
    return [];
  }
}

function writeStore(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function formatMoney(value) {
  return `¥${Number(value || 0).toLocaleString("zh-CN")}`;
}

function formatDate(value) {
  return new Date(value).toLocaleString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function showToast(message) {
  const toast = $("#toast");
  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.remove("show"), 2400);
}

function makeId() {
  if (window.crypto && typeof window.crypto.randomUUID === "function") {
    return window.crypto.randomUUID();
  }
  return `id_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function renderStats() {
  const income = members.reduce((sum, item) => sum + Number(item.fee || 0), 0);
  $("#memberCount").textContent = members.length;
  $("#feedbackCount").textContent = feedback.length;
  $("#incomeTotal").textContent = formatMoney(income);
}

function setupTabs() {
  $$(".tab-button").forEach((button) => {
    button.addEventListener("click", () => {
      const tab = button.dataset.tab;
      $$(".tab-button").forEach((item) => item.classList.toggle("active", item === button));
      $$(".tab-panel").forEach((panel) => panel.classList.toggle("active", panel.id === tab));
      $("#activeTitle").textContent = titles[tab];
    });
  });
}

function addChatMessage(text, who = "bot") {
  const message = document.createElement("div");
  message.className = `message ${who}`;
  message.innerHTML = escapeHtml(text).replaceAll("\n", "<br />");
  $("#chatLog").appendChild(message);
  $("#chatLog").scrollTop = $("#chatLog").scrollHeight;
}

function getConsultAnswer(question) {
  const text = question.trim().toLowerCase();

  if (!text) return "可以直接问我套餐价格、淋浴间、入会登记材料、会员管理和反馈提交。";
  if (/(淋浴|洗澡|浴室|澡堂)/.test(text)) {
    return "健身房提供淋浴间相关咨询。建议会员携带毛巾、拖鞋和个人洗浴用品；具体开放安排以场馆现场通知为准。";
  }
  if (/(价格|多少钱|收费|费用|套餐|年卡|月卡)/.test(text)) {
    return "目前套餐只有两个档位：年卡 365 元，月卡 200 元。训练超过 2 个月通常推荐年卡，整体更划算。";
  }
  if (/(推荐|划算|办哪|选择)/.test(text)) {
    return "如果你预计连续训练 2 个月以上，推荐年卡 365 元；如果只是短期体验或不确定是否坚持，可以先办月卡 200 元。";
  }
  if (/(登记|入会|注册|办理|资料|信息)/.test(text)) {
    return "入会登记需要填写：学号、专业班级姓名、电话号码、套餐档位和备注。提交后可在会员管理里查看，并导出 Excel 登记表。";
  }
  if (/(反馈|建议|投诉|意见)/.test(text)) {
    return "可以在反馈收集模块记录姓名、联系电话、反馈类型、满意度和具体内容，并一键生成 Word 统计文件。";
  }
  if (/(地点|校区|哪里)/.test(text)) {
    return "本智能体面向浙江树人学院杨汛桥校区健身房会员服务。";
  }

  return "我已经记录到你的问题。V1.0 主要支持淋浴间咨询、套餐价格与推荐、入会登记、会员管理和反馈统计；你也可以换个问法继续问我。";
}

function setupChat() {
  addChatMessage("你好，我是树人健身房 AI 会员服务智能体。你可以问我：有无淋浴间、套餐价格、如何入会、怎么导出会员登记表。");

  $("#chatForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const input = $("#chatInput");
    const question = input.value.trim();
    if (!question) return;
    addChatMessage(question, "user");
    input.value = "";
    window.setTimeout(() => addChatMessage(getConsultAnswer(question), "bot"), 180);
  });

  $$(".quick-question").forEach((button) => {
    button.addEventListener("click", () => {
      $("#chatInput").value = button.textContent;
      $("#chatForm").requestSubmit();
    });
  });
}

function setupRecommendation() {
  $("#makeRecommendation").addEventListener("click", () => {
    const months = Math.max(1, Number($("#trainingMonths").value || 1));
    const weeklyVisits = Math.max(1, Number($("#weeklyVisits").value || 1));
    const budget = $("#budgetPreference").value;
    const goal = $("#fitnessGoal").value;
    const monthlyCostOnAnnual = PLANS["年卡"] / Math.max(months, 1);
    const expectedVisits = months * 4 * weeklyVisits;
    const annualPerVisit = PLANS["年卡"] / expectedVisits;
    const monthlyPerVisit = (PLANS["月卡"] * months) / expectedVisits;
    const shouldAnnual = months >= 2 && budget !== "low";
    const plan = shouldAnnual || budget === "stable" || goal === "shape" || goal === "fatloss" ? "年卡" : "月卡";
    const reason = plan === "年卡"
      ? `预计训练 ${months} 个月，年卡折算每月约 ${formatMoney(monthlyCostOnAnnual)}，比连续办理月卡更划算。`
      : "你当前更适合低门槛体验，先用月卡确认训练频率和作息匹配度。";

    $("#recommendationResult").innerHTML = `
      <h3>推荐办理：${plan} ${formatMoney(PLANS[plan])}</h3>
      <p>${reason}</p>
      <p>按你填写的频率估算，总训练约 ${expectedVisits} 次。年卡单次约 ${formatMoney(annualPerVisit)}，连续月卡单次约 ${formatMoney(monthlyPerVisit)}。</p>
    `;
  });
  $("#makeRecommendation").click();
}

function setupMemberForm() {
  $("#memberForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const plan = form.get("plan");
    members.unshift({
      id: makeId(),
      createdAt: new Date().toISOString(),
      studentId: form.get("studentId").trim(),
      profile: form.get("profile").trim(),
      phone: form.get("phone").trim(),
      plan,
      fee: PLANS[plan],
      note: form.get("note").trim(),
    });
    writeStore(STORAGE_KEYS.members, members);
    event.currentTarget.reset();
    renderAll();
    showToast("会员登记已保存");
  });
}

function renderMembers() {
  const keyword = ($("#memberSearch").value || "").trim().toLowerCase();
  const rows = members.filter((member) => {
    const source = `${member.studentId} ${member.profile} ${member.phone} ${member.plan} ${member.note}`.toLowerCase();
    return source.includes(keyword);
  });

  $("#memberTable").innerHTML = rows.length
    ? rows.map((member) => `
      <tr>
        <td>${formatDate(member.createdAt)}</td>
        <td>${escapeHtml(member.studentId)}</td>
        <td>${escapeHtml(member.profile)}</td>
        <td>${escapeHtml(member.phone)}</td>
        <td>${escapeHtml(member.plan)}</td>
        <td>${formatMoney(member.fee)}</td>
        <td>${escapeHtml(member.note)}</td>
        <td><button class="danger-button" data-delete-member="${member.id}" type="button">删除</button></td>
      </tr>
    `).join("")
    : `<tr><td class="empty-row" colspan="8">暂无会员登记记录</td></tr>`;
}

function setupMemberManagement() {
  $("#memberSearch").addEventListener("input", renderMembers);
  $("#memberTable").addEventListener("click", (event) => {
    const id = event.target.dataset.deleteMember;
    if (!id) return;
    members = members.filter((member) => member.id !== id);
    writeStore(STORAGE_KEYS.members, members);
    renderAll();
    showToast("已删除会员记录");
  });

  $("#exportMembers").addEventListener("click", exportMembersExcel);
  $("#exportMembersTop").addEventListener("click", exportMembersExcel);
}

function setupFeedback() {
  $("#feedbackForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    feedback.unshift({
      id: makeId(),
      createdAt: new Date().toISOString(),
      name: form.get("name").trim(),
      phone: form.get("phone").trim(),
      category: form.get("category"),
      rating: Number(form.get("rating")),
      content: form.get("content").trim(),
    });
    writeStore(STORAGE_KEYS.feedback, feedback);
    event.currentTarget.reset();
    renderAll();
    showToast("反馈已记录");
  });

  $("#exportFeedback").addEventListener("click", exportFeedbackWord);
  $("#exportFeedbackTop").addEventListener("click", exportFeedbackWord);
}

function renderFeedback() {
  $("#feedbackList").innerHTML = feedback.length
    ? feedback.map((item) => `
      <article class="feedback-item">
        <header>
          <strong>${escapeHtml(item.category)} / ${item.rating} 分</strong>
          <span>${formatDate(item.createdAt)}</span>
        </header>
        <p>${escapeHtml(item.name)} ${item.phone ? `(${escapeHtml(item.phone)})` : ""}</p>
        <p>${escapeHtml(item.content)}</p>
      </article>
    `).join("")
    : `<div class="feedback-item"><p>暂无反馈记录</p></div>`;
}

function downloadFile(filename, mimeType, content) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function exportMembersExcel() {
  const rows = members.map((member, index) => `
    <tr>
      <td>${index + 1}</td>
      <td>${escapeHtml(formatDate(member.createdAt))}</td>
      <td>${escapeHtml(member.studentId)}</td>
      <td>${escapeHtml(member.profile)}</td>
      <td>${escapeHtml(member.phone)}</td>
      <td>${escapeHtml(member.plan)}</td>
      <td>${member.fee}</td>
      <td>${escapeHtml(member.note)}</td>
    </tr>
  `).join("");

  const html = `
    <html>
      <head><meta charset="UTF-8" /></head>
      <body>
        <table border="1">
          <caption>树人健身房会员登记表</caption>
          <thead>
            <tr>
              <th>序号</th>
              <th>登记时间</th>
              <th>学号</th>
              <th>专业班级姓名</th>
              <th>电话号码</th>
              <th>套餐档位</th>
              <th>金额</th>
              <th>备注</th>
            </tr>
          </thead>
          <tbody>${rows || `<tr><td colspan="8">暂无数据</td></tr>`}</tbody>
        </table>
      </body>
    </html>
  `;

  downloadFile(`树人健身房会员登记表_${dateStamp()}.xls`, "application/vnd.ms-excel;charset=utf-8", html);
  showToast("Excel 登记表已生成");
}

function exportFeedbackWord() {
  const average = feedback.length
    ? (feedback.reduce((sum, item) => sum + item.rating, 0) / feedback.length).toFixed(1)
    : "0";
  const byCategory = feedback.reduce((map, item) => {
    map[item.category] = (map[item.category] || 0) + 1;
    return map;
  }, {});

  const categoryRows = Object.entries(byCategory).map(([category, count]) => `
    <tr><td>${escapeHtml(category)}</td><td>${count}</td></tr>
  `).join("");

  const detailRows = feedback.map((item, index) => `
    <tr>
      <td>${index + 1}</td>
      <td>${escapeHtml(formatDate(item.createdAt))}</td>
      <td>${escapeHtml(item.name)}</td>
      <td>${escapeHtml(item.phone)}</td>
      <td>${escapeHtml(item.category)}</td>
      <td>${item.rating}</td>
      <td>${escapeHtml(item.content)}</td>
    </tr>
  `).join("");

  const html = `
    <html>
      <head>
        <meta charset="UTF-8" />
        <style>
          body { font-family: SimSun, "Microsoft YaHei", sans-serif; line-height: 1.6; color: #1f2933; }
          h1 { color: #126346; }
          table { width: 100%; border-collapse: collapse; margin: 12px 0 22px; }
          th, td { border: 1px solid #9aa6b2; padding: 8px; vertical-align: top; }
          th { background: #e9f4ee; }
        </style>
      </head>
      <body>
        <h1>树人健身房用户反馈统计</h1>
        <p>校区：浙江树人学院杨汛桥校区</p>
        <p>生成时间：${escapeHtml(formatDate(new Date().toISOString()))}</p>
        <h2>汇总</h2>
        <p>反馈总数：${feedback.length} 条；平均满意度：${average} 分。</p>
        <h2>反馈类型统计</h2>
        <table>
          <thead><tr><th>反馈类型</th><th>数量</th></tr></thead>
          <tbody>${categoryRows || `<tr><td colspan="2">暂无数据</td></tr>`}</tbody>
        </table>
        <h2>反馈明细</h2>
        <table>
          <thead>
            <tr>
              <th>序号</th>
              <th>提交时间</th>
              <th>姓名</th>
              <th>联系电话</th>
              <th>类型</th>
              <th>满意度</th>
              <th>内容</th>
            </tr>
          </thead>
          <tbody>${detailRows || `<tr><td colspan="7">暂无数据</td></tr>`}</tbody>
        </table>
      </body>
    </html>
  `;

  downloadFile(`树人健身房用户反馈统计_${dateStamp()}.doc`, "application/msword;charset=utf-8", html);
  showToast("Word 统计文件已生成");
}

function dateStamp() {
  const now = new Date();
  const pad = (value) => String(value).padStart(2, "0");
  return `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}`;
}

function renderAll() {
  renderStats();
  renderMembers();
  renderFeedback();
}

function init() {
  setupTabs();
  setupChat();
  setupRecommendation();
  setupMemberForm();
  setupMemberManagement();
  setupFeedback();
  renderAll();
}

init();
