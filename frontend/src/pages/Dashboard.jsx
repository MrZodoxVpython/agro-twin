import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import Icon from "../Icon.jsx";
import { api } from "../api.js";
import { Badge, Empty, Head, Loading, fmt, riskLabel, tooltipStyle } from "../ui.jsx";

export default function Dashboard() {
  const [t, setT] = useState(null), [err, setErr] = useState("");
  useEffect(() => { api("/twin").then(setT).catch(e => setErr(e.message)); }, []);
  if (err) return <div className="alert" role="alert">{err}</div>;
  if (!t) return <Loading />;
  const k = t.totals;
  const cards = [["box", "t1", "Produksi 30 hari", fmt(k.produksiKg / 1000) + " ton"], ["warehouse", "t2", "Stok 7 hari terakhir", fmt(k.stokKg / 1000) + " ton"],
    ["cart", "t3", "Permintaan pasar", fmt(k.permintaanKg / 1000) + " ton"], ["truck", "t4", "Biaya logistik", "Rp " + fmt(k.biayaPerKg) + "/kg"]];
  return <>
    <div className="grid">{cards.map(([i, c, a, b]) => <div className="card kpi" key={a}>
      <span className={"kpi-icon " + c}><Icon name={i} size={22} /></span><div><span>{a}</span><b>{b}</b></div></div>)}</div>
    <div className="card" style={{ marginBottom: 18 }}>
      <Head title="Produksi dan stok per koperasi" hint="Satuan kilogram, produksi 30 hari terakhir dan stok 7 hari terakhir" />
      {t.nodes.length === 0 ? <Empty title="Belum ada data koperasi" /> :
        <ResponsiveContainer width="100%" height={300}><BarChart data={t.nodes} barGap={4}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e1e9ea" />
          <XAxis dataKey="nama" tick={{ fontSize: 12, fill: "#5d7377" }} tickLine={false} axisLine={false} />
          <YAxis tick={{ fontSize: 12, fill: "#5d7377" }} tickLine={false} axisLine={false} tickFormatter={fmt} />
          <Tooltip contentStyle={tooltipStyle} formatter={v => fmt(v) + " kg"} cursor={{ fill: "#f3f6f6" }} /><Legend iconType="circle" />
          <Bar dataKey="produksiKg" name="Produksi" fill="#0f766e" radius={[6, 6, 0, 0]} />
          <Bar dataKey="stokKg" name="Stok" fill="#d98e04" radius={[6, 6, 0, 0]} /></BarChart></ResponsiveContainer>}
    </div>
    <div className="card"><Head title="Status koperasi" hint="Tingkat risiko dihitung dari keterlambatan distribusi dan kecukupan stok" />
      <div className="table-wrap"><table><thead><tr><th>Koperasi</th><th>Negara</th><th className="num">Produksi (kg)</th><th className="num">Stok (kg)</th><th>Risiko</th></tr></thead>
        <tbody>{t.nodes.map(n => { const [l, tone] = riskLabel(n.risiko);
          return <tr key={n.id}><td><b>{n.nama}</b></td><td>{n.negara}</td><td className="num">{fmt(n.produksiKg)}</td><td className="num">{fmt(n.stokKg)}</td><td><Badge tone={tone}>{l}</Badge></td></tr>; })}</tbody></table></div>
    </div></>;
}
