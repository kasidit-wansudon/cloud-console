import { ACCOUNT, WORKERS, D1_DBS, KV_NS, R2_BUCKETS, requestData, latencyData, resourcePie, costEstimate, securityItems, recommendations } from "./data.js";
import { icons } from "./icons.js";
import { drawBarChart, drawLineChart, drawPieChart } from "./charts.js";

// ─── State ────────────────────────────────────────────────────────
let currentTab = "overview";

// ─── Helpers ──────────────────────────────────────────────────────
const $ = (sel) => document.querySelector(sel);
const h = (tag, cls, inner) => {
  const el = document.createElement(tag);
  if (cls) el.className = cls;
  if (typeof inner === "string") el.innerHTML = inner;
  else if (inner instanceof HTMLElement) el.appendChild(inner);
  else if (Array.isArray(inner)) inner.forEach((c) => c && el.appendChild(c));
  return el;
};

function badge(text, variant = "muted") {
  return `<span class="badge ${variant}">${text}</span>`;
}

// ─── Clock ────────────────────────────────────────────────────────
function startClock() {
  const el = $("#clock");
  if (!el) return;
  const tick = () => { el.textContent = new Date().toLocaleTimeString(); };
  tick();
  setInterval(tick, 1000);
}

// ─── Tab Switching ────────────────────────────────────────────────
const TABS = [
  { id: "overview", label: "Overview", icon: "globe" },
  { id: "workers", label: "Workers", icon: "zap" },
  { id: "d1", label: "D1", icon: "database" },
  { id: "kv", label: "KV", icon: "layers" },
  { id: "r2", label: "R2", icon: "hardDrive" },
  { id: "security", label: "Security", icon: "shield" },
  { id: "cost", label: "Cost", icon: "dollar" },
  { id: "actions", label: "Actions", icon: "trending" },
];

function renderNav() {
  return TABS.map(
    (t) =>
      `<button class="nav-btn ${currentTab === t.id ? "active" : ""}" data-tab="${t.id}">${icons[t.icon]}${t.label}</button>`
  ).join("");
}

// ─── Panels ───────────────────────────────────────────────────────
function renderStats() {
  return `
    <div class="stats-grid">
      <div class="card stat-card">
        <div class="stat-icon orange">${icons.zap}</div>
        <div><div class="stat-label">Workers</div><div class="stat-value">${WORKERS.length}</div><div class="stat-sub">${WORKERS.length} active</div></div>
      </div>
      <div class="card stat-card">
        <div class="stat-icon blue">${icons.database}</div>
        <div><div class="stat-label">D1 Databases</div><div class="stat-value">${D1_DBS.length}</div><div class="stat-sub">catcare (APAC)</div></div>
      </div>
      <div class="card stat-card">
        <div class="stat-icon violet">${icons.layers}</div>
        <div><div class="stat-label">KV Namespaces</div><div class="stat-value">${KV_NS.length}</div><div class="stat-sub">4 recommended</div></div>
      </div>
      <div class="card stat-card">
        <div class="stat-icon cyan">${icons.hardDrive}</div>
        <div><div class="stat-label">R2 Buckets</div><div class="stat-value">${R2_BUCKETS.length}</div><div class="stat-sub">3 recommended</div></div>
      </div>
    </div>`;
}

function renderAccountCard() {
  return `
    <div class="card" style="margin-bottom:.75rem">
      <div class="card-header">${icons.settings}<span style="font-size:.625rem;text-transform:uppercase;letter-spacing:.06em;color:var(--text-4)">Account</span></div>
      <div class="card-body">
        <div class="info-grid">
          <div class="info-box"><div class="label">Account ID</div><div class="value mono">${ACCOUNT.id}</div></div>
          <div class="info-box"><div class="label">Email</div><div class="value">${ACCOUNT.email}</div></div>
          <div class="info-box"><div class="label">Created</div><div class="value">${ACCOUNT.created}</div></div>
        </div>
      </div>
    </div>`;
}

