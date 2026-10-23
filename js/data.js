// Data dan backend tiruan yang berjalan di browser (GitHub Pages hanya hosting statis).
// Akun demo, produksi, digital twin, prediksi, dan simulasi. Data disimpan di localStorage.
const KOP = [[1,"Koperasi Tani Makmur","Indonesia",-7.25,112.75],[2,"Koperasi Mekar Sari","Indonesia",-5.4,105.25],
  [3,"Chiang Mai Fruit Co-op","Thailand",18.79,98.98],[4,"Mekong Delta Growers","Vietnam",10.04,105.78],
  [5,"Perak Agro Koperasi","Malaysia",4.6,101.08],[6,"Davao Harvest Union","Filipina",7.19,125.46]]
  .map(([id,nama,negara,lat,lng]) => ({ id, nama, negara, lat, lng }));
const KOM = [{ id:1, nama:"Mangga" }, { id:2, nama:"Pisang" }, { id:3, nama:"Naga" }];
const TUJUAN = [["Singapura",1.29,103.85],["Kuala Lumpur",3.14,101.69],["Bangkok",13.75,100.5],["Manila",14.6,120.98]];
const DIST = KOP.map((k, i) => ({ id:i+1, koperasiId:k.id, tujuan:TUJUAN[i%4][0], tujuanLat:TUJUAN[i%4][1], tujuanLng:TUJUAN[i%4][2],
  biayaPerKg:3000+i*150, keterlambatanHari:i===0?3:0, status:i===0?"TERLAMBAT":"DIKIRIM" }));
const USERS = { "admin@agrotwin.id":{ id:1, nama:"Administrator", role:"ADMIN", koperasiId:null },
  "koperasi@agrotwin.id":{ id:2, nama:"Pengurus Koperasi", role:"KOPERASI", koperasiId:1 },
  "petani@agrotwin.id":{ id:3, nama:"Petani Contoh", role:"PETANI", koperasiId:1 } };
const KEY = "agrotwin-demo-v1";

function seed() {
  const produksi = []; let id = 1;
  for (let w = 11; w >= 0; w--) KOP.forEach((k, i) => KOM.forEach((c, j) => {
    const kg = (900 + i*120 + j*200) * (1 + .02*(11-w)) * (.9 + .2*Math.abs(Math.sin(w+i+j)));
    produksi.push({ id:id++, tanggal:new Date(Date.now() - w*7*864e5).toISOString(), jumlahKg:Math.round(kg), koperasiId:k.id, komoditasId:c.id });
  }));
  return { produksi, simulasi:[], nextId:id };
}
let mem = null;
const load = () => { if (mem) return mem; try { mem = JSON.parse(localStorage.getItem(KEY)); } catch {} return mem ||= seed(); };
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(mem)); } catch {} };
const fail = (m, c) => Object.assign(new Error(m), { status:c });
const scope = u => (u.role === "ADMIN" ? null : u.koperasiId);

function buildTwin(sc) {
  const S = load(), now = Date.now(), d30 = now - 30*864e5, d7 = now - 7*864e5, sum = a => a.reduce((x, r) => x + r.jumlahKg, 0);
  const nodes = KOP.filter(k => !sc || k.id === sc).map(k => {
    const rows = S.produksi.filter(r => r.koperasiId === k.id), produksiKg = sum(rows.filter(r => +new Date(r.tanggal) >= d30)),
      stokKg = sum(rows.filter(r => +new Date(r.tanggal) >= d7)) * .4, delay = DIST.filter(x => x.koperasiId === k.id).reduce((a, x) => a + x.keterlambatanHari, 0),
      hari = produksiKg ? stokKg / (produksiKg/30) : 0;
    return { ...k, produksiKg, stokKg, risiko:Math.min(1, delay/10 + (hari < 7 ? .3 : 0)) };
  });
  const ids = nodes.map(n => n.id), dist = DIST.filter(x => ids.includes(x.koperasiId)), produksiKg = nodes.reduce((a, n) => a + n.produksiKg, 0);
  return { totals:{ produksiKg, permintaanKg: sc ? produksiKg*.95 : Math.min(72000, produksiKg*1.2), stokKg:nodes.reduce((a, n) => a + n.stokKg, 0),
      biayaPerKg:dist.reduce((a, x) => a + x.biayaPerKg, 0) / (dist.length || 1) }, nodes,
    routes:dist.map(x => { const k = KOP.find(q => q.id === x.koperasiId);
      return { id:x.id, dari:{ lat:k.lat, lng:k.lng }, tujuan:x.tujuan, tujuanLat:x.tujuanLat, tujuanLng:x.tujuanLng, keterlambatanHari:x.keterlambatanHari, status:x.status }; }) };
}
function simulate(twin, { produksi=0, energi=0, keterlambatan=0, permintaan=0 }) {
  const t = twin.totals, run = (p, e, d, m) => {
    const sup = t.produksiKg*(1+p/100)*(1-Math.min(.9, .012*d)), dem = t.permintaanKg*(1+m/100), cost = t.biayaPerKg*(1+.35*e/100)*(1+.004*d),
      served = Math.min(sup, dem), fill = served/dem, risk = (1-fill)*60 + Math.max(0, cost/t.biayaPerKg-1)*40 + d*1.2;
    return { pasokanKg:sup, permintaanKg:dem, pemenuhan:fill, biayaPerKg:cost, kekuranganKg:dem-served, risiko:risk, tingkat:risk < 8 ? "Rendah" : risk < 20 ? "Sedang" : "Tinggi" };
  };
  return { awal:run(0,0,0,0), skenario:run(produksi, energi, keterlambatan, permintaan), catatan:"Parameter adalah contoh pengujian, bukan prediksi aktual." };
}
function forecast(series, steps = 4) {
  const n = series.length, mx = (n-1)/2, my = series.reduce((a, b) => a + b, 0)/n,
    b = series.reduce((a, y, i) => a + (i-mx)*(y-my), 0) / series.reduce((a, _, i) => a + (i-mx)**2, 0), a = my - b*mx;
  return { prakiraan:Array.from({ length:steps }, (_, k) => Math.max(0, Math.round(a + b*(n+k)))), tren:b > 0 ? "naik" : "turun" };
}

