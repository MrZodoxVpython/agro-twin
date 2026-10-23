import { useEffect, useState } from "react";
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { api } from "../api.js";
import { Badge, Empty, Head, fmt, tooltipStyle } from "../ui.jsx";

export default function Prediksi() {
  const [kom, setKom] = useState([]), [id, setId] = useState(""), [d, setD] = useState(null), [err, setErr] = useState("");
  useEffect(() => { api("/komoditas").then(k => { setKom(k); setId(k[0]?.id ?? ""); }).catch(e => setErr(e.message)); }, []);
  useEffect(() => { if (id) { setD(null); api("/prediksi?komoditasId=" + id).then(setD).catch(e => setErr(e.message)); } }, [id]);
  const data = d && [...d.riwayat.map(r => ({ ...r, aktual: r.kg })), ...d.prakiraan.map(r => ({ ...r, prakiraan: r.kg }))];
  return <div className="card">
    <Head title="Prediksi produksi" hint="Riwayat 12 minggu terakhir dan prakiraan minggu berikutnya">
      <label style={{ margin: 0, minWidth: 190 }}>Komoditas<select value={id} onChange={e => setId(e.target.value)}>{kom.map(k => <option key={k.id} value={k.id}>{k.nama}</option>)}</select></label>
    </Head>
    {err && <div className="alert" role="alert">{err}</div>}
    {!d ? (kom.length === 0 && !err ? <Empty icon="chart" title="Belum ada komoditas" /> : <div className="skeleton sk-chart" />) : <>
      <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
        <Badge tone={d.tren === "naik" ? "ok" : "warn"}>Tren {d.tren}</Badge><Badge>Sumber: {d.sumber}</Badge></div>
      <ResponsiveContainer width="100%" height={340}><LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e1e9ea" />
        <XAxis dataKey="minggu" tick={{ fontSize: 12, fill: "#5d7377" }} tickLine={false} axisLine={false} />
        <YAxis tick={{ fontSize: 12, fill: "#5d7377" }} tickLine={false} axisLine={false} tickFormatter={fmt} />
        <Tooltip contentStyle={tooltipStyle} formatter={v => fmt(v) + " kg"} /><Legend iconType="circle" />
        <Line dataKey="aktual" name="Riwayat" stroke="#0f766e" strokeWidth={2.5} dot={{ r: 3 }} connectNulls />
        <Line dataKey="prakiraan" name="Prakiraan" stroke="#d98e04" strokeWidth={2.5} strokeDasharray="6 4" dot={{ r: 3 }} connectNulls /></LineChart></ResponsiveContainer>
      <p className="mu" style={{ marginTop: 10 }}>Hasil bergantung pada data dan model yang dipakai.</p></>}
  </div>;
}
