import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
const db = new PrismaClient();
const kops = [["Koperasi Tani Makmur","Indonesia",-7.25,112.75],["Koperasi Mekar Sari","Indonesia",-5.4,105.25],
  ["Chiang Mai Fruit Co-op","Thailand",18.79,98.98],["Mekong Delta Growers","Vietnam",10.04,105.78],
  ["Perak Agro Koperasi","Malaysia",4.6,101.08],["Davao Harvest Union","Filipina",7.19,125.46]];
const tujuan = [["Singapura",1.29,103.85],["Kuala Lumpur",3.14,101.69],["Bangkok",13.75,100.5],["Manila",14.6,120.98]];
await db.simulasi.deleteMany(); await db.distribusi.deleteMany(); await db.harga.deleteMany(); await db.stok.deleteMany();
await db.produksi.deleteMany(); await db.komoditas.deleteMany(); await db.koperasi.deleteMany();
const K = [], C = [];
for (const [nama,negara,lat,lng] of kops) K.push(await db.koperasi.create({ data:{nama,negara,lat,lng} }));
for (const n of ["Mangga","Pisang","Naga"]) C.push(await db.komoditas.create({ data:{nama:n} }));
const pw = await bcrypt.hash("password123", 10);
const users = [
  {email:"admin@agrotwin.id",nama:"Administrator",role:"ADMIN",koperasiId:null},
  {email:"koperasi@agrotwin.id",nama:"Pengurus Koperasi",role:"KOPERASI",koperasiId:K[0].id},
  {email:"petani@agrotwin.id",nama:"Petani Contoh",role:"PETANI",koperasiId:K[0].id}];
for (const u of users) {
  await db.user.upsert({
    where:{ email:u.email },
    update:{ nama:u.nama, role:u.role, koperasiId:u.koperasiId },
    create:{ email:u.email, passwordHash:pw, nama:u.nama, role:u.role, koperasiId:u.koperasiId } });
}
for (let w = 11; w >= 0; w--) for (const [i,k] of K.entries()) for (const [j,c] of C.entries()) {
  const kg = (900 + i*120 + j*200) * (1 + 0.02*(11-w)) * (0.9 + 0.2*Math.abs(Math.sin(w+i+j)));
  const tanggal = new Date(Date.now() - w*7*864e5);
  await db.produksi.create({ data:{ tanggal, jumlahKg:Math.round(kg), koperasiId:k.id, komoditasId:c.id } });
  if (w < 1) await db.stok.create({ data:{ jumlahKg:Math.round(kg*0.4), koperasiId:k.id, komoditasId:c.id } });
}
for (const c of C) for (const n of ["Indonesia","Thailand","Vietnam","Malaysia","Filipina"])
  await db.harga.create({ data:{ negara:n, komoditasId:c.id, hargaPerKg:12000+Math.random()*4000, permintaanKg:4200+Math.random()*800 } });
for (const [i,k] of K.entries()) { const t = tujuan[i%4];
  await db.distribusi.create({ data:{ koperasiId:k.id, tujuan:t[0], tujuanLat:t[1], tujuanLng:t[2], jumlahKg:3000+i*400,
    biayaPerKg:3000+i*150, keterlambatanHari:i===0?3:0, status:i===0?"TERLAMBAT":"DIKIRIM" } }); }
console.log("Seed selesai. Akun: admin@, koperasi@, petani@agrotwin.id (kata sandi: password123)");
await db.$disconnect();
