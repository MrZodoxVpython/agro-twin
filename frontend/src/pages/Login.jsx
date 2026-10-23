import { useState } from "react";
import Icon from "../Icon.jsx";
import { api, setToken } from "../api.js";

const DEMO = [["Koperasi", "koperasi@agrotwin.id"], ["Petani", "petani@agrotwin.id"], ["Admin", "admin@agrotwin.id"]];
const POINTS = [["globe", "Pantau rantai pasok koperasi di seluruh ASEAN"], ["prediksi", "Prediksi produksi berbasis data historis"], ["simulasi", "Uji skenario harga energi, cuaca, dan kebijakan dagang"]];

export default function Login({ onLogin }) {
  const [f, setF] = useState({ email: "koperasi@agrotwin.id", password: "password123" }), [err, setErr] = useState(""), [busy, setBusy] = useState(false);
  const go = async e => {
    e.preventDefault(); setErr(""); setBusy(true);
    try { const r = await api("/auth/login", f); setToken(r.token); onLogin(r.user); }
    catch (x) { setErr(x.message); setBusy(false); }
  };
  return <div className="auth">
    <section className="auth-hero">
      <div className="brand"><span className="brand-logo"><Icon name="leaf" size={22} /></span><div><b>ASEAN AgroTwin</b><small>Digital Twin Pertanian</small></div></div>
      <div><h2>Keputusan pertanian yang lebih <em>terukur</em>.</h2>
        <p>Platform digital twin untuk petani, koperasi, dan administrator dalam memantau produksi, stok, dan distribusi.</p></div>
      <ul className="points">{POINTS.map(([i, t]) => <li key={t}><span><Icon name={i} size={17} /></span>{t}</li>)}</ul>
    </section>
    <section className="auth-form-wrap">
      <form className="auth-form" onSubmit={go}>
        <h2>Selamat datang</h2><p>Masuk untuk melanjutkan ke dasbor Anda.</p>
        <label>Email<input type="email" autoComplete="username" required value={f.email} onChange={e => setF({ ...f, email: e.target.value })} /></label>
        <label>Kata sandi<input type="password" autoComplete="current-password" required value={f.password} onChange={e => setF({ ...f, password: e.target.value })} /></label>
        {err && <div className="alert" role="alert">{err}</div>}
        <button className="btn block" disabled={busy}>{busy ? "Memproses…" : "Masuk"}</button>
        <div className="demo"><p>Akun contoh (kata sandi: password123)</p>
          <div>{DEMO.map(([n, e]) => <button type="button" key={e} className="btn ghost sm" onClick={() => setF({ email: e, password: "password123" })}>{n}</button>)}</div></div>
      </form>
    </section></div>;
}
