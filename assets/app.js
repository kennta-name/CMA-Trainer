/* =====================================================================
   CMA Trainer 共通スクリプト
   - 画面の枠（上部タブ・左メニュー）の描画
   - 学習データの保存（localStorage。使えない環境ではページ内メモリ）
   - トースト / モーダル / 右パネル / ポップアップメニュー
   - ポリシー画面エンジン（Apply → Save → Publish / Discard / Compare）
   - 研修ミッション
   ===================================================================== */
(function () {
  "use strict";
  const App = (window.App = {});
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  App.$ = $; App.$$ = $$;
  const esc = (v) => String(v == null ? "" : v).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  App.esc = esc;
  const clone = (o) => JSON.parse(JSON.stringify(o));
  App.clone = clone;
  const uid = () => "x" + Math.random().toString(36).slice(2, 9);
  App.uid = uid;

  /* ---------------- 保存 ---------------- */
  const PREFIX = "cmaTrainer.v1.";
  const mem = {};
  App.db = {
    get(key, seed) {
      try {
        const v = localStorage.getItem(PREFIX + key);
        if (v !== null) return JSON.parse(v);
      } catch (e) { if (key in mem) return clone(mem[key]); }
      if (key in mem) return clone(mem[key]);
      const s = typeof seed === "function" ? seed() : seed;
      if (s === undefined || s === null) return s;
      App.db.set(key, s);
      return clone(s);
    },
    set(key, value) {
      mem[key] = clone(value);
      try { localStorage.setItem(PREFIX + key, JSON.stringify(value)); } catch (e) { /* メモリのみ */ }
    },
    resetAll() {
      Object.keys(mem).forEach((k) => delete mem[k]);
      try {
        Object.keys(localStorage).filter((k) => k.startsWith(PREFIX)).forEach((k) => localStorage.removeItem(k));
      } catch (e) { /* noop */ }
    }
  };

  App.trainee = () => App.db.get("trainee", { name: "研修 太郎", email: "trainee@example.com" });

  /* ---------------- 日時 ---------------- */
  const pad = (n) => String(n).padStart(2, "0");
  App.fmt = (t) => { const d = new Date(t); return `${d.getFullYear()}/${pad(d.getMonth() + 1)}/${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`; };
  App.fmtShort = (t) => { const d = new Date(t); return `${pad(d.getMonth() + 1)}/${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`; };

  /* ---------------- アイコン ---------------- */
  const P = {
    target: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/>',
    bars: '<path d="M5 20V10M12 20V4M19 20v-7"/>',
    table: '<rect x="4" y="5" width="16" height="14" rx="1"/><path d="M4 10h16M10 10v9"/>',
    nodes: '<circle cx="12" cy="6" r="2.2"/><circle cx="6" cy="17" r="2.2"/><circle cx="18" cy="17" r="2.2"/><path d="M12 8.2v3M10.5 12.5l-3 3M13.5 12.5l3 3"/>',
    grid: '<path d="M5 5h3v3H5zM10.5 5h3v3h-3zM16 5h3v3h-3zM5 10.5h3v3H5zM10.5 10.5h3v3h-3zM16 10.5h3v3h-3zM5 16h3v3H5zM10.5 16h3v3h-3zM16 16h3v3h-3z"/>',
    route: '<circle cx="6" cy="6" r="2"/><circle cx="18" cy="18" r="2"/><path d="M8 6h6a4 4 0 0 1 0 8H10a4 4 0 0 0 0 8"/>',
    list: '<path d="M5 6h14M5 12h14M5 18h14"/>',
    shield: '<path d="M12 3l7 3v5c0 5-3.5 8.5-7 10-3.5-1.5-7-5-7-10V6z"/>',
    hex: '<path d="M12 3l8 4.5v9L12 21l-8-4.5v-9z"/>',
    check: '<rect x="4" y="4" width="16" height="16" rx="2"/><path d="M8 12l3 3 5-6"/>',
    site: '<rect x="6" y="3" width="12" height="18" rx="1"/><path d="M9 7h2M13 7h2M9 11h2M13 11h2M9 15h2M13 15h2"/>',
    users: '<circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2.4"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6M15 14.5c3 0 6 2 6 5.5"/>',
    user: '<circle cx="12" cy="8" r="3.5"/><path d="M5 20c0-3.9 3.1-7 7-7s7 3.1 7 7"/>',
    globe: '<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c2.5 2.6 3.5 5.4 3.5 8.5s-1 5.9-3.5 8.5c-2.5-2.6-3.5-5.4-3.5-8.5S9.5 6.1 12 3.5z"/>',
    lock: '<rect x="5" y="11" width="14" height="9" rx="1.5"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
    fire: '<path d="M12 3c1 4 5 5.5 5 10a5 5 0 0 1-10 0c0-2.4 1.3-3.8 2.5-5 .3 1.6 1 2.6 2 3 0-3 .5-5.5.5-8z"/>',
    gauge: '<path d="M4 16a8 8 0 1 1 16 0"/><path d="M12 16l4-5"/>',
    ip: '<rect x="4" y="5" width="16" height="14" rx="2"/><path d="M8 9v6M11 15V9h2.5a1.8 1.8 0 0 1 0 3.6H11"/>',
    key: '<circle cx="8" cy="15" r="3.5"/><path d="M10.5 12.5L19 4M16 7l2 2M14 9l2 2"/>',
    admin: '<circle cx="10" cy="8" r="3.5"/><path d="M3 20c0-3.9 3.1-7 7-7 1.4 0 2.6.4 3.7 1"/><circle cx="18" cy="17" r="2.5"/><path d="M18 13v1.5M18 19.5V21M14 17h1.5M20.5 17H22"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    minus: '<path d="M5 12h14"/>',
    search: '<circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/>',
    refresh: '<path d="M19 8a8 8 0 1 0 1 5"/><path d="M19 3v5h-5"/>',
    bell: '<path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15z"/><path d="M10 20a2 2 0 0 0 4 0"/>',
    help: '<circle cx="12" cy="12" r="8.5"/><path d="M9.6 9.5a2.5 2.5 0 1 1 3.4 2.3c-.6.3-1 .8-1 1.5v.7M12 17h.01"/>',
    alert: '<rect x="4" y="4" width="16" height="16" rx="3"/><path d="M12 8v5M12 16h.01"/>',
    menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
    chev: '<path d="M9 6l6 6-6 6"/>',
    back: '<path d="M15 6l-6 6 6 6"/>',
    locate: '<circle cx="12" cy="12" r="5"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3"/>',
    shrink: '<path d="M14 10l6-6M14 10h4.5M14 10V5.5M10 14l-6 6M10 14H5.5M10 14v4.5"/>',
    download: '<path d="M12 4v11M7 10l5 5 5-5M5 20h14"/>',
    flag: '<path d="M5 21V4M5 4h11l-2 4 2 4H5"/>',
    trash: '<path d="M5 7h14M10 7V4h4v3M7 7l1 13h8l1-13"/>',
    socket: '<rect x="3" y="8" width="18" height="8" rx="1.5"/><path d="M7 12h.01M10 12h.01M14 12h3"/>',
    cloud: '<path d="M7 18a4.5 4.5 0 0 1-.6-9A6 6 0 0 1 18 9.5a4.3 4.3 0 0 1-1 8.5z"/>',
    book: '<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z"/><path d="M4 20.5A2.5 2.5 0 0 0 6.5 23H20v-5"/><path d="M8 7h8M8 11h6"/>'
  };
  App.icon = (name, cls = "") => `<svg class="icon ${cls}" viewBox="0 0 24 24" aria-hidden="true">${P[name] || P.list}</svg>`;

  /* ---------------- ナビゲーション定義 ----------------
     href が null の項目は「研修版では未収録」としてトースト表示 */
  const NAV = {
    monitoring: { label: "Monitoring", home: "topology.html", sections: [
      { t: "INVESTIGATION", items: [
        ["topology", "Topology", "topology.html", "target"], ["events", "Events", "events.html", "bars"],
        ["sites-overview", "Sites Overview", "sites-overview.html", "table"], ["sdp-overview", "SDP Users Overview", "sdp-overview.html", "nodes"],
        ["app-analytics", "App Analytics", "app-analytics.html", "grid"], ["routing-table", "Routing Table", "routing-table.html", "route"],
        ["audit-trail", "Audit Trail", "audit-trail.html", "list"]] },
      { t: "DASHBOARDS", items: [
        ["security-threats", "Security Threats", "security-threats.html", "shield"], ["mitre", "MITRE ATT&CK", "mitre.html", "shield"], ["cloud-apps", "Cloud Apps", "cloud-apps.html", "hex"],
        ["dlp-dashboard", "DLP", "dlp-dashboard.html", "shield"], ["saas-security", "SaaS Security API", "saas-security.html", "shield"], ["sdp-dashboard", "SDP Users", "sdp-dashboard.html", "nodes"], ["network-dashboard", "Network Dashboard", "network-dashboard.html", "grid"]] },
      { t: "PRACTICES ASSESSMENT", items: [["best-practices", "Best Practices", "best-practices.html", "check"]] },
      { t: "DETECTION & RESPONSE", items: [["stories-dashboard", "Stories Dashboard", "stories-dashboard.html", "table"], ["stories-workbench", "Stories Workbench", "stories-workbench.html", "shield"]] }
    ] },
    network: { label: "Network", home: "sites.html", sections: [
      { t: "SITES", items: [["sites", "Sites", "sites.html", "site"], ["groups", "Groups", "groups.html", "grid"]] },
      { t: "ROUTING & OPTIMIZATION", items: [
        ["network-rules", "Network Rules", "network-rules.html", "route"],
        ["bandwidth", "Bandwidth Management", "bandwidth.html", "gauge"],
        ["ip-allocation", "IP Allocation", "ip-allocation.html", "ip"],
        ["dns", "DNS Settings", "dns-settings.html", "globe"]] }
    ] },
    access: { label: "Access", home: "users.html", sections: [
      { t: "USERS", items: [["users", "Users", "users.html", "users"], ["directory", "Directory Services", "directory-services.html", "nodes"]] },
      { t: "CLIENT POLICIES", items: [
        ["client-connectivity", "Client Connectivity Policy", "client-connectivity.html", "key"],
        ["posture", "Device Posture", "device-posture.html", "check"]] }
    ] },
    security: { label: "Security", home: "internet-firewall.html", sections: [
      { t: "CATO FIREWALLS", items: [
        ["internet-firewall", "Internet Firewall", "internet-firewall.html", "fire"],
        ["wan-firewall", "WAN Firewall", "wan-firewall.html", "fire"]] },
      { t: "THREAT PROTECTION", items: [
        ["tls", "TLS Inspection", "tls-inspection.html", "lock"],
        ["threat", "Threat Prevention", "threat-prevention.html", "shield"], ["casb", "Application Control", "app-control.html", "hex"], ["dlp", "Data Protection", "data-protection.html", "shield"]] }
    ] },
    assets: { label: "Assets", home: "device-inventory.html", sections: [
      { t: "ASSETS", items: [["device-inventory", "Device Inventory", "device-inventory.html", "grid"]] }
    ] },
    administration: { label: "Administration", home: "administrators.html", sections: [
      { t: "ADMINISTRATION", items: [
        ["administrators", "Administrators", "administrators.html", "admin"],
        ["license", "License", "license.html", "key"], ["api", "API Keys", "api-keys.html", "key"]] },
      { t: "TRAINING", items: [["whats-new", "What's New", "whats-new.html", "bell"]] }
    ] }
  };
  App.NAV = NAV;

  function renderShell() {
    const body = document.body;
    const tab = body.dataset.tab;
    const page = body.dataset.page;
    const main = $("#main");
    if (!main || !tab) return;

    const top = document.createElement("header");
    top.className = "topbar";
    top.innerHTML = `
      <button class="top-ico menu-btn" id="menuBtn" type="button" aria-label="メニューを開く">${App.icon("menu")}</button>
      <a class="logo" href="topology.html" title="CMA Trainer（学習用）"><b>CMA TRAINER</b><small>学習用シミュレーター</small></a>
      <button class="apps-btn" type="button" id="appsBtn" aria-label="アプリ一覧" data-tip="すべての画面への近道を表示します。">${App.icon("grid")}</button>
      <nav class="tabs" aria-label="メインメニュー">
        ${Object.entries(NAV).map(([k, v]) => `<a href="${v.home}" class="${k === tab ? "active" : ""}">${v.label}</a>`).join("")}
      </nav>
      <div class="top-right">
        <a class="guide-btn" href="guide.html" data-tip="図解の操作要領（手順書）を開きます。まず必須でやることも載っています。">${App.icon("book")}<span>操作要領</span></a>
        <span class="train-pill" data-tip="これは実機ではなく、練習用のシミュレーターです。">TRAINING</span>
        <a class="whatsnew" href="whats-new.html" data-tip="新機能・変更点のお知らせを表示します（研修版では研修サイトの更新履歴）。">What's New</a>
        <button class="top-ico" type="button" id="alertBtn" aria-label="アラート" data-tip="アカウントの重要なお知らせ（切断中の拠点など）を表示します。">${App.icon("alert")}<span class="top-badge" id="alertBadge" hidden></span></button>
        <button class="top-ico" type="button" id="bellBtn" aria-label="通知" data-tip="最近の通知（設定変更・ミッション達成など）を表示します。">${App.icon("bell")}</button>
        <button class="top-ico" type="button" id="helpBtn" aria-label="画面の見方" data-tip="画面の見方と、まず最初にやることをもう一度表示します。">${App.icon("help")}</button>
      </div>`;
    body.insertBefore(top, body.firstChild);

    const side = document.createElement("aside");
    side.className = "sidebar";
    side.id = "sidebar";
    const custom = typeof App.customSidebar === "function" ? App.customSidebar() : null;
    side.innerHTML = `<button class="side-toggle" type="button" id="sideToggle" aria-label="メニューを閉じる">${App.icon("menu")}</button>` +
      (custom || NAV[tab].sections.map((s) => `
        <div class="side-sec"><h6>${esc(s.t)}</h6>
          ${s.items.map(([id, label, href, ic]) => href
            ? `<a class="side-item ${id === page ? "active" : ""}" href="${href}">${App.icon(ic)}${esc(label)}</a>`
            : `<button type="button" class="side-item na" data-na="${esc(label)}">${App.icon(ic)}${esc(label)}</button>`).join("")}
        </div>`).join(""));
    body.insertBefore(side, main);

    // パンくず
    const crumb = body.dataset.crumb;
    if (crumb) {
      const c = document.createElement("div");
      c.className = "crumb";
      c.innerHTML = `<a href="index.html">Accounts</a><span class="sep">/</span>${crumb}`;
      main.insertBefore(c, main.firstChild);
    }
    const note = document.createElement("p");
    note.className = "foot-note";
    note.textContent = "CMA Trainer は実機に触る前の操作練習用に作った非公式のシミュレーターです。実際の Cato Management Application ではありません。画面・項目は実機のアップデートで変わることがあります。";
    main.appendChild(note);

    document.addEventListener("click", (e) => {
      const na = e.target.closest("[data-na]");
      if (na) { e.preventDefault(); App.toast(`「${na.dataset.na || na.textContent.trim() || "この機能"}」は研修版では未収録です（実機には存在します）。`, "warn"); }
    });
    $("#helpBtn").addEventListener("click", () => App.tour());
    $("#appsBtn").addEventListener("click", (e) => App.flyout(e.currentTarget, "すべての画面", Object.values(NAV).map((v) => `<div class="fly-sec"><b>${v.label}</b>${v.sections.flatMap((s) => s.items).map(([, l, h]) => `<a href="${h}">${esc(l)}</a>`).join("")}</div>`).join(""), "wide"));
    const down = App.sites().filter((x) => x.status !== "Connected");
    if (down.length) { $("#alertBadge").hidden = false; $("#alertBadge").textContent = down.length; }
    $("#alertBtn").addEventListener("click", (e) => App.flyout(e.currentTarget, "Account Alerts", down.length ? down.map((x) => `<a class="fly-item" href="site.html" data-sel="${x.id}"><span class="dot ${x.status === "Disconnected" ? "ng" : "warn"}"></span><span><b>${esc(x.name)}</b> は ${x.status === "Disconnected" ? "切断中です" : "Socket 未接続です"}<small>${x.status === "Disconnected" ? "Snapshot で原因を確認してください" : "現地で Socket を接続してください"}</small></span></a>`).join("") : '<p class="muted" style="padding:10px 14px">重要なお知らせはありません。</p>'));
    $("#bellBtn").addEventListener("click", (e) => {
      const au = App.db.get("audit", seedAudit).slice(0, 6);
      App.flyout(e.currentTarget, "Notifications", au.map((a) => `<a class="fly-item" href="audit-trail.html"><span class="dot ${a.action === "Delete" ? "ng" : "ok"}"></span><span><b>${esc(a.module)}：${esc(a.action)}</b> ${esc(a.object)}<small>${App.fmtShort(a.t)} ／ ${esc(a.admin)}</small></span></a>`).join("") + '<a class="fly-more" href="audit-trail.html">Audit Trail をすべて見る →</a>');
    });
    document.addEventListener("click", (e) => { const a = e.target.closest("[data-sel]"); if (a) App.db.set("selectedSite", a.dataset.sel); });
    $("#menuBtn").addEventListener("click", () => body.classList.toggle("side-open"));
    $("#sideToggle").addEventListener("click", () => {
      if (matchMedia("(max-width: 900px)").matches) body.classList.remove("side-open");
      else App.toast("サイドメニューの折りたたみは研修版では省略しています。", "warn");
    });
    main.addEventListener("click", () => body.classList.remove("side-open"));
  }

  /* ---------------- トースト ---------------- */
  App.toast = (msg, type = "ok", ms = 4200) => {
    let box = $(".toasts");
    if (!box) { box = document.createElement("div"); box.className = "toasts"; box.setAttribute("role", "status"); document.body.appendChild(box); }
    const t = document.createElement("div");
    t.className = "toast " + type;
    t.innerHTML = `<span>${msg}</span>`;
    box.appendChild(t);
    setTimeout(() => t.remove(), ms);
  };

  /* ---------------- モーダル（confirm の代わり） ---------------- */
  App.modal = ({ title, body, ok = "OK", cancel = "Cancel", danger = false, onOk }) => {
    const m = document.createElement("div");
    m.className = "modal";
    m.setAttribute("role", "dialog");
    m.setAttribute("aria-modal", "true");
    m.innerHTML = `<div class="modal-card"><h3>${esc(title)}</h3><div class="mb">${body}</div>
      <div class="mf">${cancel ? `<button class="btn" data-c>${esc(cancel)}</button>` : ""}<button class="btn ${danger ? "btn-danger" : "btn-primary"}" data-o>${esc(ok)}</button></div></div>`;
    document.body.appendChild(m);
    const close = () => m.remove();
    m.addEventListener("click", (e) => {
      if (e.target === m || e.target.hasAttribute("data-c")) close();
      if (e.target.hasAttribute("data-o")) { close(); onOk && onOk(); }
    });
    m.addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });
    $("[data-o]", m).focus();
  };

  /* ---------------- ポップアップメニュー ---------------- */
  App.pop = (anchor, items) => {
    $$(".pop").forEach((p) => p.remove());
    const p = document.createElement("div");
    p.className = "pop";
    p.innerHTML = items.map((it, i) => `<button type="button" data-i="${i}" class="${it.danger ? "danger" : ""}">${esc(it.label)}</button>`).join("");
    document.body.appendChild(p);
    const r = anchor.getBoundingClientRect();
    const w = p.offsetWidth;
    p.style.top = Math.min(r.bottom + 4, innerHeight - p.offsetHeight - 8) + "px";
    p.style.left = Math.max(8, Math.min(r.right - w, innerWidth - w - 8)) + "px";
    const off = (e) => { if (!p.contains(e.target)) { p.remove(); document.removeEventListener("mousedown", off); } };
    setTimeout(() => document.addEventListener("mousedown", off));
    p.addEventListener("click", (e) => {
      const b = e.target.closest("button"); if (!b) return;
      p.remove(); document.removeEventListener("mousedown", off);
      items[+b.dataset.i].run();
    });
  };

  /* ---------------- フォーム部品 ----------------
     field: {key,label,type:text|select|picker|toggle|textarea|number|info, options, help, req, showIf(model), rerender} */
  function fieldHTML(f, model) {
    const v = model[f.key];
    const id = "f_" + f.key;
    const opts = typeof f.options === "function" ? f.options(model) : (f.options || []);
    const lab = `<label for="${id}" class="${f.req ? "req" : ""}">${esc(f.label)}</label>`;
    const help = f.help ? `<span class="help">${f.help}</span>` : "";
    switch (f.type) {
      case "info": return `<div class="tip">${f.html}</div>`;
      case "toggle":
        return `<div class="field"><label class="switch"><input type="checkbox" id="${id}" data-k="${f.key}" ${v ? "checked" : ""}><span class="track"></span>${esc(f.label)}</label>${help}</div>`;
      case "check":
        return `<div class="field"><label class="check"><input type="checkbox" id="${id}" data-k="${f.key}" ${v ? "checked" : ""}>${esc(f.label)}</label>${help}</div>`;
      case "select":
        return `<div class="field">${lab}<select class="select" id="${id}" data-k="${f.key}">${opts.map((o) => {
          const [val, txt] = Array.isArray(o) ? o : [o, o];
          return `<option value="${esc(val)}" ${String(val) === String(v) ? "selected" : ""}>${esc(txt)}</option>`;
        }).join("")}</select>${help}</div>`;
      case "textarea":
        return `<div class="field">${lab}<textarea class="input" id="${id}" data-k="${f.key}">${esc(v)}</textarea>${help}</div>`;
      case "picker": {
        const arr = Array.isArray(v) ? v : [];
        return `<div class="field"><span class="lbl">${esc(f.label)}</span><div class="picker" data-pk="${f.key}">
          <div class="chips">${arr.length ? arr.map((x, i) => `<span class="chip">${esc(x)}<button type="button" data-rm="${i}" aria-label="${esc(x)}を削除">×</button></span>`).join("") : `<span class="chip any">${esc(f.anyLabel || "Any")}</span>`}</div>
          <div class="picker-add"><select class="select" id="${id}" aria-label="${esc(f.label)}を追加"><option value="">＋ 追加する対象を選択…</option>${opts.filter((o) => !arr.includes(o)).map((o) => `<option>${esc(o)}</option>`).join("")}</select></div>
          </div>${help}</div>`;
      }
      default:
        return `<div class="field">${lab}<input class="input" id="${id}" data-k="${f.key}" type="${f.type === "number" ? "number" : "text"}" value="${esc(v)}" placeholder="${esc(f.placeholder || "")}" autocomplete="off">${help}</div>`;
    }
  }
  function summarize(sec, model) {
    if (sec.summary) return sec.summary(model);
    const vals = sec.fields.filter((f) => f.type === "picker").map((f) => (model[f.key] || []).length ? model[f.key].join(", ") : "Any");
    if (vals.length) return vals.join(" / ");
    const s = sec.fields.find((f) => f.type === "select");
    return s ? (Array.isArray(model[s.key]) ? "" : model[s.key]) : "";
  }

  /* ---------------- 右側パネル ----------------
     App.panel({title, model, sections:[{title, fields, open}], applyLabel, onApply(model)→bool, onDelete, extraFooter}) */
  App.panel = (cfg) => {
    App.closePanel();
    const model = cfg.model;
    const scrim = document.createElement("div"); scrim.className = "scrim";
    const el = document.createElement("aside"); el.className = "panel"; el.setAttribute("role", "dialog"); el.setAttribute("aria-label", cfg.title);
    const openState = cfg.sections.map((s, i) => s.open !== undefined ? s.open : i === 0);
    function draw() {
      el.innerHTML = `<div class="panel-h"><h3>${esc(cfg.title)}</h3><button class="x" type="button" data-close aria-label="閉じる">×</button></div>
        <div class="panel-b">${cfg.intro ? `<div class="tip" style="margin-top:12px">${cfg.intro}</div>` : ""}
        ${cfg.sections.map((s, i) => {
          const fields = s.fields.filter((f) => !f.showIf || f.showIf(model));
          if (!fields.length || (s.showIf && !s.showIf(model))) return "";
          return `<div class="acc ${openState[i] ? "open" : ""}" data-s="${i}">
            <button type="button" class="acc-h" data-acc="${i}">${App.icon("chev", "chev")}${esc(s.title)}<span class="sum">${esc(summarize(s, model))}</span></button>
            <div class="acc-b">${fields.map((f) => fieldHTML(f, model)).join("")}</div></div>`;
        }).join("")}</div>
        <div class="panel-f">${cfg.onDelete ? `<button class="btn btn-danger left" type="button" data-del>${App.icon("trash")}Delete</button>` : ""}
          <button class="btn" type="button" data-close>Cancel</button>
          <button class="btn btn-primary" type="button" data-apply>${esc(cfg.applyLabel || "Apply")}</button></div>`;
    }
    const allFields = () => cfg.sections.flatMap((s) => s.fields);
    function read() {
      $$("[data-k]", el).forEach((inp) => {
        const f = allFields().find((x) => x.key === inp.dataset.k);
        if (!f) return;
        model[f.key] = inp.type === "checkbox" ? inp.checked : (f.type === "number" ? Number(inp.value) : inp.value);
      });
    }
    draw();
    document.body.append(scrim, el);
    const firstInput = $(".panel-b input.input, .panel-b select", el);
    if (firstInput) firstInput.focus();
    el.addEventListener("click", (e) => {
      const acc = e.target.closest("[data-acc]");
      if (acc) { read(); const i = +acc.dataset.acc; openState[i] = !openState[i]; draw(); return; }
      const rm = e.target.closest("[data-rm]");
      if (rm) { read(); const k = rm.closest("[data-pk]").dataset.pk; model[k].splice(+rm.dataset.rm, 1); draw(); return; }
      if (e.target.closest("[data-close]")) { App.closePanel(); return; }
      if (e.target.closest("[data-del]")) { cfg.onDelete(); return; }
      if (e.target.closest("[data-apply]")) {
        read();
        const ok = cfg.onApply(model);
        if (ok !== false) App.closePanel();
      }
    });
    el.addEventListener("change", (e) => {
      const pk = e.target.closest("[data-pk]");
      if (pk && e.target.value) { read(); const k = pk.dataset.pk; model[k] = (model[k] || []).concat(e.target.value); draw(); return; }
      const f = allFields().find((x) => x.key === e.target.dataset.k);
      if (f && f.rerender) { read(); draw(); }
    });
    el.addEventListener("keydown", (e) => { if (e.key === "Escape") App.closePanel(); });
    scrim.addEventListener("click", App.closePanel);
    return { el, model, redraw: () => { read(); draw(); } };
  };
  App.closePanel = () => { $$(".panel, .scrim").forEach((n) => n.remove()); };

  /* ---------------- 監査ログ（Audit Trail） ---------------- */
  App.audit = (module, action, object, detail = "") => {
    const list = App.db.get("audit", seedAudit);
    const me = App.trainee();
    list.unshift({ t: Date.now(), admin: me.email || "trainee@example.com", module, action, object, detail, mine: true });
    App.db.set("audit", list.slice(0, 300));
  };
  function seedAudit() {
    const now = Date.now(), h = 3600e3;
    return [
      { t: now - 20 * h, admin: "yamada.admin@example.co.jp", module: "Internet Firewall", action: "Publish", object: "Revision #3", detail: "ルール「Block Uncategorized」を追加" },
      { t: now - 45 * h, admin: "msp-operator@partner.example", module: "Sites", action: "Update", object: "JP-OSA-BR01", detail: "WAN2 を Last Resort（LTE）に変更" },
      { t: now - 70 * h, admin: "yamada.admin@example.co.jp", module: "Administrators", action: "Create", object: "msp-operator@partner.example", detail: "Role: Editor" }
    ];
  }
  App.seedAudit = seedAudit;

  /* ---------------- 研修ミッション ---------------- */
  App.MISSIONS = [
    ["start", "研修を開始する", "開始画面で名前を入力して［研修を開始］", "index.html"],
    ["topo_site", "Topology から切断中の拠点を開く", "Monitoring > Topology で赤い拠点をクリック", "topology.html"],
    ["events_block", "Events を Action = Block で絞り込む", "Monitoring > Events の左の Action を展開して Include", "events.html"],
    ["ifw_allow", "Internet Firewall に Allow ルールを追加して Publish", "Security > Internet Firewall → New → Apply → Save → Publish", "internet-firewall.html"],
    ["wan_rule", "WAN Firewall に許可ルールを追加して Publish", "Security > WAN Firewall（最後は暗黙の Block）", "wan-firewall.html"],
    ["tls_bypass", "TLS Inspection を有効化し、Bypass ルールを追加して Publish", "Security > TLS Inspection", "tls-inspection.html"],
    ["ip_alloc", "固定の送信元IPを割り当てる", "Network > IP Allocation → ロケーション選択 → Save", "ip-allocation.html"],
    ["nr_nat", "Network Rule で NAT に Allocated IP を指定して Publish", "Network > Network Rules → Rule Type: Internet → Configuration", "network-rules.html"],
    ["nr_qos", "Web会議ルールの Bandwidth Priority を上げて Publish", "Network > Network Rules（数字が小さいほど優先）", "network-rules.html"],
    ["site_add", "新しい拠点（サイト）を追加する", "Network > Sites → New → Apply", "sites.html"],
    ["admin_add", "管理者アカウントを追加する", "Administration > Administrators → New → Apply", "administrators.html"],
    ["ccp_rule", "Client Connectivity Policy にルールを追加して Publish", "Access > Client Connectivity Policy", "client-connectivity.html"],
    ["audit_check", "Audit Trail で自分の変更を確認する", "Monitoring > Audit Trail（何か変更した後に）", "audit-trail.html"],
    ["dns_fwd", "社内ドメインの DNS 転送先を設定する", "Network > DNS Settings → Domain Forwarding に追加 → Save", "dns-settings.html"],
    ["bp_check", "Best Practices の未対応項目を1つ開いて対処する", "Monitoring > Best Practices →［対処する］", "best-practices.html"]
  ];
  App.complete = (id) => {
    const done = App.db.get("missions", {});
    if (done[id]) return;
    done[id] = Date.now();
    App.db.set("missions", done);
    const m = App.MISSIONS.find((x) => x[0] === id);
    if (m) setTimeout(() => App.toast(`ミッション達成：${m[1]}`, "ok", 5000), 400);
    renderMissions();
  };
  function renderMissions() {
    const done = App.db.get("missions", {});
    const n = App.MISSIONS.filter((m) => done[m[0]]).length;
    let fab = $(".mission-fab");
    if (!fab) {
      fab = document.createElement("button");
      fab.className = "mission-fab"; fab.type = "button"; fab.setAttribute("aria-expanded", "false");
      document.body.appendChild(fab);
      fab.addEventListener("click", () => {
        const d = $(".missions");
        d.hidden = !d.hidden;
        fab.setAttribute("aria-expanded", String(!d.hidden));
        try { sessionStorage.setItem(PREFIX + "drawer", d.hidden ? "0" : "1"); } catch (e) { /* noop */ }
      });
    }
    fab.innerHTML = `${App.icon("flag")}研修ミッション<span class="prog">${n} / ${App.MISSIONS.length}</span>`;
    let d = $(".missions");
    if (!d) {
      d = document.createElement("section"); d.className = "missions"; d.hidden = true; d.setAttribute("aria-label", "研修ミッション");
      document.body.appendChild(d);
      try { if (sessionStorage.getItem(PREFIX + "drawer") === "1") { d.hidden = false; fab.setAttribute("aria-expanded", "true"); } } catch (e) { /* noop */ }
      d.addEventListener("click", (e) => {
        if (e.target.closest("[data-reset]")) {
          App.modal({ title: "研修データのリセット", body: "追加したルール・拠点・管理者、ミッションの達成状況をすべて初期状態に戻します。", ok: "リセット", danger: true,
            onOk: () => { App.db.resetAll(); location.href = "index.html"; } });
        }
        if (e.target.closest("[data-hide]")) { d.hidden = true; fab.setAttribute("aria-expanded", "false"); try { sessionStorage.setItem(PREFIX + "drawer", "0"); } catch (er) { /* noop */ } }
      });
    }
    d.innerHTML = `<div class="missions-h"><h3>研修ミッション</h3><p>操作要領PDFの手順を、この画面で実際に操作して確かめましょう。</p>
      <div class="mbar"><i style="width:${(n / App.MISSIONS.length) * 100}%"></i></div></div>
      <ol class="mlist">${App.MISSIONS.map(([id, t, p, href], i) => `<li class="${done[id] ? "done" : ""}"><span class="mk">${done[id] ? "✓" : i + 1}</span>
        <div><div class="mt">${esc(t)}</div><div class="mp">${esc(p)}　<a href="${href}">開く →</a></div></div></li>`).join("")}</ol>
      <div class="missions-f"><button class="btn btn-text" type="button" data-reset data-tip="追加したルール・拠点・管理者と、ミッションの達成状況を初期状態に戻します。">研修データをリセット</button><a class="btn" href="guide.html">${App.icon("book")}操作要領</a><button class="btn" type="button" data-hide>閉じる</button></div>`;
  }
  App.renderMissions = renderMissions;

  /* ---------------- 上部バーのドロップダウン ---------------- */
  App.flyout = (anchor, title, html, cls = "") => {
    const ex = $(".flyout"); if (ex) { const same = ex.dataset.for === anchor.id; ex.remove(); if (same) return; }
    const f = document.createElement("div");
    f.className = "flyout " + cls; f.dataset.for = anchor.id || "";
    f.innerHTML = `<div class="fly-h">${esc(title)}</div><div class="fly-b">${html}</div>`;
    document.body.appendChild(f);
    const r = anchor.getBoundingClientRect();
    f.style.top = r.bottom + 6 + "px";
    f.style.left = Math.max(8, Math.min(r.right - f.offsetWidth, innerWidth - f.offsetWidth - 8)) + "px";
    const off = (e) => { if (!f.contains(e.target) && !anchor.contains(e.target)) { f.remove(); document.removeEventListener("mousedown", off); } };
    setTimeout(() => document.addEventListener("mousedown", off));
  };

  /* ---------------- 表示部品（タイル・棒グラフ・ドーナツ・表） ---------------- */
  App.tiles = (arr) => `<div class="tiles">${arr.map((t) => `<div class="tile ${t.tone || ""}" data-tip="${esc(t.tip || t.label)}"><span class="tl">${esc(t.label)}</span><b class="tv">${esc(t.value)}</b>${t.sub ? `<span class="ts">${esc(t.sub)}</span>` : ""}</div>`).join("")}</div>`;
  App.bars = (items, opt = {}) => {
    const max = opt.max || Math.max(1, ...items.map((i) => i.value));
    return `<div class="bars">${items.map((i) => `<div class="bar-row" data-tip="${esc(i.tip || i.label + "：" + i.value + (opt.unit || ""))}"><span class="bl">${esc(i.label)}</span><span class="bt"><i style="width:${Math.max(2, (i.value / max) * 100)}%;background:${i.color || "var(--brand)"}"></i></span><span class="bv">${esc(i.text || i.value + (opt.unit || ""))}</span></div>`).join("")}</div>`;
  };
  App.donut = (segs, center, sub) => {
    const tot = segs.reduce((a, b) => a + b.value, 0) || 1;
    let ang = -Math.PI / 2, out = "";
    const R = 52, r = 34, cx = 64, cy = 64;
    segs.forEach((sg) => {
      const a2 = ang + (sg.value / tot) * Math.PI * 2;
      const big = a2 - ang > Math.PI ? 1 : 0;
      const p = (rad, a) => `${(cx + rad * Math.cos(a)).toFixed(2)},${(cy + rad * Math.sin(a)).toFixed(2)}`;
      const d = sg.value >= tot ? `M${cx},${cy - R}A${R},${R} 0 1 1 ${cx - 0.01},${cy - R}L${cx - 0.01},${cy - r}A${r},${r} 0 1 0 ${cx},${cy - r}Z` : `M${p(R, ang)}A${R},${R} 0 ${big} 1 ${p(R, a2)}L${p(r, a2)}A${r},${r} 0 ${big} 0 ${p(r, ang)}Z`;
      out += `<path d="${d}" fill="${sg.color}" data-tip="${esc(sg.tip || sg.label + "：" + sg.value + "（" + Math.round((sg.value / tot) * 100) + "%）")}"/>`;
      ang = a2;
    });
    return `<div class="donut"><svg viewBox="0 0 128 128" role="img" aria-label="${esc(center)}">${out}<text x="64" y="64" text-anchor="middle" font-size="18" font-weight="500" fill="#2b2f33">${esc(center)}</text><text x="64" y="80" text-anchor="middle" font-size="9" fill="#6b7178">${esc(sub || "")}</text></svg>
      <ul>${segs.map((sg) => `<li data-tip="${esc(sg.tip || sg.label + "：" + sg.value)}"><i style="background:${sg.color}"></i>${esc(sg.label)}<b>${sg.value}</b></li>`).join("")}</ul></div>`;
  };
  App.table = (cols, rows, opt = {}) => `<div class="tbl-wrap"><table class="tbl"><thead><tr>${cols.map((c) => `<th>${esc(c)}</th>`).join("")}</tr></thead><tbody>${rows.length ? rows.map((r) => `<tr class="${r.cls || ""}" ${r.tip ? `data-tip="${esc(r.tip)}"` : ""} ${r.attr || ""}>${r.cells.map((c) => `<td>${c}</td>`).join("")}</tr>`).join("") : `<tr><td colspan="${cols.length}" class="muted" style="text-align:center;padding:22px">${esc(opt.empty || "データがありません")}</td></tr>`}</tbody></table></div>`;
  App.card = (title, body, opt = {}) => `<div class="card ${opt.cls || ""}" ${opt.tip ? `data-tip="${esc(opt.tip)}"` : ""}><div class="card-h"><h2>${title}</h2>${opt.right || ""}</div><div class="${opt.flush ? "" : "card-b"}">${body}</div></div>`;
  App.sev = (s) => `<span class="badge ${s === "Critical" || s === "High" ? "b-ng" : s === "Medium" ? "b-warn" : "b-gray"}">${esc(s)}</span>`;
  App.timeRange = (id = "tr", def = "24h") => `<select class="select" id="${id}" style="width:auto" aria-label="期間" data-tip="表示する期間を切り替えます。">${[["1h", "Last 1 Hour"], ["24h", "Last 24 Hours"], ["7d", "Last 7 Days"], ["30d", "Last 30 Days"]].map(([v, l]) => `<option value="${v}" ${v === def ? "selected" : ""}>${l}</option>`).join("")}</select>`;

  /* ---------------- 共通マスタ（選択肢） ---------------- */
  App.sites = () => App.db.get("sites", seedSites);
  function seedSites() {
    return [
      { id: "s1", name: "JP-TKY-HQ", type: "Headquarters", conn: "Socket X1700", country: "Japan", city: "Tokyo", tz: "Asia/Tokyo", status: "Connected", pop: "Tokyo_DC4", native: "10.10.0.0/24", localIp: "10.10.0.1", ha: true,
        wan1: { name: "WAN1", isp: "NTT East（光）", down: 500, up: 500, role: "Active" }, wan2: { name: "WAN2", isp: "KDDI（光）", down: 300, up: 300, role: "Active" }, license: "Japan - 500 Mbps", connectedSince: Date.now() - 19 * 864e5 },
      { id: "s2", name: "JP-OSA-BR01", type: "Branch", conn: "Socket X1600 LTE", country: "Japan", city: "Osaka", tz: "Asia/Tokyo", status: "Connected", pop: "Osaka", native: "10.20.0.0/24", localIp: "10.20.0.1", ha: false,
        wan1: { name: "WAN1", isp: "NTT West（光）", down: 200, up: 200, role: "Active" }, wan2: { name: "LTE", isp: "docomo（LTE）", down: 50, up: 20, role: "Last Resort" }, license: "Japan - 200 Mbps", connectedSince: Date.now() - 6 * 864e5 },
      { id: "s3", name: "AWS-TKY-VPC", type: "Cloud Data Center", conn: "vSocket AWS", country: "Japan", city: "Tokyo", tz: "Asia/Tokyo", status: "Disconnected", pop: "—", native: "172.16.0.0/16", localIp: "172.16.0.10", ha: false,
        wan1: { name: "WAN1", isp: "AWS", down: 100, up: 100, role: "Active" }, wan2: null, license: "Japan - 100 Mbps", disconnectedAt: Date.now() - 2.6 * 3600e3 }
    ];
  }
  App.seedSites = seedSites;
  App.users = () => App.db.get("users", () => {
    const h = 3600e3, now = Date.now();
    const U = (first, last, email, groups, sdp, connected, origin, last_t, os) => ({ id: uid(), first, last, email, groups, sdp, connected, origin, lastConn: last_t ? now - last_t : null, os });
    return [
      U("一郎", "鈴木", "suzuki@example.co.jp", ["営業部", "全社員"], true, true, "SCIM", 0.2 * h, "Windows 11"),
      U("花子", "田中", "tanaka@example.co.jp", ["営業部", "全社員"], true, true, "SCIM", 0.5 * h, "macOS 15"),
      U("健", "山田", "yamada@example.co.jp", ["情報システム部", "全社員"], true, false, "SCIM", 20 * h, "Windows 11"),
      U("美咲", "佐藤", "sato@example.co.jp", ["経理部", "全社員"], true, false, "SCIM", 52 * h, "Windows 11"),
      U("大輔", "高橋", "takahashi@example.co.jp", ["情報システム部", "全社員"], true, false, "SCIM", 6 * h, "iOS 18"),
      U("由美", "伊藤", "ito@example.co.jp", ["経理部", "全社員"], false, false, "SCIM", null, ""),
      U("Partner", "Vendor", "vendor01@partner.example", ["業務委託"], true, false, "Manual", 120 * h, "Windows 10")
    ];
  });
  App.opt = {
    sources: () => ["SDP Users (all)", "Group: 全社員", "Group: 営業部", "Group: 情報システム部", "User: suzuki@example.co.jp", "User: tanaka@example.co.jp"]
      .concat(App.sites().map((s) => "Site: " + s.name)).concat(["IP Range: 10.10.0.0/24"]),
    destinations: () => App.sites().map((s) => "Site: " + s.name).concat(["Host: FileServer (10.10.0.20)", "Host: ERP (172.16.1.10)", "SDP Users (all)"]),
    apps: ["Category: Gambling", "Category: Anonymizers", "Category: Malware", "Category: Phishing", "Category: Uncategorized", "Category: Social Networks",
      "Category: Streaming Media", "Category: Financial Services", "Category: Health & Medicine",
      "App: Microsoft 365", "App: Microsoft Teams", "App: Zoom", "App: Box", "App: Salesforce", "App: YouTube", "App: Dropbox", "App: Windows Update",
      "Domain: partner-portal.example.net", "Domain: legacy-app.example.co.jp"],
    services: ["HTTP", "HTTPS", "SMB", "RDP", "SSH", "DNS", "SIP", "TCP/8443"],
    locations: ["Tokyo", "Osaka", "Sapporo", "Singapore", "Hong Kong", "Los Angeles", "Frankfurt"],
    posture: () => { const d = App.db.get("posture", null); return d ? d.profiles.map((p) => p.name) : ["Corporate Device (Domain Joined)", "Antivirus Running", "OS Up to Date", "Disk Encryption"]; },
    platforms: ["Windows", "macOS", "iOS", "Android", "Linux"],
    countries: ["Japan", "United States", "Singapore", "China"],
    usersGroups: ["Group: 全社員", "Group: 営業部", "Group: 情報システム部", "Group: 業務委託", "User: suzuki@example.co.jp"]
  };

  App.stories = () => App.db.get("stories", () => {
    const h = 3600e3, now = Date.now();
    return [
      { id: "ST-1042", title: "感染端末からの C&C 通信の疑い", sev: "Critical", status: "Open", owner: "", user: "yamada@example.co.jp", host: "PC-IT-0231", t: now - 3 * h, verdict: "",
        ind: ["宛先 198.51.100.77（既知の C&C サーバ）", "DNS トンネリングの兆候", "同じ端末から 96 回の接続試行"], tl: [[3, "IPS：Known C&C communication を検知・ブロック", 1], [2.6, "同じ端末から DNS トンネリングの兆候", 1], [2, "通信は継続（すべてブロック）", 0]],
        rec: "端末をネットワークから切り離してウイルススキャン。ブロックされているため外部への通信は成功していません。" },
      { id: "ST-1039", title: "フィッシングサイトへの連続アクセス", sev: "High", status: "Open", owner: "", user: "suzuki@example.co.jp", host: "PC-SL-0112", t: now - 9 * h, verdict: "",
        ind: ["フィッシング判定ドメイン 5 件", "メール内リンクからのアクセス"], tl: [[9, "phishing-login.test へのアクセスをブロック", 1], [8.5, "類似ドメインへのアクセスをブロック（4 件）", 1]],
        rec: "本人にパスワードを入力していないか確認。入力していればパスワード変更と MFA の再設定。" },
      { id: "ST-1031", title: "個人クラウドストレージへの大量アップロード", sev: "Medium", status: "In Progress", owner: "trainee@example.com", user: "tanaka@example.co.jp", host: "PC-SL-0140", t: now - 26 * h, verdict: "",
        ind: ["Dropbox へ 2.1 GB", "DLP：クレジットカード番号を検知"], tl: [[26, "Dropbox へのアップロード開始", 0], [25.5, "DLP がカード番号を検知しブロック", 1]],
        rec: "上長に業務上の必要性を確認。不要なら Application Control で個人ストレージへのアップロードを禁止。" },
      { id: "ST-1020", title: "社外端末の不審な国からの接続", sev: "Low", status: "Closed", owner: "yamada.admin@example.co.jp", user: "vendor01@partner.example", host: "VENDOR-LT01", t: now - 70 * h, verdict: "Benign",
        ind: ["Singapore からの接続"], tl: [[70, "Singapore から Cato Client で接続", 0]], rec: "出張のため問題なし（確認済み）。" }
    ];
  });

  /* ---------------- SVG 折れ線チャート ---------------- */
  App.lineChart = (series, opt = {}) => {
    const W = 520, H = 190, L = 44, R = 12, T = 12, B = 26;
    const n = series[0].data.length;
    const max = opt.max || Math.max(1, ...series.flatMap((s) => s.data)) * 1.15;
    const nice = (() => { const p = Math.pow(10, Math.floor(Math.log10(max))); const m = max / p; return (m <= 2 ? 2 : m <= 5 ? 5 : 10) * p; })();
    const x = (i) => L + (i / (n - 1)) * (W - L - R);
    const y = (v) => T + (1 - v / nice) * (H - T - B);
    let g = "";
    for (let k = 0; k <= 4; k++) {
      const v = (nice / 4) * k, yy = y(v);
      g += `<line x1="${L}" x2="${W - R}" y1="${yy}" y2="${yy}" stroke="#eceff2"/><text x="${L - 6}" y="${yy + 3}" text-anchor="end">${+v.toFixed(v < 10 ? 1 : 0)}</text>`;
    }
    const labels = opt.labels || [];
    labels.forEach((lb, i) => { if (lb) g += `<text x="${x(i)}" y="${H - 8}" text-anchor="middle">${lb}</text>`; });
    const paths = series.map((s) => {
      const d = s.data.map((v, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join("");
      const area = s.fill ? `<path d="${d}L${x(n - 1)},${y(0)}L${x(0)},${y(0)}Z" fill="${s.color}" opacity=".10"/>` : "";
      return area + `<path d="${d}" fill="none" stroke="${s.color}" stroke-width="1.6"/>`;
    }).join("");
    // 各時点に透明な縦帯を置き、マウスを乗せるとその時点の値を表示
    const cw = (W - L - R) / (n - 1);
    const hov = series[0].data.map((_, i) => {
      const lab = (opt.full && opt.full[i]) || labels[i] || "#" + (i + 1);
      const vals = series.map((s) => (s.name || "値") + "：" + s.data[i] + " " + (opt.unit || "")).join(" ／ ");
      const note = opt.note ? opt.note(i) : "";
      return `<rect class="hov" x="${(x(i) - cw / 2).toFixed(1)}" y="${T}" width="${cw.toFixed(1)}" height="${H - T - B}" fill="transparent" data-tip="${esc("【" + lab + "】" + vals + (note ? "\n" + note : ""))}"/>`;
    }).join("");
    return `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(opt.title || "chart")}">${g}<text x="${L}" y="9" text-anchor="start">${esc(opt.unit || "")}</text>${paths}${hov}</svg>`;
  };
  App.rand = (seed) => { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; };

  /* =====================================================================
     ポリシー画面エンジン
     cfg: {key, title, seed(){rules,enabled}, columns:[{h, v(rule)}], sections, newRule(), lockedTop:[], implicitBottom:{label, cells},
           hasEnable, enableLabel, enableWarnOff, onPublish(pub, prev), newMenu}
     ===================================================================== */
  App.policy = (cfg) => {
    const root = $(cfg.mount);
    const load = () => App.db.get("pol." + cfg.key, () => ({ published: cfg.seed(), draft: null, rev: cfg.startRev || 3 }));
    let st = load();
    let work = clone(st.draft || st.published);
    let dirty = false;
    let viewPublished = false;
    let q = "";
    let lastChanged = null;

    function save() { st.draft = clone(work); App.db.set("pol." + cfg.key, st); dirty = false; }
    function plain(h) { const d = document.createElement("div"); d.innerHTML = h; return d.textContent.replace(/\s+/g, " ").trim(); }
    function ruleTip(r, i, showing) {
      const parts = cfg.columns.filter((c) => c.h !== "Name").map((c) => c.h + "：" + (plain(c.v(r)) || "—"));
      const pub = st.published.rules.find((x) => x.id === r.id);
      let state;
      if (!pub) state = "未公開の新しいルール（Publish するまで効きません）";
      else if (JSON.stringify(Object.assign({}, pub, { _new: undefined })) !== JSON.stringify(Object.assign({}, r, { _new: undefined }))) state = "公開中の内容から変更あり（未公開）";
      else state = "公開中（全社に反映済み）";
      return "【#" + (i + 1) + " " + r.name + "】" + (r.enabled ? "有効" : "無効：評価されません") + "\n" + parts.join(" ／ ") +
        "\n状態：" + state + "\n上から " + (i + 1) + " 番目に評価されます。クリックで編集、⋮ で移動・削除。";
    }

    function render() {
      const showing = viewPublished ? st.published : work;
      const ro = viewPublished && !!st.draft;
      const hasDraft = !!st.draft;
      let banner;
      if (ro) banner = `<div class="status-banner pub">${App.icon("lock")}公開中のポリシー（Revision #${st.rev}）を表示しています。編集するには上のリストで自分の未公開リビジョンを選んでください。</div>`;
      else if (dirty) banner = `<div class="status-banner dirty">${App.icon("alert")}<b>未保存の変更があります。</b>［Save］で自分の未公開リビジョンに保存してください。このまま他の画面に移ると変更は失われます。</div>`;
      else if (hasDraft) banner = `<div class="status-banner draft">${App.icon("lock")}<b>未公開リビジョン（保存済み）</b>：まだ全社には反映されていません。他の管理者からは見えず、変更したルールはロックされます。［Publish］で反映します。</div>`;
      else banner = `<div class="status-banner pub">${App.icon("check")}公開中のポリシー（Revision #${st.rev}）です。変更すると自分専用の未公開リビジョンが作られます。</div>`;

      const rows = showing.rules.map((r, i) => ({ r, i })).filter(({ r }) => !q || JSON.stringify(r).toLowerCase().includes(q.toLowerCase()));
      const cols = cfg.columns;
      const colspan = cols.length + 3;
      root.innerHTML = `<div class="card">
        <div class="pol-bar">
          <select class="select rev-select" id="revSel" aria-label="リビジョン">
            <option value="pub" ${viewPublished || !(hasDraft || dirty) ? "selected" : ""}>Published Revision #${st.rev}（Active）</option>
            ${hasDraft || dirty ? `<option value="draft" ${!viewPublished ? "selected" : ""}>Unpublished Revision（${esc(App.trainee().name)}）</option>` : ""}
          </select>
          <div class="search">${App.icon("search")}<input class="input" id="polSearch" placeholder="Search rules" value="${esc(q)}" aria-label="ルールを検索"></div>
          <div class="btn-group" style="margin-left:auto">
            <button class="btn" id="btnNew" ${ro ? "disabled" : ""}>${App.icon("plus")}New</button>
            <button class="btn" id="btnCompare" ${hasDraft || dirty ? "" : "disabled"}>Compare View</button>
            <button class="btn" id="btnDiscard" ${(hasDraft || dirty) && !ro ? "" : "disabled"}>Discard</button>
            <button class="btn" id="btnSave" ${dirty ? "" : "disabled"}>Save</button>
            <button class="btn btn-primary" id="btnPublish" ${hasDraft && !dirty && !ro ? "" : "disabled"} title="${dirty ? "先に Save してください" : ""}">Publish</button>
          </div>
        </div>
        ${banner}
        ${cfg.hasEnable ? `<div class="enable-row"><label class="switch"><input type="checkbox" id="polEnable" ${showing.enabled ? "checked" : ""} ${ro ? "disabled" : ""}><span class="track"></span>${esc(cfg.enableLabel)}</label>
          <span class="muted">${showing.enabled ? (cfg.enabledText || "有効") : `<span style="color:var(--ng)">${cfg.disabledText || "無効"}</span>`}</span>${cfg.enableExtra || ""}</div>` : ""}
        <div class="tbl-wrap"><table class="tbl"><thead><tr><th style="width:36px">#</th><th style="width:52px">On</th>${cols.map((c) => `<th>${c.h}</th>`).join("")}<th style="width:36px"></th></tr></thead><tbody>
        ${(cfg.lockedTop || []).length ? `<tr class="sec-row"><td colspan="${colspan}">${esc(cfg.lockedTopTitle || "Default Rules")}</td></tr>` +
          cfg.lockedTop.map((r) => `<tr class="locked" data-locked data-tip="${esc("【既定の除外ルール】" + r.name + "\nCato が管理するルールで、一番上で評価されます。編集・削除はできません。")}"><td>${App.icon("lock")}</td><td></td>${cols.map((c) => `<td>${c.v(r)}</td>`).join("")}<td></td></tr>`).join("") : ""}
        ${cfg.userSectionTitle ? `<tr class="sec-row"><td colspan="${colspan}">${esc(cfg.userSectionTitle)}</td></tr>` : ""}
        ${rows.length ? rows.map(({ r, i }) => `<tr class="clickable ${r.enabled ? "" : "disabled-rule"} ${lastChanged === r.id ? "flash" : ""}" data-i="${i}" data-tip="${esc(ruleTip(r, i, showing))}">
            <td class="num">${i + 1}</td>
            <td><label class="switch" title="ルールの有効/無効"><input type="checkbox" data-en="${i}" ${r.enabled ? "checked" : ""} ${ro ? "disabled" : ""} aria-label="${esc(r.name)}を有効化"><span class="track"></span></label></td>
            ${cols.map((c) => `<td>${c.v(r)}</td>`).join("")}
            <td><button class="kebab" type="button" data-more="${i}" aria-label="その他の操作" ${ro ? "disabled" : ""}>⋮</button></td></tr>`).join("")
          : `<tr><td colspan="${colspan}" class="muted" style="text-align:center;padding:22px">${q ? "一致するルールがありません" : "ルールがありません。［New］で追加します。"}</td></tr>`}
        ${cfg.implicitBottom ? `<tr class="sec-row"><td colspan="${colspan}">Default Rules</td></tr>
          <tr class="locked" data-locked data-tip="${esc(cfg.implicitBottom.tip || "【既定ルール】どのルールにも一致しなかった通信に適用されます。編集できません。")}"><td>${App.icon("lock")}</td><td></td>${cfg.implicitBottom.cells.map((c) => `<td>${c}</td>`).join("")}<td></td></tr>` : ""}
        </tbody></table></div></div>`;
      lastChanged = null;
      bind();
    }

    function markDirty(id) { dirty = true; viewPublished = false; lastChanged = id || null; render(); }

    function openRule(i) {
      const isNew = i === -1;
      const model = isNew ? cfg.newRule() : clone(work.rules[i]);
      model.position = isNew ? 1 : i + 1;
      const total = work.rules.length + (isNew ? 1 : 0);
      const general = { title: "General", open: true, fields: [
        { key: "name", label: "Name", req: true, placeholder: "例：IFW-営業-partner-portal-Allow-CHG1021" },
        { key: "enabled", label: "Enabled", type: "toggle" },
        { key: "position", label: cfg.positionLabel || "Position（Rule Order）", type: "select", options: Array.from({ length: total }, (_, k) => [k + 1, `${k + 1}${k === 0 ? "（一番上）" : k === total - 1 ? "（一番下）" : ""}`]),
          help: "ルールは上から順に評価され、最初に一致したルールが適用されます。" }
      ].concat(cfg.generalExtra || []), summary: (m) => `#${m.position}` };
      App.panel({
        title: (isNew ? "Add " : "Edit ") + (cfg.ruleNoun || "Rule"),
        model,
        intro: cfg.panelIntro,
        sections: [general].concat(cfg.sections),
        onApply(m) {
          if (!String(m.name || "").trim()) { App.toast("Name を入力してください。", "ng"); return false; }
          if (cfg.validate) { const err = cfg.validate(m); if (err) { App.toast(err, "ng"); return false; } }
          const pos = Math.max(1, Math.min(total, +m.position || 1)) - 1;
          delete m.position;
          if (isNew) { m.id = uid(); m._new = true; work.rules.splice(pos, 0, m); }
          else { work.rules.splice(i, 1); work.rules.splice(pos, 0, m); }
          App.toast("ルールを適用しました。まだ保存されていません。次に［Save］を押します。", "warn");
          markDirty(m.id);
        },
        onDelete: isNew ? null : () => { work.rules.splice(i, 1); App.closePanel(); App.toast("ルールを削除しました（未保存）。", "warn"); markDirty(); }
      });
    }

    function diffList() {
      const a = st.published.rules, b = work.rules;
      const out = [];
      b.forEach((r, i) => {
        const old = a.find((x) => x.id === r.id);
        if (!old) out.push(`<li><span class="badge b-ok">追加</span> #${i + 1} ${esc(r.name)}</li>`);
        else {
          const o = clone(old), n = clone(r); delete o._new; delete n._new;
          if (JSON.stringify(o) !== JSON.stringify(n)) out.push(`<li><span class="badge b-info">変更</span> #${i + 1} ${esc(r.name)}</li>`);
          else if (a.indexOf(old) !== i) out.push(`<li><span class="badge b-gray">移動</span> ${esc(r.name)}：#${a.indexOf(old) + 1} → #${i + 1}</li>`);
        }
      });
      a.forEach((r) => { if (!b.find((x) => x.id === r.id)) out.push(`<li><span class="badge b-block">削除</span> ${esc(r.name)}</li>`); });
      if (cfg.hasEnable && st.published.enabled !== work.enabled) out.push(`<li><span class="badge b-info">変更</span> ${esc(cfg.enableLabel)}：${st.published.enabled ? "ON" : "OFF"} → ${work.enabled ? "ON" : "OFF"}</li>`);
      return out;
    }

    function bind() {
      $("#revSel", root).addEventListener("change", (e) => {
        if (dirty && e.target.value === "pub") { App.toast("未保存の変更があります。先に［Save］または［Discard］してください。", "warn"); e.target.value = "draft"; return; }
        viewPublished = e.target.value === "pub"; render();
      });
      $("#polSearch", root).addEventListener("input", (e) => { q = e.target.value; const pos = e.target.selectionStart; render(); const s = $("#polSearch", root); s.focus(); s.setSelectionRange(pos, pos); });
      $("#btnNew", root).addEventListener("click", (e) => cfg.newMenu ? App.pop(e.currentTarget, [{ label: "New Rule", run: () => openRule(-1) }, { label: "New Section", run: () => App.toast("セクションの作成は研修版では省略しています。", "warn") }]) : openRule(-1));
      $("#btnSave", root).addEventListener("click", () => {
        save();
        App.audit(cfg.title, "Save", "Unpublished Revision", diffList().length + " 件の変更を保存");
        App.toast("未公開リビジョンに保存しました。<b>まだ反映されていません。</b>［Publish］で全社に反映します。", "warn", 6000);
        render();
      });
      $("#btnDiscard", root).addEventListener("click", () => App.modal({
        title: "Discard Revision", body: "未公開リビジョンの変更をすべて破棄し、公開中のポリシーに戻します。<br>この操作は取り消せません。", ok: "Discard", danger: true,
        onOk: () => { st.draft = null; App.db.set("pol." + cfg.key, st); work = clone(st.published); dirty = false; viewPublished = false; App.toast("未公開リビジョンを破棄しました。", "ok"); render(); }
      }));
      $("#btnPublish", root).addEventListener("click", () => {
        const diffs = diffList();
        App.modal({
          title: "Publish Revision",
          body: `次の変更をアカウント全体のポリシーに反映します。<b>公開は取り消せません。</b><ul style="padding-left:18px;margin:8px 0 0">${diffs.join("") || "<li>変更なし</li>"}</ul>`,
          ok: "Publish",
          onOk: () => {
            const prev = clone(st.published);
            work.rules.forEach((r) => delete r._new);
            st.published = clone(work); st.draft = null; st.rev += 1;
            App.db.set("pol." + cfg.key, st);
            App.audit(cfg.title, "Publish", `Revision #${st.rev}`, diffs.map((d) => d.replace(/<[^>]+>/g, "")).join(" / "));
            App.toast(`Revision #${st.rev} を公開しました。ポリシーが全社に反映されます。`, "ok");
            if (cfg.onPublish) cfg.onPublish(st.published, prev);
            render();
          }
        });
      });
      $("#btnCompare", root).addEventListener("click", () => {
        const diffs = diffList();
        App.modal({ title: "Compare View（公開中 ⇔ 自分の変更）", body: diffs.length ? `<ul style="padding-left:18px;margin:0;display:grid;gap:6px">${diffs.join("")}</ul>` : "公開中のポリシーとの差分はありません。", ok: "閉じる", cancel: "" });
      });
      const en = $("#polEnable", root);
      if (en) en.addEventListener("change", () => {
        const apply = () => { work.enabled = en.checked; markDirty(); };
        if (!en.checked && cfg.enableWarnOff) {
          en.checked = true;
          App.modal({ title: "無効化の確認", body: cfg.enableWarnOff, ok: "無効にする", danger: true, onOk: () => { en.checked = false; apply(); } });
        } else apply();
      });
      $$("tr.clickable", root).forEach((tr) => tr.addEventListener("click", (e) => {
        if (e.target.closest(".switch, .kebab")) return;
        if (viewPublished && st.draft) { App.toast("公開中のリビジョンは閲覧専用です。", "warn"); return; }
        openRule(+tr.dataset.i);
      }));
      $$("tr[data-locked]", root).forEach((tr) => tr.addEventListener("click", () => App.toast("Cato が管理する既定ルールのため編集できません。", "warn")));
      $$("[data-en]", root).forEach((c) => c.addEventListener("change", () => { const r = work.rules[+c.dataset.en]; r.enabled = c.checked; markDirty(r.id); }));
      $$("[data-more]", root).forEach((b) => b.addEventListener("click", (e) => {
        e.stopPropagation();
        const i = +b.dataset.more;
        App.pop(b, [
          { label: "Edit", run: () => openRule(i) },
          { label: "Move Up", run: () => { if (i > 0) { [work.rules[i - 1], work.rules[i]] = [work.rules[i], work.rules[i - 1]]; markDirty(work.rules[i - 1].id); } } },
          { label: "Move Down", run: () => { if (i < work.rules.length - 1) { [work.rules[i + 1], work.rules[i]] = [work.rules[i], work.rules[i + 1]]; markDirty(work.rules[i + 1].id); } } },
          { label: "Duplicate", run: () => { const c = clone(work.rules[i]); c.id = uid(); c.name += " (copy)"; c._new = true; work.rules.splice(i + 1, 0, c); markDirty(c.id); } },
          { label: "Delete", danger: true, run: () => { work.rules.splice(i, 1); markDirty(); } }
        ]);
      }));
    }

    window.addEventListener("beforeunload", (e) => { if (dirty) { e.preventDefault(); e.returnValue = ""; } });
    render();
    return { state: () => st };
  };

  /* 表示用ヘルパー */
  App.chipsCell = (arr, any = "Any") => (arr && arr.length ? arr.map((x) => `<span class="chip">${esc(x)}</span>`).join(" ") : `<span class="muted">${any}</span>`);
  App.actionBadge = (a) => {
    const m = { Allow: "b-allow", Block: "b-block", Prompt: "b-prompt", Bypass: "b-prompt", Inspect: "b-info" };
    const cls = m[a] || (String(a).startsWith("Allow") ? "b-allow" : String(a).startsWith("Block") ? "b-block" : "b-info");
    return `<span class="badge ${cls}">${esc(a)}</span>`;
  };

  /* =====================================================================
     ツールチップ（ボタンにマウスを乗せると簡単な説明を表示）
     優先順位：data-tip ＞ 下の辞書（ボタンの文字で引く）＞ title ＞ アイコンだけのボタンの aria-label
     ===================================================================== */
  const TIPS = {
    // 上部タブ
    "Monitoring": "監視とログ。Topology（全体図）、Events（ログ）、Audit Trail（操作履歴）があります。",
    "Network": "拠点（Sites）、経路と優先度（Network Rules）、帯域、固定IP の設定です。",
    "Access": "ユーザー管理と、リモート接続（Cato Client）を許可する条件の設定です。",
    "Security": "Internet / WAN Firewall と TLS Inspection などのセキュリティ設定です。",
    "Assets": "端末の一覧（Device Inventory）など、資産の情報を確認します。",
    "Administration": "管理者アカウントの追加・権限・MFA リセットを行います。",
    // サイドメニュー
    "Topology": "拠点と接続中のリモートユーザーを図で表示します。毎朝の健康確認はここから。",
    "Events": "通信・セキュリティ・接続のログを検索します。「なぜ見られない？」の調査に使います。",
    "Audit Trail": "管理者の操作履歴（誰が・いつ・何を変えたか）を表示します。",
    "Sites": "拠点（サイト）の一覧・追加・監視を行います。",
    "Network Rules": "通信ごとの経路、優先度（QoS）、出口（Route Via / NAT）を決めます。",
    "Bandwidth Management": "帯域の優先度プロファイル（Priority と制限値）を管理します。",
    "IP Allocation": "自社専用の固定送信元IP（Allocated IP）を割り当てます。",
    "Users": "ユーザー一覧と SDP ライセンス（リモート接続の権利）を確認します。",
    "Directory Services": "SCIM / LDAP で IdP や AD からユーザーを同期する設定です。",
    "Client Connectivity Policy": "Cato Client でのリモート接続を許可する条件（端末の状態など）を決めます。",
    "Internet Firewall": "インターネット向け通信の許可・ブロック。最後は「全部許可」の既定ルール。",
    "WAN Firewall": "社内（拠点・ユーザー・クラウド）間の通信制御。最後は「全部遮断」の既定ルール。",
    "TLS Inspection": "HTTPS を復号して検査する設定と、検査しない（Bypass）ルールです。",
    "Administrators": "管理者アカウントの一覧・追加・権限・MFA リセットを行います。",
    "All Sites": "拠点の一覧に戻ります。",
    "Sites Overview": "全拠点の状態・帯域・品質を一覧で比較します。",
    "SDP Users Overview": "リモートユーザーの接続状況（誰が・どこから・いつ）を一覧します。",
    "App Analytics": "どのアプリがどれだけ使われているかを分析します。",
    "Routing Table": "拠点ごとの経路（どの宛先へどこを通るか）を確認します。",
    "Security Threats": "ブロックした脅威の件数・種類・対象を確認するダッシュボード。",
    "MITRE ATT&CK": "検知した攻撃を MITRE ATT&CK の戦術・技術に当てはめて表示します。",
    "Cloud Apps": "社内で使われているクラウドサービス（シャドーIT 含む）を可視化します。",
    "DLP": "機密情報の持ち出し検知（DLP）の状況を表示します。",
    "SaaS Security API": "Microsoft 365 などと API 連携し、公開リンクなどの設定リスクを確認します。",
    "SDP Users": "リモートユーザーの利用状況（OS・バージョン・国）のダッシュボード。",
    "Network Dashboard": "全拠点の通信量と回線品質をまとめて表示します。",
    "Best Practices": "推奨設定ができているかを採点し、未対応の項目を案内します。",
    "Stories Dashboard": "XDR が関連付けたインシデント（ストーリー）の一覧と傾向。",
    "Stories Workbench": "ストーリーを1件ずつ調査・対応する作業画面。",
    "Groups": "拠点やホストをまとめた「グループ」を管理します。ルールで使うと保守が楽になります。",
    "DNS Settings": "DNS サーバと、社内ドメインの転送先（Domain Forwarding）を設定します。",
    "Device Posture": "端末の状態チェック（OS・ウイルス対策など）と、その組み合わせのプロファイルを管理します。",
    "Threat Prevention": "IPS・アンチマルウェア・DNS 保護などの脅威防御を設定します。",
    "Application Control": "SaaS の操作（アップロード等）を許可・ブロックするルール（CASB）。",
    "Data Protection": "機密データ（カード番号など）の持ち出しを検知・ブロックするルール（DLP）。",
    "Device Inventory": "Cato が把握している端末の一覧（OS・利用者・状態）。",
    "License": "契約しているライセンスの内容と使用状況を確認します。",
    "API Keys": "API・自動化（Terraform など）用のキーを発行・管理します。",
    "What's New": "研修サイトの更新内容と、実機の新機能の確認方法。",
    "Real-Time": "この拠点の通信を1秒ごとにリアルタイム表示します。",
    "High Availability": "Socket 2台構成（HA）の状態と切り替え試験。",
    "Snapshot": "Socket の状態、回線の Up/Down、遅延、接続履歴を確認します。",
    "Network Analytics": "スループット、パケットロス、遅延、ジッタのグラフを確認します。",
    "General": "サイト名・種別・ライセンス・タイムゾーンなどの基本設定です。",
    "Socket": "Socket 本体の情報と、Socket WebUI・再起動・RMA 交換などの操作です。",
    "Networks": "Native Range（拠点のLAN）と Routed Range（L3スイッチの先）を確認します。",
    // ポリシー画面の操作
    "New": "新しいルール（項目）を追加します。右側に入力パネルが開きます。",
    "＋ New": "新しい項目を追加します。右側に入力パネルが開きます。",
    "Save": "変更を自分専用の「未公開リビジョン」に保存します。まだ全社には反映されません。",
    "Publish": "保存した変更を全社に反映します。公開は取り消せないので、内容を見直してから押します。",
    "Discard": "未公開の変更をすべて捨てて、公開中の状態に戻します（取り消し不可）。",
    "Compare View": "公開中のポリシーと自分の変更の違い（追加・変更・削除・移動）を表示します。",
    "Apply": "パネルの内容を一覧に反映します。ポリシー画面ではこの後に Save → Publish が必要です。",
    "Cancel": "入力内容を捨ててパネルを閉じます。",
    "Delete": "この項目を削除します。ポリシーの場合は Save → Publish するまで反映されません。",
    "⋮": "編集・上下移動・複製・削除のメニューを開きます。",
    "Edit": "このルールを編集します。",
    // 各画面
    "Export Events": "絞り込んだイベントを CSV に出力します（研修版では出力しません）。",
    "Clear all": "すべてのフィルターを外します。",
    "Socket WebUI": "Socket のローカル管理画面を開きます（実機では自動ログイン）。",
    "Actions ▾": "選択中の項目に対する操作（MFA リセット、Socket WebUI など）を選びます。",
    "＋ Allocate": "選んだロケーションの固定IPを1つ追加します。［Save］で確定します。",
    "Download Root Certificate": "TLS Inspection 用のルート証明書を取得します。全端末に配布が必要です。",
    "New SCIM App": "IdP（Entra ID など）と SCIM で連携する設定を追加します。",
    "＋ New SCIM App": "IdP（Entra ID など）と SCIM で連携する設定を追加します。",
    "Sync Status": "SCIM 同期の最新状況を確認します。",
    "研修を開始": "名前とメールは何を入れても進めます。入力内容はこのブラウザ内にだけ保存されます。",
    "閉じる": "このパネルを閉じます。"
  };
  /* 列見出し（th）の解説 */
  const COLTIPS = {
    "#": "評価の順番。上から順に照合され、最初に一致したルールが使われます。",
    "On": "ルールの有効/無効。オフのルールは評価されません。",
    "Name": "ルール・項目の名前。命名規則と申請番号を入れると後で追いやすくなります。",
    "Source": "通信の送信元（誰・どこから）。空欄は Any（すべて）。",
    "Destination": "通信の宛先。空欄は Any（すべて）。",
    "Destination / Detail": "通信の宛先、または接続イベントの詳細。",
    "Dir": "方向。→ は送信元から宛先の片方向、⇄ は双方向。",
    "App/Category": "対象のアプリ・カテゴリ・ドメイン。複数あれば OR（どれか一致）。",
    "Service/Port": "対象のサービスやポート（SMB、HTTPS など）。",
    "Action": "一致したときの動作。Allow＝許可、Block＝遮断、Prompt＝警告して続行可。",
    "Track": "Events にログを残すかどうか。",
    "Time": "日時、またはルールが有効な時間帯。",
    "Rule Type": "WAN＝社内間の通信、Internet＝インターネット向けの通信。",
    "Bandwidth Priority": "混雑時の優先度。数字が小さいほど先に流れます（既定は p255）。",
    "Transport": "Primary / Secondary の経路。通常は Cato（バックボーン経由）。",
    "Route/NAT": "インターネットへの出口。Route Via＝指定 PoP から、NAT＝自社専用 IP から出す。",
    "Status": "拠点・管理者などの現在の状態。",
    "Site Type": "拠点の種類（アイコンが変わるだけ）。",
    "Connection Type": "接続方式（Socket の型番・vSocket・IPsec）。",
    "Location": "拠点の所在地。最寄り PoP とメンテナンス時間帯に影響。",
    "Connected PoP": "今つながっている Cato の接続拠点。",
    "Native Range": "拠点 LAN のアドレス範囲。他拠点と重複不可。",
    "License": "拠点に割り当てた帯域ライセンス。",
    "Users/Groups": "ルールの対象ユーザー・グループ。",
    "Platforms": "対象 OS。",
    "Countries": "接続元の国。",
    "Device Posture Profiles": "端末の状態条件（会社PC・AV 稼働など）。",
    "SDP License": "リモート接続の権利。Assigned でないと Cato Client で接続できません。",
    "Client Status": "Cato Client の接続状態。",
    "Last Connected": "最後にリモート接続した日時。",
    "Origin": "ユーザーの登録元。SCIM＝IdP から自動同期、Manual＝手動作成。",
    "Role": "権限。Editor＝変更可、Viewer＝閲覧のみ。回線の場合は Active / Last Resort。",
    "MFA": "多要素認証の状態。Pending は本人の再登録待ち。",
    "Password Expiry": "パスワードの有効期限ポリシー。",
    "Last Login": "最後に管理画面へログインした日時。",
    "Admin": "操作した管理者。",
    "Module": "操作された画面（機能）。",
    "Object": "操作対象。",
    "Details": "変更内容の要約。",
    "Event Type": "イベントの種類（Security / Connectivity / Routing など）。",
    "Sub-Type": "種類の内訳（Internet Firewall、IPS、Link Quality など）。",
    "Rule": "一致したルール名。どのルールで止められたかはここを見ます。",
    "IP Address": "割り当てられた自社専用の送信元 IP。",
    "Location (PoP)": "IP が属する PoP の場所。",
    "Allocated": "割り当てた日時。",
    "Used in Network Rules": "この IP を NAT に使っている Network Rule。",
    "Priority": "優先度（2〜254）。数字が小さいほど優先。",
    "Limits": "帯域制限のかけ方。",
    "Upload Limit": "上り方向の上限。", "Download Limit": "下り方向の上限。",
    "Interface": "Socket の回線ポート。", "ISP": "回線事業者。",
    "Link Status": "回線の Up / Down。", "Media Connected": "ケーブルが挿さっているか。",
    "RTT": "PoP までの往復遅延（小さいほど良い）。", "Bandwidth (Down/Up)": "設定している回線帯域。", "Speed / Duplex": "リンク速度と全二重/半二重。",
    "Email": "ログインID・連絡先のメールアドレス。", "Groups": "所属グループ（IdP から同期）。", "OS": "接続端末の OS。",
    "Identity Provider": "連携している IdP。", "Last Sync": "最後に同期した日時。", "Synced Users": "同期されたユーザー数。",
    "Serial": "Socket 本体のシリアル番号。", "Model": "Socket の型番。", "Version": "Socket のソフトウェアバージョン。",
    "Subnet": "アドレス範囲。", "Local IP": "Socket の LAN 側 IP。", "DHCP": "DHCP の動作（サーバ／リレー）。",
    "番号": "図中の番号に対応します。", "場所": "画面上の場所。", "役割": "その場所でできること。", "項目": "入力項目。", "入力のポイント": "間違えやすい点。"
  };
  /* 表の中の状態語 → 現状の説明 */
  const STATES = [
    ["Disconnected", "切断中：Cato Cloud に接続していません。Snapshot で回線と接続履歴を確認します。"],
    ["Pending", "未接続：サイトは作成済みですが、Socket がまだ接続されていません。"],
    ["Invited", "招待中：招待メール送信済み。本人が有効化すると Active になります。"],
    ["Waiting for IdP", "IdP 側でプロビジョニングを開始するのを待っています。"],
    ["Offline", "Socket がオフラインです。"],
    ["Down", "回線が切れています。"],
    ["Standby", "待機中：予備回線（Last Resort）として、他の回線が全部切れたときだけ使われます。"],
    ["Disabled", "無効化されたユーザーです。接続できません。"],
    ["Block", "遮断：この通信・ルールはブロックです。"],
    ["Prompt", "警告：ユーザーが同意すれば続行できます。"],
    ["Bypass", "検査しない（TLS 復号の対象外）。"],
    ["Inspect", "TLS を復号して検査します。"],
    ["Connected", "接続中：正常に Cato Cloud とつながっています。"],
    ["Active", "有効：正常に利用中です。"],
    ["Assigned", "SDP ライセンスあり：リモート接続できます。"],
    ["Allow", "許可：この通信・ルールは許可です。"],
    ["Up", "回線は正常（Up）です。"]
  ];
  function rowTip(tr) {
    if (tr.dataset.tip) return tr.dataset.tip;
    if (tr.classList.contains("sec-row")) return "区切り：" + tr.textContent.trim();
    const table = tr.closest("table");
    if (!table || !tr.closest("tbody")) return "";
    const heads = [...table.querySelectorAll("thead th")].map((th) => th.textContent.trim());
    const cells = [...tr.children];
    if (cells.length === 1) return "";
    const parts = [];
    cells.forEach((td, i) => {
      let v = (td.innerText || td.textContent || "").replace(/\s+/g, " ").trim();
      const sw = td.querySelector('input[type="checkbox"]');
      if (sw && !v) v = sw.checked ? "有効" : "無効";
      const h = heads[i] || "";
      if (!v || !h || h === "#" || v === "▸" || v === "▾" || v === "⋮") return;
      if (parts.length < 6) parts.push(h + "：" + v.slice(0, 60));
    });
    const all = cells.map((c) => c.textContent.trim()).join(" | ");
    const st = STATES.find(([k]) => new RegExp("(^|[^A-Za-z])" + k + "([^A-Za-z]|$)").test(all));
    let out = (table.classList.contains("mini") ? "【解説】" : "【現状】") + parts.join(" ／ ");
    if (st) out += "\n" + st[1];
    if (tr.classList.contains("locked")) out += "\n既定ルールのため編集できません。";
    else if (tr.classList.contains("clickable")) out += "\nクリックで詳細・編集を開きます。";
    return out;
  }
  App.SIDE_TIPS = TIPS;
  let tipEl = null, tipTimer = null, tipFor = null, mouse = { x: 0, y: 0 };
  function tipText(el) {
    if (el.dataset && el.dataset.tip) return el.dataset.tip;
    if (el.getAttribute && el.getAttribute("title") && !(el instanceof SVGElement)) { el.dataset.tip = el.title; el.removeAttribute("title"); return el.dataset.tip; }
    if (el.tagName === "TR") return rowTip(el);
    const txt = (el.innerText || el.textContent || "").replace(/\s+/g, " ").trim();
    if (el.tagName === "TH") return COLTIPS[txt] ? "列「" + txt + "」：" + COLTIPS[txt] : "";
    if (el.matches && el.matches(".kv > div")) {
      const dt = el.querySelector("dt"), dd = el.querySelector("dd");
      const k = dt ? dt.textContent.trim() : "";
      const KV = { "Connection Type": "接続方式。", "Connected": "PoP に連続して接続している時間。短いと頻繁に切れている可能性があります。", "Connected PoP": "今つながっている PoP。", "Socket Version": "Socket のソフトウェアのバージョン（自動更新）。", "Last Update": "Socket が PoP から最後に更新を受けてからの時間。", "Native Range": "拠点 LAN のアドレス範囲。" };
      return "【現状】" + k + "：" + (dd ? dd.textContent.trim() : "") + (KV[k] ? "\n" + KV[k] : "");
    }
    if (TIPS[txt]) return TIPS[txt];
    const first = txt.split(" ")[0];
    if (!txt && el.getAttribute && el.getAttribute("aria-label")) return el.getAttribute("aria-label");
    if (el.classList && el.classList.contains("mission-fab")) return "練習の課題リストを開きます。操作するとチェックが付きます。";
    if (el.closest && el.closest(".switch")) return "オン（緑）で有効、オフ（灰色）で無効です。";
    return TIPS[first] && first.length > 2 ? TIPS[first] : "";
  }
  function showTip(el, text) {
    text = text || tipText(el);
    if (!text) return;
    if (!tipEl) { tipEl = document.createElement("div"); tipEl.className = "tipbox"; tipEl.setAttribute("role", "tooltip"); tipEl.id = "tipbox"; document.body.appendChild(tipEl); }
    tipEl.textContent = text;
    tipEl.hidden = false;
    let r = el.getBoundingClientRect();
    // 大きな要素（行・図など）はマウスの位置に出す
    if ((r.height > 44 || r.width > 420 || el.tagName === "TR") && mouse.x) r = { left: mouse.x - 1, right: mouse.x + 1, top: mouse.y - 10, bottom: mouse.y + 10, width: 2, height: 20 };
    const w = tipEl.offsetWidth, h = tipEl.offsetHeight;
    let top = r.bottom + 8, above = false;
    if (top + h > innerHeight - 8) { top = r.top - h - 8; above = true; }
    let left = Math.max(8, Math.min(r.left + r.width / 2 - w / 2, innerWidth - w - 8));
    tipEl.style.top = Math.max(8, top) + "px"; tipEl.style.left = left + "px";
    tipEl.classList.toggle("above", above);
    tipEl.style.setProperty("--ax", Math.max(10, Math.min(w - 10, r.left + r.width / 2 - left)) + "px");
    if (el.setAttribute) el.setAttribute("aria-describedby", "tipbox");
  }
  function hideTip() { clearTimeout(tipTimer); if (tipEl) tipEl.hidden = true; if (tipFor && tipFor.removeAttribute) tipFor.removeAttribute("aria-describedby"); tipFor = null; }
  App.hideTip = hideTip;
  const TIP_SEL = "button, a.btn, a.side-item, .tabs a, .guide-btn, .switch, [data-tip], .node, .train-pill, tbody tr, thead th, .kv > div";
  function findTip(target) {
    let el = target.closest ? target.closest(TIP_SEL) : null;
    while (el) {
      if (el.closest(".pop, .tipbox")) return null;
      const t = tipText(el);
      if (t) return { el, t };
      el = el.parentElement ? el.parentElement.closest(TIP_SEL) : null;
    }
    return null;
  }
  document.addEventListener("mousemove", (e) => { mouse = { x: e.clientX, y: e.clientY }; }, { passive: true });
  document.addEventListener("mouseover", (e) => {
    const f = findTip(e.target);
    const el = f ? f.el : null;
    if (el === tipFor) return;
    hideTip();
    if (!f) return;
    tipFor = el;
    tipTimer = setTimeout(() => showTip(el, f.t), 380);
  });
  document.addEventListener("mouseout", (e) => { if (tipFor && !tipFor.contains(e.relatedTarget)) hideTip(); });
  document.addEventListener("focusin", (e) => { if (!e.target.matches || !e.target.matches(":focus-visible")) return; const f = findTip(e.target); if (f) { hideTip(); tipFor = f.el; mouse = { x: 0, y: 0 }; showTip(f.el, f.t); } });
  document.addEventListener("focusout", hideTip);
  document.addEventListener("mousedown", hideTip);
  document.addEventListener("scroll", hideTip, true);
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") hideTip(); });

  /* =====================================================================
     初回の「画面の見方」ポップアップ（右上の ? でいつでも再表示）
     ===================================================================== */
  App.tour = () => {
    $$(".tour").forEach((n) => n.remove());
    const m = document.createElement("div");
    m.className = "modal tour";
    m.setAttribute("role", "dialog"); m.setAttribute("aria-modal", "true"); m.setAttribute("aria-labelledby", "tourTitle");
    const TT = ["", "① 上部タブ：大きな分類を切り替えます。", "② 左メニュー：タブの中の画面を選びます。", "③ 作業エリア：一覧で状態を確認し、New や行のクリックで編集します。", "④ ボタンや表の行、図にマウスを乗せると、このような説明が出ます。", "⑤ 操作要領：図解の手順書を開きます。", "⑥ 研修ミッション：練習の課題リスト。"];
    const C = (n, x, y) => `<g data-tip="${TT[n]}"><circle cx="${x}" cy="${y}" r="11" fill="#e58a00"/><text x="${x}" y="${y + 4}" text-anchor="middle" font-size="12" font-weight="700" fill="#fff">${n}</text></g>`;
    m.innerHTML = `<div class="tour-card">
      <p class="tour-eyebrow">はじめての方へ</p>
      <h2 id="tourTitle">画面の見方と、まず最初にやること</h2>
      <div class="tour-grid">
        <svg viewBox="0 0 420 250" class="tour-fig" role="img" aria-label="画面の構成図">
          <rect x="1" y="1" width="418" height="248" rx="6" fill="#f4f5f7" stroke="#c9ced4"/>
          <rect x="1" y="1" width="418" height="30" rx="6" fill="#fff" stroke="#e1e4e8"/>
          <rect x="1" y="1" width="78" height="30" fill="#1f8a5b"/><text x="10" y="20" font-size="10" fill="#fff" font-weight="700">CMA TRAINER</text>
          <text x="96" y="20" font-size="9.5" fill="#1f8a5b" font-weight="700">Monitoring</text><rect x="94" y="27" width="52" height="3" fill="#1f8a5b"/>
          <text x="154" y="20" font-size="9.5" fill="#2b2f33">Network  Access  Security  …</text>
          <rect x="318" y="9" width="58" height="14" rx="7" fill="#eaf6ef" stroke="#1f8a5b"/><text x="347" y="19" font-size="8.5" text-anchor="middle" fill="#1f8a5b">操作要領</text>
          <circle cx="398" cy="16" r="7" fill="none" stroke="#2b2f33"/><text x="398" y="19.5" font-size="9" text-anchor="middle">?</text>
          <rect x="1" y="31" width="78" height="218" fill="#fff" stroke="#e1e4e8"/>
          <text x="9" y="50" font-size="7.5" fill="#6b7178">INVESTIGATION</text>
          <rect x="1" y="56" width="78" height="16" fill="#eaf6ef"/><rect x="1" y="56" width="3" height="16" fill="#1f8a5b"/><text x="12" y="67" font-size="8.5">Topology</text>
          <text x="12" y="85" font-size="8.5">Events</text><text x="12" y="101" font-size="8.5">Audit Trail</text>
          <rect x="92" y="44" width="314" height="24" rx="2" fill="#fffbea" stroke="#f1df9b"/><text x="100" y="60" font-size="8.5" fill="#6c5300">ヒント：この画面で注意するポイント</text>
          <rect x="92" y="76" width="314" height="150" rx="2" fill="#fff" stroke="#e1e4e8"/>
          <rect x="256" y="84" width="34" height="14" rx="2" fill="#fff" stroke="#c9ced4"/><text x="273" y="94" font-size="8" text-anchor="middle">New</text>
          <rect x="294" y="84" width="34" height="14" rx="2" fill="#fff" stroke="#c9ced4"/><text x="311" y="94" font-size="8" text-anchor="middle">Save</text>
          <rect x="332" y="84" width="44" height="14" rx="2" fill="#1f8a5b"/><text x="354" y="94" font-size="8" text-anchor="middle" fill="#fff">Publish</text>
          <rect x="300" y="100" width="98" height="20" rx="2" fill="#2b2f33"/><text x="349" y="113" font-size="7.5" text-anchor="middle" fill="#fff">マウスを乗せると説明</text>
          <path d="M311 98l4 3h-8z" fill="#2b2f33"/>
          ${[0, 1, 2, 3].map((k) => `<rect x="100" y="${128 + k * 22}" width="290" height="14" fill="${k % 2 ? "#fff" : "#f6f8fa"}"/>`).join("")}
          <rect x="316" y="226" width="96" height="18" rx="9" fill="#263238"/><text x="364" y="238" font-size="8" text-anchor="middle" fill="#fff">研修ミッション 0/15</text>
          ${C(1, 120, 10)}${C(2, 40, 120)}${C(3, 220, 160)}${C(4, 395, 120)}${C(5, 330, 36)}${C(6, 300, 226)}
        </svg>
        <ol class="tour-legend">
          <li><b>上部タブ</b>：大きな分類（Monitoring・Network・Security など）を切り替えます。</li>
          <li><b>左メニュー</b>：タブの中の画面を選びます。</li>
          <li><b>作業エリア</b>：一覧で状態を確認し、［New］や行のクリックで編集します。</li>
          <li><b>ボタンの説明</b>：ボタンやメニューにマウスを乗せると、何をするボタンか表示されます。</li>
          <li><b>操作要領</b>：図解の手順書を開きます。迷ったらここ。</li>
          <li><b>研修ミッション</b>：練習の課題リスト。操作すると自動でチェックが付きます。</li>
        </ol>
      </div>
      <div class="must">
        <h3>まず最初に、必ずやること</h3>
        <ol>
          <li><span>1</span><div><b>変更の反映ルールを覚える</b>：Apply → <b>Save</b> → <b>Publish</b>。Save だけでは反映されません。</div></li>
          <li><span>2</span><div><b>Topology で全体を確認</b>：赤い拠点（切断）がないかを見るのが毎日の第一歩です。</div></li>
          <li><span>3</span><div><b>研修ミッションを上から順に</b>：右下のボタンから。1つ目は Internet Firewall のルール追加が最重要です。</div></li>
        </ol>
      </div>
      <div class="tour-f"><label class="check"><input type="checkbox" id="tourNo" checked>次回から自動で表示しない</label>
        <a class="btn" href="guide.html#must">${App.icon("book")}操作要領を開く</a><button class="btn btn-primary" type="button" data-go>はじめる</button></div>
    </div>`;
    document.body.appendChild(m);
    const close = () => {
      if ($("#tourNo", m).checked) App.db.set("tourSeen", true);
      m.remove();
    };
    m.addEventListener("click", (e) => { if (e.target === m || e.target.closest("[data-go]")) close(); if (e.target.closest("a.btn")) App.db.set("tourSeen", true); });
    m.addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });
    $("[data-go]", m).focus();
  };

  /* ---------------- 起動 ---------------- */
  document.addEventListener("DOMContentLoaded", () => {
    renderShell();
    if (!document.body.dataset.nomission) renderMissions();
    if (!document.body.dataset.notour && !App.db.get("tourSeen", null)) setTimeout(App.tour, 250);
  });
})();