function renderCharts() {
  return `
    <div class="section-header" style="color:var(--orange)">${icons.activity}<h2>Performance Metrics</h2></div>
    <div class="charts-row">
      <div class="card card-body">
        <div class="chart-title">Requests / Day (sample)</div>
        <div class="chart-area"><canvas id="chart-bar"></canvas></div>
      </div>
      <div class="card card-body">
        <div class="chart-title">Latency (ms) by Hour</div>
        <div class="chart-area"><canvas id="chart-line"></canvas></div>
      </div>
    </div>
    <div class="card" style="margin-bottom:.75rem">
      <div class="card-body">
        <div class="chart-title">Resource Distribution</div>
        <div class="pie-wrap">
          <div style="width:140px;height:140px"><canvas id="chart-pie" style="width:140px;height:140px"></canvas></div>
          <div class="pie-legend">
            ${resourcePie.map((r) => `<div class="pie-legend-item"><div class="pie-swatch" style="background:${r.color}"></div>${r.name} (${r.value})</div>`).join("")}
          </div>
        </div>
      </div>
    </div>`;
}

function renderSecurityPanel() {
  const ok = securityItems.filter((s) => s.status === "ok").length;
  const warn = securityItems.filter((s) => s.status === "warn").length;
  return `
    <div>
      <div class="section-header" style="color:var(--green)">${icons.shield}<h2>Security Audit</h2></div>
      <div class="card">
        <div class="sec-summary">
          <div class="ok">${icons.checkCircle} ${ok} Passed</div>
          <div class="warn">${icons.alertTri} ${warn} Warnings</div>
        </div>
        ${securityItems.map((s) => `
          <div class="sec-row">
            <div class="sec-left"><div class="sec-dot ${s.status}"></div><span>${s.item}</span></div>
            <div class="sec-detail">${s.detail}</div>
          </div>`).join("")}
      </div>
    </div>`;
}

function renderCostPanel() {
  const total = costEstimate.reduce((a, c) => a + parseFloat(c.cost.replace("$", "").replace("/yr", "") || "0"), 0);
  return `
    <div>
      <div class="section-header" style="color:var(--green)">${icons.dollar}<h2>Cost Estimation</h2></div>
      <div class="card">
        <div class="cost-header">
          <span style="font-size:.6875rem;color:var(--text-4)">Estimated Monthly (~1K daily users)</span>
          <span class="cost-total">~$${total.toFixed(2)}/mo</span>
        </div>
        <table class="table">
          <thead><tr><th>Resource</th><th>Usage</th><th style="text-align:right">Cost</th><th style="text-align:right">Note</th></tr></thead>
          <tbody>
            ${costEstimate.map((c) => `<tr><td style="color:var(--text)">${c.resource}</td><td class="mono" style="font-size:.75rem">${c.usage}</td><td style="text-align:right" class="mono">${c.cost}</td><td style="text-align:right;font-size:.6875rem;color:var(--text-5)">${c.note}</td></tr>`).join("")}
          </tbody>
        </table>
      </div>
    </div>`;
}

function renderWorkersPanel() {
  const w = WORKERS[0];
  return `
    <div class="section-header" style="color:var(--orange)">${icons.zap}<h2>Workers</h2>${badge(WORKERS.length, "muted")}</div>
    <div class="card">
      <button class="worker-toggle" id="worker-toggle">
        <div class="worker-left"><div class="worker-dot"></div><span class="worker-name">${w.name}</span>${badge("active", "success")}</div>
        <span id="worker-chev">${icons.chevDown}</span>
      </button>
      <div class="worker-detail" id="worker-detail" style="display:none">
        <div class="worker-meta">
          <span>ID</span><span class="val">${w.id}</span>
          <span>Created</span><span class="val">${w.created}</span>
          <span>Modified</span><span class="val">${w.modified}</span>
          <span>DB Binding</span><span class="val">${w.binding}</span>
          <span>Purpose</span><span class="val">${w.purpose}</span>
        </div>
        <div style="margin-bottom:.75rem">
          <div style="font-size:.625rem;text-transform:uppercase;letter-spacing:.06em;color:var(--text-4);margin-bottom:.375rem">Issues Found (${w.issues.length})</div>
          ${w.issues.map((iss) => `<div class="issue-item">${icons.alertTri} ${iss}</div>`).join("")}
        </div>
        <div>
          <div style="font-size:.625rem;text-transform:uppercase;letter-spacing:.06em;color:var(--text-4);margin-bottom:.375rem">Source Code</div>
          <pre class="code-block">${w.code}</pre>
        </div>
      </div>
    </div>`;
}

