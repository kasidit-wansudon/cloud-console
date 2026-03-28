// ─── Lightweight Chart.js–free canvas charts ──────────────────────
// Keeps zero external dependencies for fast deploy

export function drawBarChart(canvas, data, { barColor = "#f97316", labelKey = "day", valueKey = "requests" } = {}) {
  const ctx = canvas.getContext("2d");
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  ctx.scale(dpr, dpr);

  const W = rect.width, H = rect.height;
  const pad = { top: 10, right: 10, bottom: 28, left: 44 };
  const cW = W - pad.left - pad.right;
  const cH = H - pad.top - pad.bottom;
  const max = Math.max(...data.map((d) => d[valueKey])) * 1.15;
  const barW = cW / data.length * 0.6;
  const gap = cW / data.length;

  ctx.clearRect(0, 0, W, H);

  // Grid lines
  ctx.strokeStyle = "#27272a";
  ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i++) {
    const y = pad.top + (cH / 4) * i;
    ctx.beginPath();
    ctx.moveTo(pad.left, y);
    ctx.lineTo(W - pad.right, y);
    ctx.stroke();
    // Y labels
    ctx.fillStyle = "#52525b";
    ctx.font = "10px 'IBM Plex Mono', monospace";
    ctx.textAlign = "right";
    ctx.fillText(Math.round(max - (max / 4) * i), pad.left - 6, y + 4);
  }

  // Bars
  data.forEach((d, i) => {
    const x = pad.left + gap * i + (gap - barW) / 2;
    const h = (d[valueKey] / max) * cH;
    const y = pad.top + cH - h;

    // Bar
    ctx.fillStyle = barColor;
    ctx.beginPath();
    const r = 3;
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + barW - r, y);
    ctx.quadraticCurveTo(x + barW, y, x + barW, y + r);
    ctx.lineTo(x + barW, y + h);
    ctx.lineTo(x, y + h);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.fill();

    // X label
    ctx.fillStyle = "#52525b";
    ctx.font = "10px 'IBM Plex Mono', monospace";
    ctx.textAlign = "center";
    ctx.fillText(d[labelKey], x + barW / 2, H - 8);
  });
}

export function drawLineChart(canvas, data, { lines = [], labelKey = "hour" } = {}) {
  const ctx = canvas.getContext("2d");
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  ctx.scale(dpr, dpr);

  const W = rect.width, H = rect.height;
  const pad = { top: 10, right: 10, bottom: 28, left: 44 };
  const cW = W - pad.left - pad.right;
  const cH = H - pad.top - pad.bottom;

  const allVals = lines.flatMap((l) => data.map((d) => d[l.key]));
  const max = Math.max(...allVals) * 1.15;

  ctx.clearRect(0, 0, W, H);

  // Grid
  ctx.strokeStyle = "#27272a";
  ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i++) {
    const y = pad.top + (cH / 4) * i;
    ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(W - pad.right, y); ctx.stroke();
    ctx.fillStyle = "#52525b";
    ctx.font = "10px 'IBM Plex Mono', monospace";
    ctx.textAlign = "right";
    ctx.fillText(Math.round(max - (max / 4) * i), pad.left - 6, y + 4);
  }

  // X labels
  data.forEach((d, i) => {
    const x = pad.left + (cW / (data.length - 1)) * i;
    ctx.fillStyle = "#52525b";
    ctx.font = "10px 'IBM Plex Mono', monospace";
    ctx.textAlign = "center";
    ctx.fillText(d[labelKey], x, H - 8);
  });

  // Lines
  lines.forEach(({ key, color }) => {
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.lineJoin = "round";
    ctx.beginPath();
    data.forEach((d, i) => {
      const x = pad.left + (cW / (data.length - 1)) * i;
      const y = pad.top + cH - (d[key] / max) * cH;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Dots
    data.forEach((d, i) => {
      const x = pad.left + (cW / (data.length - 1)) * i;
      const y = pad.top + cH - (d[key] / max) * cH;
      ctx.fillStyle = color;
      ctx.beginPath(); ctx.arc(x, y, 3, 0, Math.PI * 2); ctx.fill();
    });
  });

  // Legend
  const lx = pad.left + 8;
  let ly = pad.top + 14;
  lines.forEach(({ key, color }) => {
    ctx.fillStyle = color;
    ctx.fillRect(lx, ly - 6, 12, 3);
    ctx.fillStyle = "#71717a";
    ctx.font = "10px 'IBM Plex Sans', sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(key.toUpperCase(), lx + 16, ly);
    ly += 14;
  });
}

export function drawPieChart(canvas, data) {
  const ctx = canvas.getContext("2d");
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  ctx.scale(dpr, dpr);

  const cx = rect.width / 2, cy = rect.height / 2;
  const outer = Math.min(cx, cy) - 8;
  const inner = outer * 0.6;
  const total = data.reduce((a, d) => a + Math.max(d.value, 0.25), 0); // min slice for visibility

  let angle = -Math.PI / 2;
  data.forEach((d) => {
    const sliceAngle = ((Math.max(d.value, 0.25)) / total) * Math.PI * 2;
    ctx.beginPath();
    ctx.arc(cx, cy, outer, angle, angle + sliceAngle);
    ctx.arc(cx, cy, inner, angle + sliceAngle, angle, true);
    ctx.closePath();
    ctx.fillStyle = d.color;
    ctx.fill();
    angle += sliceAngle;
  });
}
