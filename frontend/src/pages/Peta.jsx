import { useEffect, useState } from "react";
import { CircleMarker, MapContainer, Polyline, TileLayer, Tooltip as MapTip } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { api } from "../api.js";
import { Head, Loading, fmt, heat } from "../ui.jsx";

export default function Peta() {
  const [t, setT] = useState(null), [err, setErr] = useState("");
  useEffect(() => { api("/twin").then(setT).catch(e => setErr(e.message)); }, []);
  if (err) return <div className="alert" role="alert">{err}</div>;
  if (!t) return <Loading kpi={0} />;
  return <div className="card"><Head title="Koperasi dan jalur distribusi" hint="Ukuran lingkaran menunjukkan volume produksi, warna menunjukkan tingkat risiko" />
    <MapContainer className="map" center={[8, 108]} zoom={5} scrollWheelZoom={false}>
      <TileLayer attribution="&copy; OpenStreetMap" url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {t.routes.map(r => <Polyline key={r.id} positions={[[r.dari.lat, r.dari.lng], [r.tujuanLat, r.tujuanLng]]} color={r.keterlambatanHari > 0 ? "#d1432f" : "#0f766e"} dashArray={r.keterlambatanHari > 0 ? "6 6" : null}>
        <MapTip>{r.tujuan}: {r.status}</MapTip></Polyline>)}
      {t.nodes.map(n => <CircleMarker key={n.id} center={[n.lat, n.lng]} radius={8 + n.produksiKg / 20000} color={heat(n.risiko)} fillOpacity={.6}>
        <MapTip>{n.nama}, {fmt(n.produksiKg)} kg</MapTip></CircleMarker>)}
    </MapContainer>
    <div className="legend">
      <span><i className="dot" style={{ background: "#0f766e" }} />Risiko rendah</span>
      <span><i className="dot" style={{ background: "#d98e04" }} />Risiko sedang</span>
      <span><i className="dot" style={{ background: "#d1432f" }} />Risiko tinggi</span>
      <span><i className="line" />Distribusi lancar</span>
      <span><i className="line late" />Distribusi terlambat</span>
    </div></div>;
}