function renderD1Panel() {
  const db = D1_DBS[0];
  return `
    <div class="section-header" style="color:var(--blue)">${icons.database}<h2>D1 Databases</h2>${badge(D1_DBS.length, "muted")}</div>
    <div class="card card-body">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:.75rem">
        <div style="display:flex;align-items:center;gap:.5rem">
          <span style="color:var(--blue)">${icons.database}</span>
          <span class="mono" style="font-size:.8125rem">${db.name}</span>
          ${badge(db.version, "info")}
          ${badge(db.region, "muted")}
        </div>
        ${badge(db.tables + " tables", db.tables > 0 ? "success" : "warning")}
      </div>
      <div class="info-grid">
        <div class="info-box"><div class="label">UUID</div><div class="value mono" style="word-break:break-all">${db.uuid}</div></div>
        <div class="info-box"><div class="label">Size</div><div class="value">${db.size}</div></div>
        <div class="info-box"><div class="label">Created</div><div class="value">${db.created}</div></div>
        <div class="info-box"><div class="label">Replication</div><div class="value">${db.replication ? "Enabled" : "Disabled"}</div></div>
      </div>
      ${db.tables === 0 ? `
        <div class="alert warning">
          ${icons.alertTri}
          <div><strong>Schema needed:</strong> Database is empty. Create tables: <code>users</code>, <code>cats</code>, <code>appointments</code>, <code>medical_records</code>, <code>vaccines</code></div>
        </div>` : ""}
    </div>`;
}

function renderKVPanel() {
  return `
    <div class="section-header" style="color:var(--violet)">${icons.layers}<h2>KV Namespaces</h2>${badge(KV_NS.length, "muted")}</div>
    <div class="card">
      <div class="empty-state">${icons.box}<p>No KV namespaces created yet</p><small>Create one to get started</small></div>
      <div style="border-top:1px solid var(--border)">
        <div style="padding:.75rem 1rem .25rem;font-size:.6875rem;color:var(--text-4)">Recommended namespaces:</div>
        <div class="rec-grid">
          ${["cache", "sessions", "config", "notifications"].map((ns) => `<div class="rec-item"><div class="rec-dot" style="background:var(--violet)"></div><span class="mono">${ns}</span></div>`).join("")}
        </div>
      </div>
    </div>`;
}

function renderR2Panel() {
  return `
    <div class="section-header" style="color:var(--cyan)">${icons.hardDrive}<h2>R2 Buckets</h2>${badge(R2_BUCKETS.length, "muted")}</div>
    <div class="card">
      <div class="empty-state">${icons.box}<p>No R2 buckets created yet</p><small>Create one to get started</small></div>
      <div style="border-top:1px solid var(--border);padding:1rem">
        <div style="font-size:.6875rem;color:var(--text-4);margin-bottom:.5rem">Recommended buckets:</div>
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:.5rem">
          ${[{ n: "catcare-media", e: "📸" }, { n: "catcare-documents", e: "📄" }, { n: "catcare-backups", e: "💾" }].map((b) => `<div class="rec-bucket"><div class="emoji">${b.e}</div><div class="mono">${b.n}</div></div>`).join("")}
        </div>
      </div>
    </div>`;
}