function mockApi(path, body, method, token) {
  return new Promise((ok, no) => setTimeout(() => { try { ok(route(path, body, method, token)); } catch (e) { no(e); } }, 120));
}
function route(full, body, method, token) {
  const [path, qs] = full.split("?"), q = new URLSearchParams(qs || ""), S = load();
  if (path === "/auth/login") {
    const u = USERS[(body.email || "").toLowerCase()];
    if (!u || body.password !== "password123") throw fail("Email atau kata sandi salah. Gunakan akun contoh dan kata sandi password123.", 401);
    return { token:btoa(JSON.stringify(u)), user:u };
  }
  let user; try { user = JSON.parse(atob(token)); } catch { throw fail("Belum masuk atau sesi berakhir.", 401); }
  const sc = scope(user), need = (...r) => { if (!r.includes(user.role)) throw fail("Peran Anda tidak memiliki akses.", 403); };
  if (path === "/komoditas") return KOM;
  if (path === "/koperasi") return KOP.filter(k => !sc || k.id === sc);
  if (path === "/twin") return buildTwin(sc);
  if (path === "/produksi" && method === "GET")
    return S.produksi.filter(r => !sc || r.koperasiId === sc).sort((a, b) => b.id - a.id).slice(0, 100)
      .map(r => ({ ...r, koperasi:KOP.find(k => k.id === r.koperasiId), komoditas:KOM.find(c => c.id === r.komoditasId) }));
  if (path === "/produksi" && method === "POST") {
    const koperasiId = sc ?? body.koperasiId;
    if (!(body.jumlahKg > 0) || !KOM.some(c => c.id === body.komoditasId) || !KOP.some(k => k.id === koperasiId)) throw fail("Input tidak valid.", 400);
    const r = { id:S.nextId++, tanggal:new Date().toISOString(), jumlahKg:body.jumlahKg, koperasiId, komoditasId:body.komoditasId };
    S.produksi.push(r); save(); return r;
  }
  if (path.startsWith("/produksi/") && method === "DELETE") {
    need("ADMIN"); const id = +path.split("/")[2]; S.produksi = S.produksi.filter(r => r.id !== id); save(); return { ok:true };
  }
  if (path === "/simulasi" && method === "POST") {
    need("KOPERASI", "ADMIN"); const hasil = simulate(buildTwin(sc), body);
    S.simulasi.unshift({ id:S.nextId++, nama:body.nama || "Skenario", parameter:body, hasil, createdAt:new Date().toISOString() });
    S.simulasi = S.simulasi.slice(0, 20); save(); return hasil;
  }
  if (path === "/simulasi") { need("KOPERASI", "ADMIN"); return S.simulasi; }
  if (path === "/prediksi") {
    need("KOPERASI", "ADMIN"); const kid = +q.get("komoditasId"), now = Date.now(), weeks = Array(12).fill(0);
    S.produksi.filter(r => r.komoditasId === kid && (!sc || r.koperasiId === sc)).forEach(r => {
      const i = 11 - Math.floor((now - new Date(r.tanggal)) / (7*864e5)); if (i >= 0 && i < 12) weeks[i] += r.jumlahKg; });
    const f = forecast(weeks);
    return { riwayat:weeks.map((kg, i) => ({ minggu:`M${i-11}`, kg:Math.round(kg) })), prakiraan:f.prakiraan.map((kg, i) => ({ minggu:`M+${i+1}`, kg })), sumber:"regresi linear (mode demo)", tren:f.tren };
  }
  throw fail("Endpoint tidak ditemukan.", 404);
}
