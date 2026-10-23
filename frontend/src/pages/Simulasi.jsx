import { useEffect, useState } from "react";
import Icon from "../Icon.jsx";
import { api } from "../api.js";
import { Badge, Empty, Head, fmt, levelClass } from "../ui.jsx";

const ZERO = { produksi: 0, energi: 0, keterlambatan: 0, permintaan: 0 };
const PRESETS = [["Produksi turun 20%", { produksi: -20 }], ["Energi naik 25%", { energi: 25 }], ["Terlambat 7 hari", { keterlambatan: 7 }], ["Permintaan naik 15%", { permintaan: 15 }], ["Kebijakan dagang", { energi: 10, keterlambatan: 10 }]];
const SLIDERS = [["produksi", "Perubahan produksi", -50, 50, "%"], ["energi", "Biaya energi", -30, 80, "%"], ["keterlambatan", "Keterlambatan", 0, 21, " hari"], ["permintaan", "Permintaan", -30, 50, "%"]];
const ROWS = [["Pasokan (kg)", "pasokanKg"], ["Permintaan (kg)", "permintaanKg"], ["Biaya (Rp/kg)", "biayaPerKg"], ["Kekurangan (kg)", "kekuranganKg"]];

export default function Simulasi() {
  const [p, setP] = useState(ZERO), [r, setR] = useState(null), [h, setH] = useState([]), [err, setErr] = useState(""), [busy, setBusy] = useState(false);
  const hist = () => api("/simulasi").then(setH).catch(() => {});
  useEffect(() => { hist(); }, []);
  const run = async () => {
    setErr(""); setBusy(true);
    try { setR(await api("/simulasi", { nama: "Skenario " + new Date().toLocaleTimeString("id-ID"), ...p })); hist(); }
    catch (x) { setErr(x.message); }
    setBusy(false);
  };
  return <div className="split-even">
    <div className="card"><Head title="Atur skenario" hint="Pilih preset atau geser parameter secara manual" />
      <div className="chips">{PRESETS.map(([n, v]) => <button key={n} type="button" className="chip" onClick={() => setP({ ...ZERO, ...v })}>{n}</button>)}
        <button type="button" className="chip" onClick={() => setP(ZERO)}>Reset</button></div>
      {SLIDERS.map(([k, l, a, b, u]) => <div key={k}>
        <div className="slider-head"><label htmlFor={"s-" + k} style={{ margin: 0 }}>{l}</label><span className="slider-val">{p[k] > 0 && a < 0 ? "+" : ""}{p[k]}{u}</span></div>
        <input id={"s-" + k} type="range" min={a} max={b} value={p[k]} style={{ "--pct": ((p[k] - a) / (b - a)) * 100 + "%" }} onChange={e => setP({ ...p, [k]: +e.target.value })} />
        <div className="range-ends"><span>{a}{u}</span><span>{b}{u}</span></div></div>)}
      {err && <div className="alert" role="alert">{err}</div>}
      <button className="btn block" onClick={run} disabled={busy}><Icon name="play" size={15} />{busy ? "Menjalankan…" : "Jalankan simulasi"}</button>
      <p className="mu" style={{ marginTop: 10 }}>Angka adalah contoh pengujian, bukan prediksi aktual.</p></div>
    <div className="stack">
      <div className="card"><Head title="Hasil simulasi" hint="Perbandingan kondisi awal dengan skenario" />
        {!r ? <Empty icon="simulasi" title="Belum ada hasil" hint="Atur parameter lalu jalankan simulasi." /> : <>
          <div className="result-hero"><div><span>Tingkat pemenuhan</span><b>{Math.round(r.skenario.pemenuhan * 100)}%</b></div>
            <div style={{ textAlign: "right" }}><span>Risiko skenario</span><Badge tone={levelClass(r.skenario.tingkat)}>{r.skenario.tingkat}</Badge></div></div>
          <div className="table-wrap"><table><thead><tr><th>Indikator</th><th className="num">Awal</th><th className="num">Skenario</th></tr></thead><tbody>
            <tr><td>Pemenuhan</td><td className="num">{Math.round(r.awal.pemenuhan * 100)}%</td><td className="num"><b>{Math.round(r.skenario.pemenuhan * 100)}%</b></td></tr>
            {ROWS.map(([l, k]) => <tr key={k}><td>{l}</td><td className="num">{fmt(r.awal[k])}</td><td className="num"><b>{fmt(r.skenario[k])}</b></td></tr>)}
            <tr><td>Risiko</td><td className="num"><Badge tone={levelClass(r.awal.tingkat)}>{r.awal.tingkat}</Badge></td><td className="num"><Badge tone={levelClass(r.skenario.tingkat)}>{r.skenario.tingkat}</Badge></td></tr>
          </tbody></table></div></>}
      </div>
      <div className="card"><Head title="Riwayat simulasi" hint="20 skenario terakhir" />
        {h.length === 0 ? <Empty title="Belum ada riwayat" /> :
          <ul className="history">{h.map(x => <li key={x.id}><span>{x.nama}</span><Badge tone={levelClass(x.hasil.skenario.tingkat)}>{x.hasil.skenario.tingkat}</Badge></li>)}</ul>}
      </div></div></div>;
}
