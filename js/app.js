(() => {
  const $ = s => document.querySelector(s), root = $("#root");
  const fmt = n => Math.round(n || 0).toLocaleString("id-ID");
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const heat = r => (r > .6 ? "#ff7a66" : r > .25 ? "#f2b04a" : "#35d0b4");
  const levelClass = t => (t === "Tinggi" ? "bad" : t === "Sedang" ? "warn" : "ok");
  const riskLabel = r => (r > .6 ? ["Tinggi", "bad"] : r > .25 ? ["Sedang", "warn"] : ["Rendah", "ok"]);

  // ---- Ikon (sama dengan versi React) ----
  const P = {
    leaf: '<path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>',
    dashboard: '<rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/>',
    produksi: '<path d="M12 22V12"/><path d="M12 12c0-4 3-6 7-6 0 4-3 6-7 6Z"/><path d="M12 15c0-3-2.5-5-6-5 0 3 2.5 5 6 5Z"/>',
    peta: '<path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
    prediksi: '<path d="M3 3v18h18"/><path d="m7 15 4-4 3 3 6-7"/>',
    simulasi: '<path d="M10 2v7.5L4.5 19a2 2 0 0 0 1.7 3h11.6a2 2 0 0 0 1.7-3L14 9.5V2"/><path d="M8.5 2h7"/><path d="M7 16h10"/>',
    logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5"/><path d="M21 12H9"/>',
    box: '<path d="M21 8 12 3 3 8v8l9 5 9-5Z"/><path d="m3.3 7.5 8.7 5 8.7-5"/><path d="M12 22V12.5"/>',
    warehouse: '<path d="M22 8.35V20a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V8.35a1 1 0 0 1 .55-.9l9-4.5a1 1 0 0 1 .9 0l9 4.5a1 1 0 0 1 .55.9Z"/><path d="M6 21v-8h12v8"/><path d="M6 17h12"/>',
    cart: '<circle cx="9" cy="20" r="1.5"/><circle cx="18" cy="20" r="1.5"/><path d="M2 3h3l2.7 12.4a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.5L21 7H6"/>',
    truck: '<path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11h2"/><path d="M14 9h4l4 4v4h-2"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/><path d="M9 18h6"/>',
    inbox: '<path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.5 5.1 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.5-6.9A2 2 0 0 0 16.7 4H7.3a2 2 0 0 0-1.8 1.1Z"/>',
    play: '<path d="m6 3 14 9-14 9Z"/>', plus: '<path d="M12 5v14"/><path d="M5 12h14"/>',
    globe: '<circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15 15 0 0 1 0 20 15 15 0 0 1 0-20Z"/>',
    chart: '<path d="M3 3v18h18"/><path d="M7 16v-5"/><path d="M12 16V7"/><path d="M17 16v-8"/>',
    trash: '<polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>'
  };
  const ic = (n, s = 20, w = 1.9) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${P[n]}</svg>`;
  const Badge = (tone, t) => `<span class="badge ${tone}">${esc(t)}</span>`;
  const Empty = (icon, title, hint) => `<div class="empty">${ic(icon, 34, 1.5)}<b>${title}</b>${hint ? `<span>${hint}</span>` : ""}</div>`;
  const Head = (title, hint, extra = "") => `<div class="card-head"><div><h2>${title}</h2>${hint ? `<p>${hint}</p>` : ""}</div>${extra}</div>`;
  const Alert = m => `<div class="alert" role="alert">${esc(m)}</div>`;
  const loading = (kpi = 4) => `<div class="grid">${'<div class="skeleton sk-kpi"></div>'.repeat(kpi)}</div><div class="skeleton sk-chart"></div>`;

  // ---- Sesi ----
  let user = null, tab = "Dashboard", token = null, chart = null, map = null;
  try { token = localStorage.getItem("token"); user = token ? JSON.parse(atob(token)) : null; } catch { token = null; user = null; }
  const api = (path, body, method) => mockApi(path, body, method || (body ? "POST" : "GET"), token);
  const setToken = t => { token = t; try { t ? localStorage.setItem("token", t) : localStorage.removeItem("token"); } catch {} };

  if (window.Chart) { Chart.defaults.color = "#8ca3a6"; Chart.defaults.font.family = "Inter, system-ui, sans-serif"; }
  const ALL = ["Dashboard", "Produksi", "Peta", "Prediksi", "Simulasi"];
  const TABS = { PETANI: ["Dashboard", "Produksi"], KOPERASI: ALL, ADMIN: ALL };
  const ICONS = { Dashboard: "dashboard", Produksi: "produksi", Peta: "peta", Prediksi: "prediksi", Simulasi: "simulasi" };
  const SUB = { Dashboard: "Ringkasan kondisi rantai pasok terkini", Produksi: "Catat dan tinjau hasil panen", Peta: "Sebaran koperasi dan jalur distribusi",
    Prediksi: "Prakiraan produksi berdasarkan data historis", Simulasi: "Uji dampak perubahan kondisi pasar" };
  const ROLE = { PETANI: "Petani", KOPERASI: "Koperasi", ADMIN: "Administrator" };
  const brand = `<div class="brand"><span class="brand-logo">${ic("leaf", 22)}</span><div><b>ASEAN AgroTwin</b><small>Digital Twin Pertanian</small></div></div>`;

  // ---- Animasi aliran rantai pasok (canvas) ----
  function flows(cv, t) {
    if (!cv) return; const x = cv.getContext("2d"), D = devicePixelRatio || 1; let W = 0, H = 0;
    const fit = () => { if (!cv.isConnected) return; const r = cv.getBoundingClientRect(); W = r.width; H = r.height; cv.width = W * D; cv.height = H * D; };
    const pt = (la, lo) => [W * .06 + (lo - 94) / 34 * W * .88, H * .1 + (24 - la) / 34 * H * .8];
    const E = t.routes.map((r, i) => ({ a: [r.dari.lat, r.dari.lng], b: [r.tujuanLat, r.tujuanLng], late: r.keterlambatanHari > 0, i }));
    addEventListener("resize", fit);
    const q = (a, c, b, k) => (1 - k) * (1 - k) * a + 2 * (1 - k) * k * c + k * k * b;
    const loop = ts => {
      if (!cv.isConnected) return; if (!W) fit();
      x.setTransform(D, 0, 0, D, 0, 0); x.clearRect(0, 0, W, H);
      E.forEach(e => {
        const a = pt(...e.a), b = pt(...e.b), cx = (a[0] + b[0]) / 2 - (b[1] - a[1]) * .15, cy = (a[1] + b[1]) / 2 + (b[0] - a[0]) * .15;
        x.beginPath(); x.moveTo(a[0], a[1]); x.quadraticCurveTo(cx, cy, b[0], b[1]); x.strokeStyle = e.late ? "rgba(255,122,102,.35)" : "rgba(53,208,180,.28)"; x.lineWidth = 1.2; x.stroke();
        for (let k = 0; k < 4; k++) { const f = (ts * .00018 * (e.late ? .5 : 1) + k / 4 + e.i * .13) % 1;
          x.beginPath(); x.arc(q(a[0], cx, b[0], f), q(a[1], cy, b[1], f), 2.3, 0, 7); x.fillStyle = e.late ? "#ff7a66" : "#35d0b4"; x.fill(); }
        x.fillStyle = "#f2b04a"; x.fillRect(b[0] - 3.5, b[1] - 3.5, 7, 7);
      });
      t.nodes.forEach((n, i) => { const [px, py] = pt(n.lat, n.lng), c = heat(n.risiko), f = (ts * .0007 + i * .3) % 1;
        x.beginPath(); x.arc(px, py, 5 + f * 16, 0, 7); x.strokeStyle = c; x.globalAlpha = (1 - f) * .5; x.lineWidth = 1.5; x.stroke(); x.globalAlpha = 1;
        x.beginPath(); x.arc(px, py, 5, 0, 7); x.fillStyle = c; x.fill(); });
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }
  function countUp() {
    document.querySelectorAll("[data-n]").forEach(el => { const to = +el.dataset.n, pre = el.dataset.p || "", suf = el.dataset.s || "", t0 = performance.now();
      const step = now => { const k = Math.min(1, (now - t0) / 800), e = 1 - Math.pow(1 - k, 3); el.textContent = pre + fmt(to * e) + suf; if (k < 1) requestAnimationFrame(step); };
      requestAnimationFrame(step); });
  }
  const go = t => { tab = t; renderShell(); };
  function logout() { setToken(null); user = null; tab = "Dashboard"; cleanup(); renderLogin(); }
  function palette() {
    if ($("#pal")) return;
    const items = [...TABS[user.role].map(t => ["Buka " + t, () => go(t)]),
      ...(user.role !== "PETANI" ? PRESETS.map(([n, v]) => ["Skenario: " + n, () => { sim.p = { ...ZERO, ...v }; go("Simulasi"); }]) : []), ["Keluar", logout]];
    const d = document.createElement("div"); d.id = "pal"; d.className = "pal"; d.innerHTML = '<div class="pal-box"><input placeholder="Ketik perintah, mis. peta" aria-label="Cari perintah"><ul></ul></div>'; document.body.appendChild(d);
    const inp = d.querySelector("input"), ul = d.querySelector("ul"); let list = items, i = 0;
    const draw = () => { ul.innerHTML = list.map((it, k) => `<li data-i="${k}" aria-selected="${k === i}">${esc(it[0])}</li>`).join(""); };
    const close = () => d.remove(), run = k => { const it = list[k]; close(); it && it[1](); };
    inp.oninput = () => { list = items.filter(it => it[0].toLowerCase().includes(inp.value.toLowerCase())); i = 0; draw(); };
    inp.onkeydown = e => { if (e.key === "ArrowDown") { i = Math.min(list.length - 1, i + 1); draw(); e.preventDefault(); } else if (e.key === "ArrowUp") { i = Math.max(0, i - 1); draw(); e.preventDefault(); } else if (e.key === "Enter") run(i); else if (e.key === "Escape") close(); };
    d.onclick = e => { if (e.target === d) close(); const li = e.target.closest("li"); if (li) run(+li.dataset.i); };
    draw(); inp.focus();
  }
  document.addEventListener("keydown", e => { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k" && user) { e.preventDefault(); palette(); } });

  // ---- Login ----
  const DEMO = [["Koperasi", "koperasi@agrotwin.id"], ["Petani", "petani@agrotwin.id"], ["Admin", "admin@agrotwin.id"]];
  const POINTS = [["globe", "Pantau rantai pasok koperasi di seluruh ASEAN"], ["prediksi", "Prediksi produksi berbasis data historis"], ["simulasi", "Uji skenario harga energi, cuaca, dan kebijakan dagang"]];
  function renderLogin(err = "") {
    root.innerHTML = `<div class="auth"><canvas id="fx" class="auth-fx"></canvas><div class="auth-in"><section class="auth-copy">${brand}
      <h2>Keputusan pertanian yang lebih <em>terukur</em>.</h2><p>Platform digital twin untuk petani, koperasi, dan administrator dalam memantau produksi, stok, dan distribusi.</p>
      <ul class="points">${POINTS.map(([i, t]) => `<li><span>${ic(i, 17)}</span>${t}</li>`).join("")}</ul></section>
      <form class="auth-form" id="login"><h2>Selamat datang</h2><p>Masuk untuk melanjutkan ke dasbor Anda.</p>
        <label>Email<input type="email" name="email" autocomplete="username" required value="koperasi@agrotwin.id"></label>
        <label>Kata sandi<input type="password" name="password" autocomplete="current-password" required value="password123"></label>
        ${err ? Alert(err) : ""}<button class="btn block" id="lbtn">Masuk</button>
        <div class="demo"><p>Akun contoh (kata sandi: password123)</p><div>${DEMO.map(([n, e]) => `<button type="button" class="btn ghost sm" data-email="${e}">${n}</button>`).join("")}</div></div>
      </form></div></div>`;
    flows($("#fx"), buildTwin(null));
  }

  // ---- Shell ----
  function renderShell() {
    if (!TABS[user.role].includes(tab)) tab = "Dashboard";
    root.innerHTML = `<header class="bar">${brand}
      <nav class="dock" aria-label="Menu utama">${TABS[user.role].map(t => `<button data-tab="${t}" aria-current="${t === tab}">${ic(ICONS[t], 18)}<span>${t}</span></button>`).join("")}</nav>
      <div class="user"><button class="kbd" id="kbd" aria-label="Buka palet perintah">Cari <kbd>Ctrl K</kbd></button>
        <div class="who"><b>${esc(user.nama)}</b><span>${ROLE[user.role]}</span></div><span class="avatar" aria-hidden="true">${esc(user.nama.trim().charAt(0).toUpperCase())}</span>
        <button class="btn ghost sm" id="logout" aria-label="Keluar">${ic("logout", 16)}</button></div></header><main id="main" class="page"></main>`;
    showPage();
  }
  function cleanup() { if (chart) { chart.destroy(); chart = null; } if (map) { map.remove(); map = null; } }
  const Hd = t => `<div class="hd"><span class="eyebrow">${ROLE[user.role]}</span><h1>${t}</h1><p>${SUB[t]}</p></div>`;
  const setMain = h => { $("#main").innerHTML = Hd(tab) + h; };
  async function showPage() {
    cleanup(); const t = tab; $("#main").className = "page"; setMain(loading(t === "Dashboard" ? 4 : 0));
    try { const h = await PAGES[t](); if (t === tab) { setMain(h.html); $("#main").className = "page enter"; setTimeout(() => { const m = $("#main"); m && m.classList.remove("enter"); }, 900); h.after && h.after(); } }
    catch (e) { if (t === tab) setMain(Alert(e.message)); }
  }

  const LAND = [
    [[20.5,98.6],[21.7,101.2],[22.5,103.9],[21.5,106.8],[19.5,105.8],[17.2,107.3],[15.2,109],[12.7,109.3],[10.4,107.9],[8.6,105.1],[10.4,104.7],[10.9,103.3],[12.3,102.4],[13.4,100.9],[12.6,100],[11,99.4],[9.2,99.3],[7.9,100.4],[6.5,101.8],[5.5,103.2],[3.6,103.5],[2.1,104.3],[1.3,104],[1.3,103.6],[2.9,101.4],[4.8,100.6],[6.3,100.1],[7.5,98.4],[9.5,98.6],[11.5,98.6],[13.5,98.2],[16,97.6],[18.5,97.7]],
    [[5.6,95.3],[4.2,97.9],[3.7,98.7],[2.3,100.8],[0.5,103.3],[-1.2,104.7],[-3,106],[-5.8,105.8],[-5.2,104.5],[-3.5,102.2],[-1.6,100.3],[0.3,98.7],[2.7,96.4],[4.5,95.6]],
    [[-6,105.9],[-6,108.5],[-6.7,110.8],[-6.9,112.7],[-7.7,114.5],[-8.7,114.4],[-8.3,111.5],[-7.8,108.5],[-7.3,106.5]],
    [[7,116.7],[5,119.2],[1.5,118.9],[-1,116.5],[-3.5,116.2],[-4,114],[-3.2,111.7],[-3,110.2],[-1,109.2],[1.5,109.6],[2,111.3],[3.2,113],[5,115.6],[6.5,116]],
    [[1.2,125],[0.5,121.5],[-1,121.4],[-0.9,123.2],[-2.5,122],[-4.5,122.8],[-5.5,122.5],[-5.4,120.3],[-3.5,119.5],[-1,119.8],[0.8,120]],
    [[18.5,120.6],[17.5,122.2],[16,122.4],[14.2,124],[13.3,123.6],[13.8,121.6],[14.4,120.6],[16,119.9],[17.5,120.3]],
    [[9.4,123.5],[9,126.3],[7,126.6],[6.2,125.6],[6.1,124.2],[7.5,122.2],[8.5,123.4]]];
  const NAMES = [["Thailand", 15.6, 100.8], ["Vietnam", 13.2, 109.6], ["Malaysia", 4.6, 114.2], ["Indonesia", -2.2, 102.2], ["Filipina", 12, 124.8]];
  const axis = { x: { grid: { display: false }, border: { display: false }, ticks: { color: "#8ca3a6" } },
    y: { grid: { color: "#243538" }, border: { display: false }, ticks: { color: "#8ca3a6", callback: fmt } } };
  const legend = { position: "bottom", labels: { usePointStyle: true, boxWidth: 8, color: "#c3d3d3" } };
  const tip = { callbacks: { label: c => c.dataset.label + ": " + fmt(c.parsed.y) + " kg" } };

  // ---- Halaman ----
  const PAGES = {
    async Dashboard() {
      const t = await api("/twin"), k = t.totals;
      const cards = [["box", "t1", "Produksi 30 hari", k.produksiKg / 1000, "", " ton"], ["warehouse", "t2", "Stok 7 hari terakhir", k.stokKg / 1000, "", " ton"],
        ["cart", "t3", "Permintaan pasar", k.permintaanKg / 1000, "", " ton"], ["truck", "t4", "Biaya logistik", k.biayaPerKg, "Rp ", "/kg"]];
      const worst = [...t.nodes].sort((a, b) => b.risiko - a.risiko)[0], late = t.routes.filter(r => r.keterlambatanHari > 0).length;
      return { html: `<section class="hero"><canvas id="fx"></canvas><div class="hero-in"><span class="live"><i></i>Digital twin aktif</span><h2>Indikator rantai pasok buah ASEAN</h2>
        <p>Setiap titik adalah koperasi, setiap garis adalah jalur distribusi. Warna menunjukkan tingkat risiko saat ini.</p>
        <div class="pills"><span class="pill">${t.nodes.length} koperasi</span><span class="pill">${t.routes.length} jalur</span><span class="pill">${late} terlambat</span>${worst ? `<span class="pill">Perlu perhatian: ${esc(worst.nama)}</span>` : ""}</div></div></section>
        <div class="grid">${cards.map(([i, c, a, v, pre, suf]) => `<div class="card kpi ${c}"><span class="kpi-icon">${ic(i, 22)}</span><div><span>${a}</span><b data-n="${v}" data-p="${pre}" data-s="${suf}">${pre}${fmt(v)}${suf}</b></div></div>`).join("")}</div>
        <div class="card" style="margin-bottom:18px">${Head("Produksi dan stok per koperasi", "Satuan kilogram, produksi 30 hari terakhir dan stok 7 hari terakhir")}
          ${t.nodes.length ? '<div style="position:relative;height:300px"><canvas id="ch"></canvas></div>' : Empty("inbox", "Belum ada data koperasi")}</div>
        <div class="card">${Head("Status koperasi", "Tingkat risiko dihitung dari keterlambatan distribusi dan kecukupan stok")}
          <div class="table-wrap"><table><thead><tr><th>Koperasi</th><th>Negara</th><th class="num">Produksi (kg)</th><th class="num">Stok (kg)</th><th>Risiko</th></tr></thead><tbody>
          ${t.nodes.map(n => { const [l, tone] = riskLabel(n.risiko); return `<tr><td><b>${esc(n.nama)}</b></td><td>${n.negara}</td><td class="num">${fmt(n.produksiKg)}</td><td class="num">${fmt(n.stokKg)}</td><td>${Badge(tone, l)}</td></tr>`; }).join("")}
          </tbody></table></div></div>`,
        after() { flows($("#fx"), t); countUp(); const el = $("#ch"); if (!el) return; chart = new Chart(el, { type: "bar", data: { labels: t.nodes.map(n => n.nama), datasets: [
          { label: "Produksi", data: t.nodes.map(n => n.produksiKg), backgroundColor: "#35d0b4", borderRadius: 6 },
          { label: "Stok", data: t.nodes.map(n => n.stokKg), backgroundColor: "#f2b04a", borderRadius: 6 }] },
          options: { responsive: true, maintainAspectRatio: false, plugins: { legend, tooltip: tip }, scales: axis } }); } };
    },
    async Produksi() {
      const [rows, kom, kop] = await Promise.all([api("/produksi"), api("/komoditas"), api("/koperasi")]), admin = user.role === "ADMIN";
      const opt = (a, ph) => `<option value="">${ph}</option>` + a.map(k => `<option value="${k.id}">${esc(k.nama)}</option>`).join("");
      return { html: `<div class="split"><form class="card" id="fprod">${Head("Catat hasil panen", "Data langsung masuk ke digital twin")}
        ${admin ? `<label>Koperasi<select name="koperasiId" required>${opt(kop, "Pilih koperasi")}</select></label>` : ""}
        <label>Komoditas<select name="komoditasId" required>${opt(kom, "Pilih komoditas")}</select></label>
        <label>Jumlah (kg)<input type="number" name="jumlahKg" min="1" required placeholder="Contoh: 1500"></label>
        <div id="perr"></div><button class="btn block">${ic("plus", 17)} Simpan data</button></form>
        <div class="card">${Head("Riwayat produksi", "100 catatan terbaru", Badge("plain", rows.length + " catatan"))}
        ${rows.length === 0 ? Empty("inbox", "Belum ada catatan produksi", "Isi formulir di samping untuk mulai mencatat.") : `<div class="table-wrap"><table><thead><tr>
          <th>Tanggal</th><th>Koperasi</th><th>Komoditas</th><th class="num">Jumlah (kg)</th>${admin ? '<th class="aksi-th">Aksi</th>' : ""}</tr></thead><tbody>
          ${rows.map(r => `<tr><td>${new Date(r.tanggal).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}</td><td>${esc(r.koperasi?.nama || "-")}</td>
            <td>${Badge("ok", r.komoditas?.nama || "-")}</td><td class="num"><b>${fmt(r.jumlahKg)}</b></td>
            ${admin ? `<td class="aksi-td"><button class="btn-delete sm" data-del="${r.id}" title="Hapus catatan">${ic("trash", 14)}</button></td>` : ""}</tr>`).join("")}
          </tbody></table></div>`}</div></div>` };
    },
    async Peta() {
      const t = await api("/twin");
      return { html: `<div class="card">${Head("Koperasi dan jalur distribusi", "Ukuran lingkaran menunjukkan volume produksi, warna menunjukkan tingkat risiko")}<div class="map" id="map"></div>
        <div class="legend"><span><i class="dot" style="background:#35d0b4"></i>Risiko rendah</span><span><i class="dot" style="background:#f2b04a"></i>Risiko sedang</span>
        <span><i class="dot" style="background:#ff7a66"></i>Risiko tinggi</span><span><i class="line"></i>Distribusi lancar</span><span><i class="line late"></i>Distribusi terlambat</span></div></div>`,
        after() { map = L.map("map", { scrollWheelZoom: false, attributionControl: false }).setView([4, 110], 5);
          // Daratan digambar sendiri (tanpa server tile), jadi tidak bisa terblokir
          LAND.forEach(p => L.polygon(p, { color: "#35605b", weight: 1, fillColor: "#1c3a37", fillOpacity: 1, interactive: false }).addTo(map));
          NAMES.forEach(([n, la, ln]) => L.marker([la, ln], { interactive: false, icon: L.divIcon({ className: "land-label", html: n, iconSize: [0, 0] }) }).addTo(map));
          t.routes.forEach(r => L.polyline([[r.dari.lat, r.dari.lng], [r.tujuanLat, r.tujuanLng]], { color: r.keterlambatanHari > 0 ? "#ff7a66" : "#35d0b4", weight: 2.5, className: r.keterlambatanHari > 0 ? "flow late" : "flow" }).bindTooltip(`${r.tujuan}: ${r.status}`).addTo(map));
          t.nodes.forEach(n => L.circleMarker([n.lat, n.lng], { radius: 8 + n.produksiKg / 20000, color: heat(n.risiko), fillOpacity: .6 }).bindTooltip(`${n.nama}, ${fmt(n.produksiKg)} kg`).addTo(map)); } };
    },
    async Prediksi(id) {
      const kom = await api("/komoditas"); id = id || kom[0].id; const d = await api("/prediksi?komoditasId=" + id);
      return { html: `<div class="card">${Head("Prediksi produksi", "Riwayat 12 minggu terakhir dan prakiraan minggu berikutnya",
        `<label style="margin:0;min-width:190px">Komoditas<select id="kom">${kom.map(k => `<option value="${k.id}" ${k.id == id ? "selected" : ""}>${k.nama}</option>`).join("")}</select></label>`)}
        <div style="display:flex;gap:8px;margin-bottom:12px;flex-wrap:wrap">${Badge(d.tren === "naik" ? "ok" : "warn", "Tren " + d.tren)}${Badge("plain", "Sumber: " + d.sumber)}</div>
        <div style="position:relative;height:340px"><canvas id="ch"></canvas></div><p class="mu" style="margin-top:10px">Hasil bergantung pada data dan model yang dipakai.</p></div>`,
        after() { const n = d.riwayat.length, pad = Array(n - 1).fill(null);
          chart = new Chart($("#ch"), { type: "line", data: { labels: [...d.riwayat, ...d.prakiraan].map(r => r.minggu), datasets: [
            { label: "Riwayat", data: [...d.riwayat.map(r => r.kg), ...d.prakiraan.map(() => null)], borderColor: "#35d0b4", backgroundColor: "#35d0b4", borderWidth: 2.5, tension: .25, pointRadius: 3 },
            { label: "Prakiraan", data: [...pad, d.riwayat[n - 1].kg, ...d.prakiraan.map(r => r.kg)], borderColor: "#f2b04a", backgroundColor: "#f2b04a", borderWidth: 2.5, borderDash: [6, 4], tension: .25, pointRadius: 3 }] },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend, tooltip: tip }, scales: axis } }); } };
    },
    async Simulasi() { sim.h = await api("/simulasi"); return { html: simHTML() }; }
  };

  // ---- Simulasi ----
  const ZERO = { produksi: 0, energi: 0, keterlambatan: 0, permintaan: 0 };
  const PRESETS = [["Produksi turun 20%", { produksi: -20 }], ["Energi naik 25%", { energi: 25 }], ["Terlambat 7 hari", { keterlambatan: 7 }], ["Permintaan naik 15%", { permintaan: 15 }], ["Kebijakan dagang", { energi: 10, keterlambatan: 10 }]];
  const SLIDERS = [["produksi", "Perubahan produksi", -50, 50, "%"], ["energi", "Biaya energi", -30, 80, "%"], ["keterlambatan", "Keterlambatan", 0, 21, " hari"], ["permintaan", "Permintaan", -30, 50, "%"]];
  const ROWS = [["Pasokan (kg)", "pasokanKg"], ["Permintaan (kg)", "permintaanKg"], ["Biaya (Rp/kg)", "biayaPerKg"], ["Kekurangan (kg)", "kekuranganKg"]];
  const sim = { p: { ...ZERO }, r: null, h: [] };
  const pct = (k, a, b) => ((sim.p[k] - a) / (b - a)) * 100 + "%", sval = (k, a, u) => (sim.p[k] > 0 && a < 0 ? "+" : "") + sim.p[k] + u;
  function simHTML(err = "") {
    const { p, r, h } = sim;
    return `<div class="split-even"><div class="card">${Head("Atur skenario", "Pilih preset atau geser parameter secara manual")}
      <div class="chips">${PRESETS.map(([n], i) => `<button type="button" class="chip" data-preset="${i}">${n}</button>`).join("")}<button type="button" class="chip" data-preset="-1">Reset</button></div>
      ${SLIDERS.map(([k, l, a, b, u]) => `<div><div class="slider-head"><label for="s-${k}" style="margin:0">${l}</label><span class="slider-val" id="v-${k}">${sval(k, a, u)}</span></div>
        <input id="s-${k}" data-k="${k}" type="range" min="${a}" max="${b}" value="${p[k]}" style="--pct:${pct(k, a, b)}"><div class="range-ends"><span>${a}${u}</span><span>${b}${u}</span></div></div>`).join("")}
      ${err ? Alert(err) : ""}<button class="btn block" id="run">${ic("play", 15)}Jalankan simulasi</button><p class="mu" style="margin-top:10px">Angka adalah contoh pengujian, bukan prediksi aktual.</p></div>
      <div class="stack"><div class="card">${Head("Hasil simulasi", "Perbandingan kondisi awal dengan skenario")}
      ${!r ? Empty("simulasi", "Belum ada hasil", "Atur parameter lalu jalankan simulasi.") : `<div class="result-hero"><div><span>Tingkat pemenuhan</span><b>${Math.round(r.skenario.pemenuhan * 100)}%</b></div>
        <div style="text-align:right"><span>Risiko skenario</span>${Badge(levelClass(r.skenario.tingkat), r.skenario.tingkat)}</div></div>
        <div class="table-wrap"><table><thead><tr><th>Indikator</th><th class="num">Awal</th><th class="num">Skenario</th></tr></thead><tbody>
        <tr><td>Pemenuhan</td><td class="num">${Math.round(r.awal.pemenuhan * 100)}%</td><td class="num"><b>${Math.round(r.skenario.pemenuhan * 100)}%</b></td></tr>
        ${ROWS.map(([l, k]) => `<tr><td>${l}</td><td class="num">${fmt(r.awal[k])}</td><td class="num"><b>${fmt(r.skenario[k])}</b></td></tr>`).join("")}
        <tr><td>Risiko</td><td class="num">${Badge(levelClass(r.awal.tingkat), r.awal.tingkat)}</td><td class="num">${Badge(levelClass(r.skenario.tingkat), r.skenario.tingkat)}</td></tr></tbody></table></div>`}</div>
      <div class="card">${Head("Riwayat simulasi", "20 skenario terakhir")}${h.length === 0 ? Empty("inbox", "Belum ada riwayat") :
        `<ul class="history">${h.map(x => `<li><span>${esc(x.nama)}</span>${Badge(levelClass(x.hasil.skenario.tingkat), x.hasil.skenario.tingkat)}</li>`).join("")}</ul>`}</div></div></div>`;
  }

  // ---- Event ----
  document.addEventListener("click", async e => {
    const b = e.target.closest("button"); if (!b) return;
    if (b.dataset.email) { const f = $("#login"); f.elements.email.value = b.dataset.email; f.elements.password.value = "password123"; }
    else if (b.dataset.tab) go(b.dataset.tab);
    else if (b.id === "logout") logout();
    else if (b.id === "kbd") palette();
    else if (b.dataset.del) {
      if (!confirm("Yakin ingin menghapus catatan produksi ini?")) return;
      try { await api("/produksi/" + b.dataset.del, null, "DELETE"); showPage(); } catch (x) { alert(x.message); }
    } else if (b.dataset.preset !== undefined) { const i = +b.dataset.preset; sim.p = { ...ZERO, ...(i >= 0 ? PRESETS[i][1] : {}) }; setMain(simHTML()); }
    else if (b.id === "run") {
      try { sim.r = await api("/simulasi", { nama: "Skenario " + new Date().toLocaleTimeString("id-ID"), ...sim.p }); sim.h = await api("/simulasi"); setMain(simHTML()); }
      catch (x) { setMain(simHTML(x.message)); }
    }
  });
  document.addEventListener("input", e => {
    const el = e.target; if (!el.dataset.k) return; const s = SLIDERS.find(x => x[0] === el.dataset.k);
    sim.p[s[0]] = +el.value; el.style.setProperty("--pct", pct(s[0], s[2], s[3])); $("#v-" + s[0]).textContent = sval(s[0], s[2], s[4]);
  });
  document.addEventListener("change", async e => {
    if (e.target.id !== "kom") return; cleanup(); const h = await PAGES.Prediksi(e.target.value); setMain(h.html); h.after();
  });
  document.addEventListener("submit", async e => {
    e.preventDefault(); const f = e.target;
    if (f.id === "login") {
      const btn = $("#lbtn"); btn.disabled = true; btn.textContent = "Memproses…";
      try { const r = await api("/auth/login", { email: f.elements.email.value, password: f.elements.password.value }); setToken(r.token); user = r.user; renderShell(); }
      catch (x) { renderLogin(x.message); }
    } else if (f.id === "fprod") {
      const body = { jumlahKg: +f.elements.jumlahKg.value, komoditasId: +f.elements.komoditasId.value }; if (f.elements.koperasiId) body.koperasiId = +f.elements.koperasiId.value;
      try { await api("/produksi", body); showPage(); } catch (x) { $("#perr").innerHTML = Alert(x.message); }
    }
  });

  user ? renderShell() : renderLogin();
})();
