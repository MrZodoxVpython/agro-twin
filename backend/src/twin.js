// Digital Twin: representasi kondisi rantai pasok dari data PostgreSQL
export async function buildTwin(prisma, scopeId) {
  const d30 = new Date(Date.now() - 30*864e5), d7 = new Date(Date.now() - 7*864e5), w = scopeId ? { koperasiId:scopeId } : {};
  const [kops, prod, stok, dist, harga] = await Promise.all([
    prisma.koperasi.findMany({ where: scopeId ? { id:scopeId } : {} }),
    prisma.produksi.groupBy({ by:["koperasiId"], where:{ ...w, tanggal:{ gte:d30 } }, _sum:{ jumlahKg:true } }),
    prisma.stok.groupBy({ by:["koperasiId"], where:{ ...w, tanggal:{ gte:d7 } }, _sum:{ jumlahKg:true } }),
    prisma.distribusi.findMany({ where:w, include:{ koperasi:true } }),
    prisma.harga.findMany({ where:{ tanggal:{ gte:d30 } } })]);
  const pm = Object.fromEntries(prod.map(r => [r.koperasiId, r._sum.jumlahKg || 0]));
  const sm = Object.fromEntries(stok.map(r => [r.koperasiId, r._sum.jumlahKg || 0]));
  const nodes = kops.map(k => {
    const d = dist.filter(x => x.koperasiId === k.id), delay = d.length ? d.reduce((a,x)=>a+x.keterlambatanHari,0)/d.length : 0;
    const produksiKg = pm[k.id] || 0, stokKg = sm[k.id] || 0, hari = produksiKg ? stokKg/(produksiKg/30) : 0;
    return { id:k.id, nama:k.nama, negara:k.negara, lat:k.lat, lng:k.lng, produksiKg, stokKg, risiko:Math.min(1, delay/10 + (hari < 7 ? .3 : 0)) };
  });
  const produksiKg = nodes.reduce((a,n)=>a+n.produksiKg,0);
  // Permintaan: data pasar bila ada, dibatasi agar sebanding dengan skala produksi koperasi yang dilihat
  const permintaanKg = harga.length && !scopeId ? Math.min(harga.reduce((a,h)=>a+h.permintaanKg,0), produksiKg*1.2) : produksiKg*.95;
  return { totals:{ produksiKg, permintaanKg, stokKg:nodes.reduce((a,n)=>a+n.stokKg,0),
      biayaPerKg: dist.length ? dist.reduce((a,x)=>a+x.biayaPerKg,0)/dist.length : 3200 }, nodes,
    routes: dist.map(x => ({ id:x.id, dari:{ lat:x.koperasi.lat, lng:x.koperasi.lng }, tujuan:x.tujuan, tujuanLat:x.tujuanLat,
      tujuanLng:x.tujuanLng, keterlambatanHari:x.keterlambatanHari, status:x.status })) };
}

// Simulation Engine: ubah parameter lalu bandingkan dengan kondisi awal
export function simulate(twin, { produksi=0, energi=0, keterlambatan=0, permintaan=0 }) {
  const t = twin.totals, run = (p,e,d,m) => {
    const sup = t.produksiKg*(1+p/100)*(1-Math.min(.9,.012*d)), dem = t.permintaanKg*(1+m/100),
      cost = t.biayaPerKg*(1+.35*e/100)*(1+.004*d), served = Math.min(sup,dem), fill = served/dem,
      risk = (1-fill)*60 + Math.max(0,cost/t.biayaPerKg-1)*40 + d*1.2;
    return { pasokanKg:sup, permintaanKg:dem, pemenuhan:fill, biayaPerKg:cost, kekuranganKg:dem-served, risiko:risk,
      tingkat: risk<8 ? "Rendah" : risk<20 ? "Sedang" : "Tinggi" };
  };
  return { awal:run(0,0,0,0), skenario:run(produksi,energi,keterlambatan,permintaan),
    catatan:"Parameter adalah contoh pengujian, bukan prediksi aktual." };
}
