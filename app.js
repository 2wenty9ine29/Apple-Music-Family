const KEY = "music-money-v1";

const monthNames = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December"
];

const defaultData = {
  accounts: [
    { id: "account-1", name: "Account 1", monthlyDefault: 15 },
    { id: "account-2", name: "Account 2", monthlyDefault: 15 }
  ],
  members: [
    { id: "m1", name: "AARON", accountId: "account-1", monthlyPrice: 15, marker: "🛩️", markerMonth: "April" },
    { id: "m2", name: "Dorcas-10th", accountId: "account-1", monthlyPrice: 15, marker: "🪽", markerMonth: "August" },
    { id: "m3", name: "Ama’s sister", accountId: "account-1", monthlyPrice: 15, marker: "🐍", markerMonth: "September" },
    { id: "m4", name: "Asare", accountId: "account-1", monthlyPrice: 15, marker: "🦉", markerMonth: "October" },
    { id: "m5", name: "BROBBEY", accountId: "account-1", monthlyPrice: 15, marker: "🪽", markerMonth: "August" },
    { id: "m6", name: "HEINRICH", accountId: "account-1", monthlyPrice: 15, marker: "🪽", markerMonth: "August" },
    { id: "m7", name: "MINE", accountId: "account-2", monthlyPrice: 15, marker: "🦉", markerMonth: "October" },
    { id: "m8", name: "BEN", accountId: "account-2", monthlyPrice: 15, marker: "🦉", markerMonth: "October" },
    { id: "m9", name: "Ama", accountId: "account-2", monthlyPrice: 15, marker: "🐍", markerMonth: "September" },
    { id: "m10", name: "QUOLEGEO", accountId: "account-2", monthlyPrice: 15, marker: "🪽", markerMonth: "August" },
    { id: "m11", name: "JOSEPH", accountId: "account-2", monthlyPrice: 15, marker: "🦉", markerMonth: "October" },
    { id: "m12", name: "Justice- Joseph Gee-", accountId: "account-2", monthlyPrice: 15, marker: "🦉", markerMonth: "October" }
  ],
  payments: []
};

let data = loadData();
let viewedMonth = new Date();
viewedMonth = new Date(viewedMonth.getFullYear(), viewedMonth.getMonth(), 1);

