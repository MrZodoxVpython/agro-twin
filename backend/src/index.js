import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import bcrypt from "bcryptjs";
import rateLimit from "express-rate-limit";
import { z } from "zod";
import { PrismaClient } from "@prisma/client";
import { auth, scope, sign } from "./auth.js";
import { buildTwin, simulate } from "./twin.js";
import { forecast } from "./ai.js";

const prisma = new PrismaClient(), app = express(), wrap = fn => (q, s, n) => fn(q, s, n).catch(n);
app.set("trust proxy", 1);
app.use(helmet(), express.json({ limit:"100kb" }), morgan("combined"));

// Autentikasi
app.post("/api/auth/login", rateLimit({ windowMs:15*60*1000, max:30 }), wrap(async (req, res) => {
  const { email, password } = z.object({ email:z.string().email(), password:z.string().min(6) }).parse(req.body);
  const u = await prisma.user.findUnique({ where:{ email } });
  if (!u || !(await bcrypt.compare(password, u.passwordHash))) return res.status(401).json({ error:"Email atau kata sandi salah." });
  console.log(`[aktivitas] login ${u.email}`);
  res.json({ token:sign(u), user:{ id:u.id, nama:u.nama, role:u.role, koperasiId:u.koperasiId } });
}));

// Data master
app.get("/api/komoditas", auth(), wrap(async (_q, res) => res.json(await prisma.komoditas.findMany())));
app.get("/api/koperasi", auth(), wrap(async (req, res) => {
  const s = scope(req.user); res.json(await prisma.koperasi.findMany({ where: s ? { id:s } : {} }));
}));

// Produksi dan stok (petani dan koperasi hanya data koperasinya)
const rec = z.object({ jumlahKg:z.number().positive(), komoditasId:z.number().int(), koperasiId:z.number().int().optional(), tanggal:z.coerce.date().optional() });
for (const name of ["produksi", "stok"]) {
  app.get(`/api/${name}`, auth(), wrap(async (req, res) => {
    const s = scope(req.user);
    res.json(await prisma[name].findMany({ where: s ? { koperasiId:s } : {}, include:{ komoditas:true, koperasi:true }, orderBy:{ tanggal:"desc" }, take:100 }));
  }));
  app.post(`/api/${name}`, auth(), wrap(async (req, res) => {
    const b = rec.parse(req.body), koperasiId = scope(req.user) ?? b.koperasiId;
    if (!koperasiId) return res.status(400).json({ error:"koperasiId wajib diisi." });
    const row = await prisma[name].create({ data:{ jumlahKg:b.jumlahKg, komoditasId:b.komoditasId, koperasiId, ...(b.tanggal && { tanggal:b.tanggal }) } });
    console.log(`[aktivitas] ${name} dibuat oleh user ${req.user.id}`); res.status(201).json(row);
  }));
  app.delete(`/api/${name}/:id`, auth("ADMIN"), wrap(async (req, res) => {
    await prisma[name].delete({ where: { id: Number(req.params.id) } });
    console.log(`[aktivitas] ${name} id ${req.params.id} dihapus oleh admin ${req.user.id}`);
    res.json({ ok: true });
  }));
}

// Harga, permintaan, dan distribusi
app.get("/api/harga", auth(), wrap(async (_q, res) => res.json(await prisma.harga.findMany({ include:{ komoditas:true }, orderBy:{ tanggal:"desc" }, take:100 }))));
app.post("/api/harga", auth("KOPERASI", "ADMIN"), wrap(async (req, res) => {
  const b = z.object({ negara:z.string(), komoditasId:z.number().int(), hargaPerKg:z.number().positive(), permintaanKg:z.number().nonnegative() }).parse(req.body);
  res.status(201).json(await prisma.harga.create({ data:b }));
}));
app.get("/api/distribusi", auth("KOPERASI", "ADMIN"), wrap(async (req, res) => {
  const s = scope(req.user); res.json(await prisma.distribusi.findMany({ where: s ? { koperasiId:s } : {}, orderBy:{ tanggal:"desc" } }));
}));
app.post("/api/distribusi", auth("KOPERASI", "ADMIN"), wrap(async (req, res) => {
  const b = z.object({ tujuan:z.string(), tujuanLat:z.number(), tujuanLng:z.number(), jumlahKg:z.number().positive(), biayaPerKg:z.number().positive().optional(),
    keterlambatanHari:z.number().int().min(0).optional(), status:z.string().optional(), koperasiId:z.number().int().optional() }).parse(req.body);
  const koperasiId = scope(req.user) ?? b.koperasiId; if (!koperasiId) return res.status(400).json({ error:"koperasiId wajib diisi." });
  res.status(201).json(await prisma.distribusi.create({ data:{ ...b, koperasiId } }));
}));

// Digital Twin, Simulation Engine, dan Prediction
app.get("/api/twin", auth(), wrap(async (req, res) => res.json(await buildTwin(prisma, scope(req.user)))));
app.post("/api/simulasi", auth("KOPERASI", "ADMIN"), wrap(async (req, res) => {
  const p = z.object({ nama:z.string().default("Skenario"), produksi:z.number().min(-100).max(200), energi:z.number().min(-100).max(300),
    keterlambatan:z.number().min(0).max(60), permintaan:z.number().min(-100).max(300) }).parse(req.body);
  const hasil = simulate(await buildTwin(prisma, scope(req.user)), p);
  await prisma.simulasi.create({ data:{ nama:p.nama, parameter:p, hasil, userId:req.user.id } });
  res.json(hasil);
}));
app.get("/api/simulasi", auth("KOPERASI", "ADMIN"), wrap(async (req, res) =>
  res.json(await prisma.simulasi.findMany({ where:{ userId:req.user.id }, orderBy:{ createdAt:"desc" }, take:20 }))));
app.get("/api/prediksi", auth("KOPERASI", "ADMIN"), wrap(async (req, res) => {
  const komoditasId = Number(req.query.komoditasId), s = scope(req.user), now = Date.now();
  const rows = await prisma.produksi.findMany({ where:{ komoditasId, ...(s && { koperasiId:s }), tanggal:{ gte:new Date(now - 84*864e5) } } });
  const weeks = Array(12).fill(0); rows.forEach(r => { const i = 11 - Math.floor((now - r.tanggal) / (7*864e5)); if (i >= 0 && i < 12) weeks[i] += r.jumlahKg; });
  const f = await forecast(weeks);
  res.json({ riwayat:weeks.map((kg, i) => ({ minggu:`M${i-11}`, kg:Math.round(kg) })), prakiraan:f.prakiraan.map((kg, i) => ({ minggu:`M+${i+1}`, kg })), sumber:f.sumber, tren:f.tren });
}));

app.use((err, _q, res, _n) => {
  if (err.name === "ZodError") return res.status(400).json({ error:"Input tidak valid.", detail:err.issues });
  console.error(err); res.status(500).json({ error:"Terjadi kesalahan pada server." });
});
app.listen(4000, () => console.log("API AgroTwin berjalan di :4000"));
