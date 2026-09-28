const KEY = "music-money-v1";
const monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];

const defaultData = {
  accounts: [
    { id: "account-1", name: "Account 1", monthlyDefault: 15 },
    { id: "account-2", name: "Account 2", monthlyDefault: 15 }
  ],
  members: [
    { id:"m1", name:"AARON", accountId:"account-1", monthlyPrice:15, marker:"🛩️", markerMonth:"April" },
    { id:"m2", name:"Dorcas-10th", accountId:"account-1", monthlyPrice:15, marker:"🪽", markerMonth:"August" },
    { id:"m3", name:"Ama’s sister", accountId:"account-1", monthlyPrice:15, marker:"🐍", markerMonth:"September" },
    { id:"m4", name:"Asare", accountId:"account-1", monthlyPrice:15, marker:"🦉", markerMonth:"October" },
    { id:"m5", name:"BROBBEY", accountId:"account-1", monthlyPrice:15, marker:"🪽", markerMonth:"August" },
    { id:"m6", name:"HEINRICH", accountId:"account-1", monthlyPrice:15, marker:"🪽", markerMonth:"August" },
    { id:"m7", name:"MINE", accountId:"account-2", monthlyPrice:15, marker:"🦉", markerMonth:"October" },
    { id:"m8", name:"BEN", accountId:"account-2", monthlyPrice:15, marker:"🦉", markerMonth:"October" },
    { id:"m9", name:"Ama", accountId:"account-2", monthlyPrice:15, marker:"🐍", markerMonth:"September" },
    { id:"m10", name:"QUOLEGEO", accountId:"account-2", monthlyPrice:15, marker:"🪽", markerMonth:"August" },
    { id:"m11", name:"JOSEPH", accountId:"account-2", monthlyPrice:15, marker:"🦉", markerMonth:"October" },
    { id:"m12", name:"Justice- Joseph Gee-", accountId:"account-2", monthlyPrice:15, marker:"🦉", markerMonth:"October" }
  ],
  payments: []
};