function renderRecommendations() {
  return `
    <div class="section-header" style="color:var(--amber)">${icons.trending}<h2>Recommendations</h2>${badge(recommendations.length, "muted")}</div>
    ${recommendations.map((r) => `
      <div class="card rec-card">
        ${badge(r.priority, r.priority.toLowerCase())}
        <div style="flex:1;min-width:0"><div class="title">${r.title}</div><div class="desc">${r.desc}</div></div>
        <div class="rec-effort">${r.effort}</div>
      </div>`).join("")}`;
}

// ─── Render ───────────────────────────────────────────────────────
function render() {
  const content = $("#content");
  let html = "";

  switch (currentTab) {
    case "overview":
      html = renderStats() + renderAccountCard() + renderCharts() + `<div class="two-col">${renderSecurityPanel()}${renderCostPanel()}</div>`;
      break;
    case "workers":
      html = renderWorkersPanel();
      break;
    case "d1":
      html = renderD1Panel();
      break;
    case "kv":
      html = renderKVPanel();
      break;
    case "r2":
      html = renderR2Panel();
      break;
    case "security":
      html = renderSecurityPanel();
      break;
    case "cost":
      html = renderCostPanel();
      break;
    case "actions":
      html = renderRecommendations();
      break;
  }

  content.innerHTML = html;
  $("#nav").innerHTML = renderNav();

  // Bind nav clicks
  document.querySelectorAll(".nav-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      currentTab = btn.dataset.tab;
      render();
    });
  });

  // Bind worker toggle
  const wt = document.getElementById("worker-toggle");
  if (wt) {
    wt.addEventListener("click", () => {
      const det = document.getElementById("worker-detail");
      const chev = document.getElementById("worker-chev");
      const visible = det.style.display !== "none";
      det.style.display = visible ? "none" : "block";
      chev.innerHTML = visible ? icons.chevDown : icons.chevUp;
    });
  }

  // Draw charts (after DOM update)
  requestAnimationFrame(() => {
    const bar = document.getElementById("chart-bar");
    if (bar) drawBarChart(bar, requestData);

    const line = document.getElementById("chart-line");
    if (line) drawLineChart(line, latencyData, { lines: [{ key: "p50", color: "#3b82f6" }, { key: "p99", color: "#f97316" }] });

    const pie = document.getElementById("chart-pie");
    if (pie) drawPieChart(pie, resourcePie);
  });
}

// ─── Boot ─────────────────────────────────────────────────────────
function init() {
  const app = $("#app");
  app.innerHTML = `
    <header class="header">
      <div class="container header-inner">
        <div class="header-brand">
          <div class="header-logo">☁</div>
          <div>
            <div class="header-title">OWAY Cloud Console</div>
            <div class="header-sub">Cloudflare Infrastructure Dashboard</div>
          </div>
        </div>
        <div class="header-meta">
          <span class="mono email">${ACCOUNT.email}</span>
          <span class="mono" id="clock"></span>
          <span><span class="status-dot"></span> Connected</span>
        </div>
      </div>
    </header>
    <div class="container" style="padding-top:1.5rem;padding-bottom:3rem">
      <nav class="nav" id="nav"></nav>
      <div id="content"></div>
    </div>
    <footer class="footer">
      <div class="container footer-inner">
        <span>OWAY IT · Cloudflare Admin Dashboard</span>
        <span>Zero-dependency · Data from Cloudflare MCP API</span>
      </div>
    </footer>
  `;

  startClock();
  render();

  // Resize charts
  window.addEventListener("resize", () => {
    const bar = document.getElementById("chart-bar");
    if (bar) drawBarChart(bar, requestData);
    const line = document.getElementById("chart-line");
    if (line) drawLineChart(line, latencyData, { lines: [{ key: "p50", color: "#3b82f6" }, { key: "p99", color: "#f97316" }] });
    const pie = document.getElementById("chart-pie");
    if (pie) drawPieChart(pie, resourcePie);
  });
}

document.addEventListener("DOMContentLoaded", init);