const $ = id => document.getElementById(id);
const money = n => `GH₵${Number(n || 0).toLocaleString("en-GH", {minimumFractionDigits: 0, maximumFractionDigits: 2})}`;
const monthKey = d => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;
const todayKey = () => new Date().toISOString().slice(0,10);
const uid = prefix => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2,7)}`;

function loadData() {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY));
    if (saved && saved.accounts && saved.members && saved.payments) return saved;
  } catch {}
  return structuredClone(defaultData);
}
function saveData() {
  localStorage.setItem(KEY, JSON.stringify(data));
}
function member(id) { return data.members.find(m => m.id === id); }
function account(id) { return data.accounts.find(a => a.id === id); }

const markerLegend = {
  "🪽": "August", "🦉": "October", "🛩️": "April", "🛁": "January", "🐍": "September", "🎰": "July"
};
function markerFor(m) { return m.marker || ""; }

function paymentsForMemberBefore(m, targetMonth) {
  return data.payments
    .filter(p => p.memberId === m.id && p.month < targetMonth)
    .reduce((sum,p) => sum + Number(p.amount), 0);
}

// Credit/debt is calculated from actual payments against the member's monthly obligations.
// The first month is the earliest month with a payment or the current month.
function ledgerUpTo(m, targetMonth) {
  const relevant = data.payments
    .filter(p => p.memberId === m.id && p.month <= targetMonth)
    .sort((a,b) => a.month.localeCompare(b.month) || a.date.localeCompare(b.date));

  const months = [];
  const startCandidates = relevant.map(p => p.month).concat(targetMonth);
  let start = startCandidates.sort()[0];

  let cursor = new Date(Number(start.slice(0,4)), Number(start.slice(5,7))-1, 1);
  const end = new Date(Number(targetMonth.slice(0,4)), Number(targetMonth.slice(5,7))-1, 1);

  let credit = 0;
  while (cursor <= end) {
    const mk = monthKey(cursor);
    const price = Number(m.monthlyPrice || 0);
    const paid = relevant.filter(p => p.month === mk).reduce((s,p) => s + Number(p.amount), 0);

    const available = credit + paid;
    const used = Math.min(price, available);
    const due = Math.max(0, price - available);
    credit = Math.max(0, available - price);

    months.push({ month: mk, price, paid, used, due, credit });
    cursor = new Date(cursor.getFullYear(), cursor.getMonth()+1, 1);
  }
  return months;
}

function statusFor(m, mk) {
  const ledger = ledgerUpTo(m, mk);
  const current = ledger.find(x => x.month === mk) || { price:Number(m.monthlyPrice||0), paid:0, used:0, due:Number(m.monthlyPrice||0), credit:0 };
  const prior = ledger.filter(x => x.month < mk).at(-1);
  const priorCredit = prior?.credit || 0;
  const paid = current.paid;
  const price = current.price;
  const covered = current.used;

  if (current.due <= 0) {
    if (paid > price || priorCredit > 0) return { key:"paid", label:"Paid", detail: current.credit > 0 ? `+${money(current.credit)} credit` : "Covered" };
    return { key:"paid", label:"Paid", detail:"Covered" };
  }
  if (covered > 0) return { key:"partial", label:"Partial", detail:`${money(current.due)} due` };
  return { key:"due", label:"Outstanding", detail:`${money(current.due)} due` };
}

function currentTotals(mk) {
  let outstanding = 0, collected = 0, credit = 0, paidCount = 0, dueCount = 0;
  data.members.forEach(m => {
    const s = statusFor(m, mk);
    const ledger = ledgerUpTo(m, mk);
    const cur = ledger.find(x => x.month === mk);
    outstanding += cur?.due || Number(m.monthlyPrice || 0);
    collected += cur?.paid || 0;
    credit += cur?.credit || 0;
    if (s.key === "paid") paidCount++;
    else dueCount++;
  });
  return { outstanding, collected, credit, paidCount, dueCount };
}

function render() {
  const mk = monthKey(viewedMonth);
  const totals = currentTotals(mk);
  $("monthTitle").textContent = `${monthNames[viewedMonth.getMonth()]} ${viewedMonth.getFullYear()}`;
  $("outstandingTotal").textContent = money(totals.outstanding);
  $("collectedTotal").textContent = money(totals.collected);
  $("creditTotal").textContent = money(totals.credit);
  $("memberTotal").textContent = data.members.length;
  $("paidCount").textContent = `${totals.paidCount} paid`;
  $("dueCount").textContent = `${totals.dueCount} outstanding`;
  renderAccounts(mk);
  renderPeople(mk);
  renderPayments(mk);
  populateMemberSelects();
}

function renderAccounts(mk) {
  const el = $("accountsList");
  if (!data.accounts.length) {
    el.innerHTML = `<div class="empty">No accounts yet.</div>`;
    return;
  }
  el.innerHTML = data.accounts.map(a => {
    const people = data.members.filter(m => m.accountId === a.id);
    const collected = people.reduce((s,m) => s + (ledgerUpTo(m,mk).find(x=>x.month===mk)?.paid || 0), 0);
    const outstanding = people.reduce((s,m) => s + (ledgerUpTo(m,mk).find(x=>x.month===mk)?.due || Number(m.monthlyPrice||0)), 0);
    return `
      <button class="account-card" data-account="${a.id}">
        <div>
          <h3>${escapeHtml(a.name)}</h3>
          <div class="sub">${people.length} member${people.length===1?"":"s"}</div>
        </div>
        <div class="account-right">
          <strong>${money(collected)}</strong>
          <div class="sub">${money(outstanding)} due</div>
        </div>
        <div class="chevron">›</div>
      </button>`;
  }).join("");
  el.querySelectorAll("[data-account]").forEach(btn => {
    btn.addEventListener("click", () => {
      $("searchInput").value = "";
      renderPeople(mk, btn.dataset.account);
      document.querySelector(".section:nth-of-type(2)")?.scrollIntoView({behavior:"smooth"});
    });
  });
}

function renderPeople(mk, accountFilter = null) {
  const query = $("searchInput").value.trim().toLowerCase();
  const el = $("peopleList");
  const people = data.members.filter(m =>
    (!accountFilter || m.accountId === accountFilter) &&
    (!query || m.name.toLowerCase().includes(query))
  );

  if (!people.length) {
    el.innerHTML = `<div class="empty">No members found.</div>`;
    return;
  }

  el.innerHTML = people.map(m => {
    const s = statusFor(m, mk);
    const a = account(m.accountId);
    return `
      <button class="person-row" data-member="${m.id}">
        <div class="person-main">
          <div class="name-line"><span class="member-marker">${markerFor(m)}</span><h3 class="person-name">${escapeHtml(m.name)}</h3></div>
          <div class="sub">${escapeHtml(a?.name || "No account")} · ${money(m.monthlyPrice)}/month · ${escapeHtml(m.markerMonth || markerLegend[m.marker] || "")}</div>
        </div>
        <div class="status ${s.key}"><strong>${s.label}</strong><small>${s.detail}</small></div>
      </button>`;
  }).join("");

  el.querySelectorAll("[data-member]").forEach(btn => {
    btn.addEventListener("click", () => openMemberDetail(btn.dataset.member));
  });
}

function renderPayments(mk) {
  const el = $("paymentsList");
  const payments = data.payments
    .filter(p => p.month === mk)
    .sort((a,b) => b.date.localeCompare(a.date));

  if (!payments.length) {
    el.innerHTML = `<div class="empty">No payments recorded for this month.</div>`;
    return;
  }
  el.innerHTML = payments.map(p => {
    const m = member(p.memberId);
    return `
      <div class="payment-row">
        <div>
          <strong>${escapeHtml(m?.name || "Unknown")}</strong>
          <div class="sub">${p.date}${p.note ? ` · ${escapeHtml(p.note)}` : ""}</div>
        </div>
        <div class="amount"><strong>${money(p.amount)}</strong></div>
      </div>`;
  }).join("");
}

function populateMemberSelects() {
  const options = data.members.map(m => `<option value="${m.id}">${escapeHtml(m.name)}</option>`).join("");
  $("paymentMember").innerHTML = options || `<option value="">No members</option>`;
  $("memberAccount").innerHTML = data.accounts.map(a => `<option value="${a.id}">${escapeHtml(a.name)}</option>`).join("");
}

function openSheet(id) {
  $(id).classList.add("open");
  $(id).setAttribute("aria-hidden","false");
  $("backdrop").classList.add("open");
}
function closeSheets() {
  document.querySelectorAll(".sheet.open").forEach(s => s.classList.remove("open"));
  document.querySelectorAll(".sheet").forEach(s => s.setAttribute("aria-hidden","true"));
  $("backdrop").classList.remove("open");
}

function openPaymentSheet(memberId = null) {
  $("paymentForm").reset();
  $("paymentMonth").value = monthKey(viewedMonth);
  $("paymentDate").value = todayKey();
  populateMemberSelects();
  if (memberId) $("paymentMember").value = memberId;
  openSheet("paymentSheet");
  setTimeout(() => $("paymentAmount").focus(), 250);
}

function openMemberSheet(memberId = null) {
  $("memberForm").reset();
  $("memberForm").dataset.editing = memberId || "";
  $("memberSheetTitle").textContent = memberId ? "Edit member" : "Add member";
  if (memberId) {
    const m = member(memberId);
    $("memberName").value = m.name;
    $("memberAccount").value = m.accountId;
    $("memberPrice").value = m.monthlyPrice;
    $("memberMarker").value = m.marker || "";
  } else {
    $("memberPrice").value = account(data.accounts[0]?.id)?.monthlyDefault || 15;
    $("memberMarker").value = "";
  }
  populateMemberSelects();
  openSheet("memberSheet");
}

function openAccountsSheet() {
  renderAccountEditor();
  openSheet("accountsSheet");
}

function renderAccountEditor() {
  $("accountEditor").innerHTML = data.accounts.map(a => `
    <div class="editor-row">
      <input data-account-name="${a.id}" value="${escapeAttr(a.name)}" maxlength="40" />
      <button class="danger" data-delete-account="${a.id}">Delete</button>
    </div>
  `).join("");

  $("accountEditor").querySelectorAll("[data-account-name]").forEach(input => {
    input.addEventListener("change", () => {
      const a = account(input.dataset.accountName);
      if (a) { a.name = input.value.trim() || a.name; saveData(); (function migrateSampleData() {
  const saved = localStorage.getItem(KEY);
  if (!saved) return;
  try {
    const parsed = JSON.parse(saved);
    const oldNames = ["Kofi","Daniel","Quolegeo","Joseph"];
    if (parsed.members?.some(m => oldNames.includes(m.name))) {
      localStorage.removeItem(KEY); data = structuredClone(defaultData); saveData();
    }
  } catch {}
})();
render(); }
    });
  });
  $("accountEditor").querySelectorAll("[data-delete-account]").forEach(btn => {
    btn.addEventListener("click", () => {
      if (data.accounts.length <= 1) return toast("Keep at least one account.");
      const id = btn.dataset.deleteAccount;
      const hasMembers = data.members.some(m => m.accountId === id);
      if (hasMembers) return toast("Move or delete its members first.");
      data.accounts = data.accounts.filter(a => a.id !== id);
      saveData(); renderAccountEditor(); render(); toast("Account deleted");
    });
  });
}

function openMemberDetail(id) {
  const m = member(id);
  if (!m) return;
  const mk = monthKey(viewedMonth);
  $("detailName").textContent = m.name;
  const ledger = ledgerUpTo(m, mk);
  const cur = ledger.find(x=>x.month===mk) || {due:m.monthlyPrice,paid:0,credit:0};
  $("memberDetail").innerHTML = `
    <div class="detail-summary">
      <div class="detail-box"><span>${monthNames[viewedMonth.getMonth()]} due</span><strong>${money(cur.due)}</strong></div>
      <div class="detail-box"><span>Credit</span><strong>${money(cur.credit)}</strong></div>
    </div>
    <button class="save-button" id="detailAddPayment">＋ Add payment</button>
    <button class="save-button secondary" id="detailEditMember">Edit member</button>
    <div style="height:18px"></div>
    <div class="eyebrow">MONTHLY HISTORY</div>
    <div>
      ${ledger.slice().reverse().map(x => `
        <div class="history-row">
          <div>
            <strong>${monthNames[Number(x.month.slice(5))-1]} ${x.month.slice(0,4)}</strong>
            <small>Paid ${money(x.paid)} · Due ${money(x.due)}</small>
          </div>
          <div class="${x.due <= 0 ? "paid" : "due"}"><strong>${x.due <= 0 ? "✓ Paid" : money(x.due)}</strong></div>
        </div>
      `).join("") || `<div class="empty">No history yet.</div>`}
    </div>`;
  $("detailAddPayment").onclick = () => { closeSheets(); openPaymentSheet(id); };
  $("detailEditMember").onclick = () => { closeSheets(); openMemberSheet(id); };
  openSheet("memberDetailSheet");
}

$("paymentForm").addEventListener("submit", e => {
  e.preventDefault();
  const memberId = $("paymentMember").value;
  const amount = Number($("paymentAmount").value);
  if (!memberId || !amount || amount <= 0) return;
  data.payments.push({
    id: uid("pay"),
    memberId,
    amount,
    month: $("paymentMonth").value,
    date: $("paymentDate").value,
    note: $("paymentNote").value.trim()
  });
  saveData();
  const paidMember = member(memberId);
  closeSheets();
  viewedMonth = new Date(Number($("paymentMonth").value.slice(0,4)), Number($("paymentMonth").value.slice(5,7))-1, 1);
  render();
  toast(`${money(amount)} recorded for ${paidMember?.name || "member"}`);
});

$("memberForm").addEventListener("submit", e => {
  e.preventDefault();
  const editing = $("memberForm").dataset.editing;
  const payload = {
    name: $("memberName").value.trim(),
    accountId: $("memberAccount").value,
    monthlyPrice: Number($("memberPrice").value),
    marker: $("memberMarker").value,
    markerMonth: markerLegend[$("memberMarker").value] || ""
  };
  if (!payload.name || payload.monthlyPrice < 0) return;
  if (editing) {
    const m = member(editing);
    Object.assign(m, payload);
    toast("Member updated");
  } else {
    data.members.push({id:uid("member"), ...payload});
    toast("Member added");
  }
  saveData(); closeSheets(); render();
});

$("addAccountButton").addEventListener("click", () => {
  data.accounts.push({id:uid("account"), name:`Account ${data.accounts.length+1}`, monthlyDefault:15});
  saveData(); renderAccountEditor(); render(); toast("Account added");
});

$("searchInput").addEventListener("input", () => renderPeople(monthKey(viewedMonth)));
$("clearSearch").addEventListener("click", () => {
  $("searchInput").value = "";
  renderPeople(monthKey(viewedMonth));
  $("searchInput").focus();
});

$("prevMonth").addEventListener("click", () => {
  viewedMonth = new Date(viewedMonth.getFullYear(), viewedMonth.getMonth()-1, 1);
  render();
});
$("nextMonth").addEventListener("click", () => {
  viewedMonth = new Date(viewedMonth.getFullYear(), viewedMonth.getMonth()+1, 1);
  render();
});
$("monthTitle").addEventListener("click", () => {
  const now = new Date();
  viewedMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  render();
  toast("Returned to current month");
});

$("enterApp").onclick = () => { document.body.classList.add("app-ready"); $("splash").classList.add("hide"); setTimeout(() => $("splash")?.remove(), 650); };
$("homeBrand").onclick = () => window.scrollTo({top:0, behavior:"smooth"});
$("homeTab").onclick = () => window.scrollTo({top:0, behavior:"smooth"});
$("addMember").onclick = () => openMemberSheet();
$("manageAccounts").onclick = () => openAccountsSheet();
$("settingsTab").onclick = () => openAccountsSheet();

document.querySelectorAll("[data-close]").forEach(btn => btn.addEventListener("click", closeSheets));
$("backdrop").addEventListener("click", closeSheets);

document.querySelectorAll(".tab[data-tab]").forEach(tab => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
    tab.classList.add("active");
    const target = tab.dataset.tab;
    if (target === "people") document.querySelector("#peopleList").scrollIntoView({behavior:"smooth"});
    if (target === "payments") document.querySelector("#paymentsList").scrollIntoView({behavior:"smooth"});
    if (target === "overview") window.scrollTo({top:0, behavior:"smooth"});
  });
});

function toast(message) {
  const el = $("toast");
  el.textContent = message;
  el.classList.add("show");
  clearTimeout(window.__toast);
  window.__toast = setTimeout(() => el.classList.remove("show"), 1800);
}
function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
}
function escapeAttr(s) { return escapeHtml(s); }

render();