let data = loadData();
let viewedMonth = new Date(2026, 9, 1);
const $ = id => document.getElementById(id);
const money = n => `GH₵${Number(n || 0).toLocaleString("en-GH", {minimumFractionDigits:0, maximumFractionDigits:2})}`;
const monthKey = d => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;
const todayKey = () => new Date().toISOString().slice(0,10);
const uid = prefix => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2,7)}`;

function loadData() {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY));
    if (saved && saved.accounts && saved.members && saved.payments) {
      // Keep the current roster/settlement markers authoritative while preserving recorded payments.
      const byName = new Map(saved.members.map(m => [String(m.name).toLowerCase(), m]));
      const merged = structuredClone(defaultData);
      merged.payments = saved.payments || [];
      merged.accounts = defaultData.accounts.map(a => saved.accounts.find(x => x.id === a.id) || a);
      merged.members = defaultData.members.map(m => ({...m, ...(byName.get(m.name.toLowerCase()) || {}), id:m.id, accountId:m.accountId, marker:m.marker, markerMonth:m.markerMonth, monthlyPrice:15}));
      return merged;
    }
  } catch {}
  return structuredClone(defaultData);
}
function saveData(){ localStorage.setItem(KEY, JSON.stringify(data)); }
function member(id){ return data.members.find(m=>m.id===id); }
function account(id){ return data.accounts.find(a=>a.id===id); }
const markerLegend = {"🪽":"August","🦉":"October","🛩️":"April","🛁":"January","🐍":"September","🎰":"July"};
function lastPaymentLabel(memberId){
  const list=data.payments.filter(p=>p.memberId===memberId).slice().sort((a,b)=>new Date(b.date||0)-new Date(a.date||0));
  if(!list.length) return "None yet";
  const d=new Date(list[0].date); return Number.isNaN(d.getTime())?"Recorded":d.toLocaleDateString(undefined,{day:"numeric",month:"short",year:"numeric"});
}

// The member marker is the last month the member has settled. For example, October = GH₵0 debt in October;
// September = one unpaid month (GH₵15), August = two unpaid months (GH₵30), April = six (GH₵90).
function settlementDebt(m, mk){
  const settledIndex = monthNames.indexOf(m.markerMonth);
  if(settledIndex < 0) return Number(m.monthlyPrice || 15);
  const viewed = Number(mk.slice(5,7))-1;
  const viewedYear = Number(mk.slice(0,4));
  const baseYear = viewedYear;
  const diff = (baseYear*12 + viewed) - (baseYear*12 + settledIndex);
  return Math.max(0, diff * Number(m.monthlyPrice || 15));
}
function totalDebtForMember(m,mk){ return settlementDebt(m,mk || monthKey(viewedMonth)); }

function ledgerUpTo(m,targetMonth){
  const relevant=data.payments.filter(p=>p.memberId===m.id && p.month<=targetMonth).sort((a,b)=>a.month.localeCompare(b.month)||(a.date||"").localeCompare(b.date||""));
  const startCandidates=relevant.map(p=>p.month).concat(targetMonth);
  let start=startCandidates.sort()[0];
  let cursor=new Date(Number(start.slice(0,4)),Number(start.slice(5,7))-1,1);
  const end=new Date(Number(targetMonth.slice(0,4)),Number(targetMonth.slice(5,7))-1,1);
  let credit=0, months=[];
  while(cursor<=end){
    const mk=monthKey(cursor), price=Number(m.monthlyPrice||0), paid=relevant.filter(p=>p.month===mk).reduce((s,p)=>s+Number(p.amount||0),0);
    const available=credit+paid, used=Math.min(price,available), due=Math.max(0,price-available); credit=Math.max(0,available-price);
    months.push({month:mk,price,paid,used,due,credit}); cursor=new Date(cursor.getFullYear(),cursor.getMonth()+1,1);
  }
  return months;
}
function statusFor(m,mk){
  const debt=totalDebtForMember(m,mk);
  return debt<=0 ? {key:"paid",label:"Paid",detail:"Settled"} : {key:"due",label:"Outstanding",detail:`${money(debt)} due`};
}
function currentTotals(mk){
  let outstanding=0,collected=0,credit=0,paidCount=0,dueCount=0;
  data.members.forEach(m=>{
    const debt=totalDebtForMember(m,mk), payments=data.payments.filter(p=>p.memberId===m.id&&p.month===mk).reduce((s,p)=>s+Number(p.amount||0),0);
    outstanding+=debt; collected+=payments;
    if(debt<=0) paidCount++; else dueCount++;
  });
  return {outstanding,collected,credit,paidCount,dueCount};
}

function render(){
  const mk=monthKey(viewedMonth), totals=currentTotals(mk);
  $("monthTitle").textContent=`${monthNames[viewedMonth.getMonth()]} ${viewedMonth.getFullYear()}`;
  $("outstandingTotal").textContent=money(totals.outstanding);
  $("collectedTotal").textContent=money(totals.collected);
  $("creditTotal").textContent=money(totals.credit);
  $("memberTotal").textContent=data.members.length;
  $("paidCount").textContent=`${totals.paidCount} paid`;
  $("dueCount").textContent=`${totals.dueCount} outstanding`;
  renderAccounts(mk); renderPeople(mk); renderPayments(mk); populateMemberSelects();
}
function renderAccounts(mk){
  const el=$("accountsList");
  el.innerHTML=data.accounts.map(a=>{
    const people=data.members.filter(m=>m.accountId===a.id);
    const outstanding=people.reduce((s,m)=>s+totalDebtForMember(m,mk),0);
    const paid=people.filter(m=>totalDebtForMember(m,mk)<=0).length;
    return `<button class="account-card" data-account="${a.id}"><div><h3>${escapeHtml(a.name)}</h3><div class="sub">${people.length} members · ${paid} settled</div></div><div class="account-right"><strong>${money(outstanding)}</strong><div class="sub">total debt</div></div><div class="chevron">›</div></button>`;
  }).join("") || `<div class="empty">No accounts yet.</div>`;
  el.querySelectorAll("[data-account]").forEach(btn=>btn.addEventListener("click",()=>{ $("searchInput").value=""; document.querySelectorAll(".account-people").forEach(x=>x.classList.remove("focus-account")); $(btn.dataset.account+"-people")?.classList.add("focus-account"); renderPeople(mk,btn.dataset.account); document.querySelector("#peopleList")?.scrollIntoView({behavior:"smooth",block:"start"}); }));
}
function renderPeople(mk,accountFilter=null){
  const query=$("searchInput").value.trim().toLowerCase(), el=$("peopleList");
  const accountsToRender=accountFilter ? data.accounts.filter(a=>a.id===accountFilter) : data.accounts;
  el.innerHTML=accountsToRender.map(a=>{
    const people=data.members.filter(m=>m.accountId===a.id && (!query||m.name.toLowerCase().includes(query)));
    if(!people.length) return "";
    return `<div class="account-people" id="${a.id}-people"><div class="people-group-title"><span>${escapeHtml(a.name)}</span><small>${people.length} member${people.length===1?"":"s"}</small></div>${people.map(m=>{
      const debt=totalDebtForMember(m,mk), settled=debt<=0;
      return `<button class="person-row ${settled?"is-settled":""}" data-member="${m.id}"><div class="person-main"><h3 class="person-name">${escapeHtml(m.name)}</h3><div class="sub">Last payment: ${lastPaymentLabel(m.id)}</div></div><div class="debt-badge"><small>${settled?"Settled":"Total debt"}</small><strong>${money(debt)}</strong></div></button>`;
    }).join("")}</div>`;
  }).join("") || `<div class="empty">No members found.</div>`;
  el.querySelectorAll("[data-member]").forEach(btn=>btn.addEventListener("click",()=>openMemberDetail(btn.dataset.member)));
}
function renderPayments(mk){
  const el=$("paymentsList"), payments=data.payments.filter(p=>p.month===mk).sort((a,b)=>(b.date||"").localeCompare(a.date||""));
  if(!payments.length){el.innerHTML=`<div class="empty">No payments recorded for this month.</div>`;return;}
  el.innerHTML=payments.map(p=>{const m=member(p.memberId);return `<div class="payment-row"><div><strong>${escapeHtml(m?.name||"Unknown")}</strong><div class="sub">${p.date}${p.note?` · ${escapeHtml(p.note)}`:""}</div></div><strong>${money(p.amount)}</strong></div>`;}).join("");
}
function populateMemberSelects(){
  $("paymentMember").innerHTML=data.members.map(m=>`<option value="${m.id}">${escapeHtml(m.name)}</option>`).join("")||`<option value="">No members</option>`;
  $("memberAccount").innerHTML=data.accounts.map(a=>`<option value="${a.id}">${escapeHtml(a.name)}</option>`).join("");
}
function openSheet(id){ $("backdrop").classList.add("show"); $(id).classList.add("show"); $(id).setAttribute("aria-hidden","false"); }
function closeSheets(){ document.querySelectorAll(".sheet.show").forEach(s=>{s.classList.remove("show");s.setAttribute("aria-hidden","true")}); $("backdrop").classList.remove("show"); }
function openPaymentSheet(memberId=null){
  $("paymentForm").reset(); populateMemberSelects(); $("paymentMember").value=memberId||data.members[0]?.id||"";
  $("paymentMonth").value=monthKey(viewedMonth); $("paymentDate").value=todayKey(); openSheet("paymentSheet"); setTimeout(()=>$("paymentAmount").focus(),250);
}
function openMemberSheet(memberId=null){
  $("memberForm").reset(); $("memberForm").dataset.editing=memberId||""; $("memberSheetTitle").textContent=memberId?"Edit member":"Add member";
  populateMemberSelects();
  if(memberId){const m=member(memberId); $("memberName").value=m.name;$("memberAccount").value=m.accountId;$("memberPrice").value=m.monthlyPrice;$("memberMarker").value=m.marker||"";}
  else {$("memberPrice").value=15;$("memberMarker").value="";}
  openSheet("memberSheet");
}
function openAccountsSheet(){renderAccountEditor();openSheet("accountsSheet");}
function renderAccountEditor(){
  $("accountEditor").innerHTML=data.accounts.map(a=>`<div class="editor-row"><input data-account-name="${a.id}" value="${escapeAttr(a.name)}" maxlength="40"/><button class="danger" data-delete-account="${a.id}">Delete</button></div>`).join("");
  $("accountEditor").querySelectorAll("[data-account-name]").forEach(input=>input.addEventListener("change",()=>{const a=account(input.dataset.accountName);if(a){a.name=input.value.trim()||a.name;saveData();render();}}));
  $("accountEditor").querySelectorAll("[data-delete-account]").forEach(btn=>btn.addEventListener("click",()=>{if(data.accounts.length<=1)return toast("Keep at least one account.");const id=btn.dataset.deleteAccount;if(data.members.some(m=>m.accountId===id))return toast("Move or delete its members first.");data.accounts=data.accounts.filter(a=>a.id!==id);saveData();renderAccountEditor();render();toast("Account deleted");}));
}
function openMemberDetail(id){
  const m=member(id);if(!m)return; const mk=monthKey(viewedMonth), debt=totalDebtForMember(m,mk);
  $("detailName").textContent=m.name;
  $("memberDetail").innerHTML=`<div class="detail-summary"><div class="detail-box"><span>${monthNames[viewedMonth.getMonth()]} debt</span><strong>${money(debt)}</strong></div><div class="detail-box"><span>Settled through</span><strong>${escapeHtml(m.markerMonth||"—")}</strong></div></div><button class="save-button" id="detailAddPayment">＋ Add payment</button><button class="save-button secondary" id="detailEditMember">Edit member</button><div style="height:18px"></div><div class="eyebrow">RECORDED PAYMENTS</div><div>${data.payments.filter(p=>p.memberId===m.id).slice().sort((a,b)=>(b.date||"").localeCompare(a.date||"")).map(p=>`<div class="history-row"><div><strong>${p.date||"Recorded"}</strong><small>${p.month||""}${p.note?` · ${escapeHtml(p.note)}`:""}</small></div><strong>${money(p.amount)}</strong></div>`).join("")||`<div class="empty">No payment records yet.</div>`}</div>`;
  $("detailAddPayment").onclick=()=>{closeSheets();openPaymentSheet(id)}; $("detailEditMember").onclick=()=>{closeSheets();openMemberSheet(id)}; openSheet("memberDetailSheet");
}

$("paymentForm").addEventListener("submit",e=>{e.preventDefault();const memberId=$("paymentMember").value,amount=Number($("paymentAmount").value);if(!memberId||!amount||amount<=0)return;data.payments.push({id:uid("pay"),memberId,amount,month:$("paymentMonth").value,date:$("paymentDate").value,note:$("paymentNote").value.trim()});saveData();const paidMember=member(memberId);closeSheets();viewedMonth=new Date(Number($("paymentMonth").value.slice(0,4)),Number($("paymentMonth").value.slice(5,7))-1,1);render();toast(`${money(amount)} recorded for ${paidMember?.name||"member"}`);});
$("memberForm").addEventListener("submit",e=>{e.preventDefault();const editing=$("memberForm").dataset.editing,payload={name:$("memberName").value.trim(),accountId:$("memberAccount").value,monthlyPrice:Number($("memberPrice").value),marker:$("memberMarker").value,markerMonth:markerLegend[$("memberMarker").value]||""};if(!payload.name||payload.monthlyPrice<0)return;if(editing)Object.assign(member(editing),payload);else data.members.push({id:uid("member"),...payload});saveData();closeSheets();render();toast(editing?"Member updated":"Member added");});
$("addAccountButton").addEventListener("click",()=>{data.accounts.push({id:uid("account"),name:`Account ${data.accounts.length+1}`,monthlyDefault:15});saveData();renderAccountEditor();render();toast("Account added")});
$("searchInput").addEventListener("input",()=>renderPeople(monthKey(viewedMonth)));
$("clearSearch").addEventListener("click",()=>{$("searchInput").value="";renderPeople(monthKey(viewedMonth));$("searchInput").focus()});
$("prevMonth").addEventListener("click",()=>{viewedMonth=new Date(viewedMonth.getFullYear(),viewedMonth.getMonth()-1,1);render()});
$("nextMonth").addEventListener("click",()=>{viewedMonth=new Date(viewedMonth.getFullYear(),viewedMonth.getMonth()+1,1);render()});
$("monthTitle").addEventListener("click",()=>{const now=new Date();viewedMonth=new Date(now.getFullYear(),now.getMonth(),1);render();toast("Returned to current month")});
$("enterApp").onclick=()=>{$("splash").classList.add("hide");setTimeout(()=>$("splash")?.remove(),800)};
$("homeBrand").onclick=()=>window.scrollTo({top:0,behavior:"smooth"}); $("homeTab").onclick=()=>window.scrollTo({top:0,behavior:"smooth"});
$("addMember").onclick=()=>openMemberSheet();$("manageAccounts").onclick=()=>openAccountsSheet();$("settingsTab").onclick=()=>openAccountsSheet();
document.querySelectorAll("[data-close]").forEach(btn=>btn.addEventListener("click",closeSheets));$("backdrop").addEventListener("click",closeSheets);
document.querySelectorAll(".tab[data-tab]").forEach(tab=>tab.addEventListener("click",()=>{document.querySelectorAll(".tab").forEach(t=>t.classList.remove("active"));tab.classList.add("active");const target=tab.dataset.tab;if(target==="people")$("peopleList").scrollIntoView({behavior:"smooth"});if(target==="payments")$("paymentsList").scrollIntoView({behavior:"smooth"});if(target==="overview")window.scrollTo({top:0,behavior:"smooth"})}));
function toast(message){const el=$("toast");el.textContent=message;el.classList.add("show");clearTimeout(window.__toast);window.__toast=setTimeout(()=>el.classList.remove("show"),1800)}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]))}
function escapeAttr(s){return escapeHtml(s)}

render();
