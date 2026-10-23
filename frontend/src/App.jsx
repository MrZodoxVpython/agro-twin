import { useState } from "react";
import Icon from "./Icon.jsx";
import { setToken } from "./api.js";
import Login from "./pages/Login.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Produksi from "./pages/Produksi.jsx";
import Peta from "./pages/Peta.jsx";
import Prediksi from "./pages/Prediksi.jsx";
import Simulasi from "./pages/Simulasi.jsx";

const ALL = ["Dashboard", "Produksi", "Peta", "Prediksi", "Simulasi"];
const TABS = { PETANI: ["Dashboard", "Produksi"], KOPERASI: ALL, ADMIN: ALL };
const PAGES = { Dashboard, Produksi, Peta, Prediksi, Simulasi };
const ICONS = { Dashboard: "dashboard", Produksi: "produksi", Peta: "peta", Prediksi: "prediksi", Simulasi: "simulasi" };
const SUB = {
  Dashboard: "Ringkasan kondisi rantai pasok terkini",
  Produksi: "Catat dan tinjau hasil panen",
  Peta: "Sebaran koperasi dan jalur distribusi",
  Prediksi: "Prakiraan produksi berdasarkan data historis",
  Simulasi: "Uji dampak perubahan kondisi pasar"
};
const ROLE = { PETANI: "Petani", KOPERASI: "Koperasi", ADMIN: "Administrator" };

export default function App() {
  const [user, setUser] = useState(null), [tab, setTab] = useState("Dashboard");
  if (!user) return <Login onLogin={setUser} />;
  const Page = PAGES[tab];
  const initial = (user.nama || "?").trim().charAt(0).toUpperCase();
  return <div className="shell">
    <aside className="side">
      <div className="brand"><span className="brand-logo"><Icon name="leaf" size={22} /></span><div><b>ASEAN AgroTwin</b><small>Digital Twin Pertanian</small></div></div>
      <div className="side-label">Menu</div>
      <nav className="menu" aria-label="Menu utama">{TABS[user.role].map(t =>
        <button key={t} aria-current={t === tab} onClick={() => setTab(t)}><Icon name={ICONS[t]} size={19} />{t}</button>)}</nav>
      <div className="side-foot">Masuk sebagai {ROLE[user.role] || user.role}</div>
    </aside>
    <div className="content">
      <header className="top">
        <div><h1>{tab}</h1><p>{SUB[tab]}</p></div>
        <div className="user">
          <div className="user-info"><b>{user.nama}</b><span>{ROLE[user.role] || user.role}</span></div>
          <span className="avatar" aria-hidden="true">{initial}</span>
          <button className="btn ghost sm" onClick={() => { setToken(null); setUser(null); setTab("Dashboard"); }}><Icon name="logout" size={16} />Keluar</button>
        </div>
      </header>
      <main><Page user={user} /></main>
    </div>
  </div>;
}
