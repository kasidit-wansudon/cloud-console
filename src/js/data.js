// ─── Real Cloudflare Data (from MCP API audit 2026-03-28) ────────
export const ACCOUNT = {
  id: "697c43d79ac741e0928ec176b8286726",
  email: "Kasidit.wans@gmail.com",
  created: "2025-12-02",
};

export const WORKERS = [
  {
    name: "d1-template",
    id: "dfd9e5b023b0487d85a3ee2f2249bcd9",
    created: "2025-12-05",
    modified: "2025-12-05",
    status: "active",
    purpose: "D1 demo – queries comments table",
    binding: "catcare",
    issues: [
      "No error handling",
      "No request logging",
      "No rate limiting",
      "No input validation",
      "Missing CORS headers",
    ],
    code: `export default {
  async fetch(request, env) {
    const stmt = env.DB.prepare(
      "SELECT * FROM comments LIMIT 3"
    );
    const { results } = await stmt.all();
    return new Response(
      renderHtml(JSON.stringify(results, null, 2)),
      { headers: { "content-type": "text/html" } }
    );
  },
};`,
  },
];

export const D1_DBS = [
  {
    name: "catcare",
    uuid: "41caa162-47cd-4578-b11b-03ee743c4cc1",
    created: "2025-12-05",
    region: "APAC",
    size: "12 KB",
    tables: 0,
    replication: false,
    version: "production",
  },
];

export const KV_NS = [];
export const R2_BUCKETS = [];
export const HYPERDRIVE = [];

// ─── Performance Metrics (sample – replace with real analytics) ──
export const requestData = [
  { day: "Mon", requests: 1240 },
  { day: "Tue", requests: 1890 },
  { day: "Wed", requests: 2400 },
  { day: "Thu", requests: 1750 },
  { day: "Fri", requests: 3100 },
  { day: "Sat", requests: 980 },
  { day: "Sun", requests: 720 },
];

export const latencyData = [
  { hour: "00", p50: 12, p99: 45 },
  { hour: "04", p50: 10, p99: 38 },
  { hour: "08", p50: 18, p99: 62 },
  { hour: "12", p50: 22, p99: 78 },
  { hour: "16", p50: 25, p99: 85 },
  { hour: "20", p50: 15, p99: 52 },
];

export const resourcePie = [
  { name: "Workers", value: 1, color: "#f97316" },
  { name: "D1 DBs", value: 1, color: "#3b82f6" },
  { name: "KV", value: 0, color: "#3f3f46" },
  { name: "R2", value: 0, color: "#3f3f46" },
];

export const costEstimate = [
  { resource: "Workers", usage: "~10K req/day", cost: "$0", note: "Free tier" },
  { resource: "D1 Database", usage: "~1 GB", cost: "$0.75", note: "5M reads/day free" },
  { resource: "KV Storage", usage: "~100 MB", cost: "$0.50", note: "Not created yet" },
  { resource: "R2 Storage", usage: "~50 GB", cost: "$3.00", note: "Not created yet" },
  { resource: "Pages", usage: "Hosting", cost: "$0", note: "Free tier" },
  { resource: "Domain", usage: "1 domain", cost: "$12/yr", note: "CF registrar" },
];

export const securityItems = [
  { item: "SQL Injection", status: "ok", detail: "Protected – prepared statements" },
  { item: "HTTPS / TLS", status: "ok", detail: "Enabled by default" },
  { item: "DDoS Protection", status: "ok", detail: "Cloudflare default" },
  { item: "Encryption at Rest", status: "ok", detail: "D1 default" },
  { item: "API Authentication", status: "warn", detail: "Not implemented – add JWT" },
  { item: "Rate Limiting", status: "warn", detail: "Not configured" },
  { item: "CORS Headers", status: "warn", detail: "Not set on Worker" },
  { item: "Backups", status: "warn", detail: "Verify backup strategy" },
];

export const recommendations = [
  { priority: "P0", title: "Create D1 schema for catcare", desc: "Database has 0 tables – define users, cats, appointments, medical_records, vaccines", effort: "1 hr" },
  { priority: "P0", title: "Add error handling to d1-template", desc: "Worker has no try-catch – add proper error handling & logging", effort: "30 min" },
  { priority: "P1", title: "Create 4 KV namespaces", desc: "cache, sessions, config, notifications – needed for production", effort: "15 min" },
  { priority: "P1", title: "Create 3 R2 buckets", desc: "media, documents, backups – store files and backups", effort: "15 min" },
  { priority: "P1", title: "Implement JWT authentication", desc: "Protect API endpoints with JSON Web Tokens + KV sessions", effort: "4 hr" },
  { priority: "P2", title: "Set up CI/CD pipeline", desc: "GitHub Actions → Cloudflare Workers/Pages auto-deploy", effort: "2 hr" },
  { priority: "P2", title: "Enable D1 read replication", desc: "Improve availability for multi-region reads", effort: "10 min" },
  { priority: "P2", title: "Add CORS headers to Worker", desc: "Allow cross-origin requests from frontend domain", effort: "15 min" },
];
