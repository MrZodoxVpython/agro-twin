import { useEffect, useState } from "react";
import Icon from "../Icon.jsx";
import { api } from "../api.js";
import { Badge, Empty, Head, fmt } from "../ui.jsx";

export default function Produksi({ user }) {
  const [rows, setRows] = useState(null);
  const [kom, setKom] = useState([]);
  const [kop, setKop] = useState([]);
  const [f, setF] = useState({ jumlahKg: "", komoditasId: "", koperasiId: "" });
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [delBusy, setDelBusy] = useState(null);

  const load = () => api("/produksi").then(setRows).catch(e => setErr(e.message));

  const hapus = async (id) => {
    if (!window.confirm("Yakin ingin menghapus catatan produksi ini?")) return;
    setErr("");
    try {
      setDelBusy(id);
      await api("/produksi/" + id, null, "DELETE");
      await load();
    } catch (x) { setErr(x.message); }
    setDelBusy(null);
  };

  useEffect(() => {
    load();
    api("/komoditas").then(setKom);
    api("/koperasi").then(setKop);
  }, []);

  const save = async e => {
    e.preventDefault();
    setErr("");
    setBusy(true);
    try {
      const body = { jumlahKg: +f.jumlahKg, komoditasId: +f.komoditasId };
      if (user && user.role === "ADMIN") body.koperasiId = +f.koperasiId;
      await api("/produksi", body);
      setF({ jumlahKg: "", komoditasId: "", koperasiId: "" });
      await load();
    } catch (x) { setErr(x.message); }
    setBusy(false);
  };

  const isAdmin = user && user.role === "ADMIN";

  return (
    <div className="split">
      <form className="card" onSubmit={save}>
        <Head title="Catat hasil panen" hint="Data langsung masuk ke digital twin" />
        {isAdmin && (
          <label>
            Koperasi
            <select required value={f.koperasiId} onChange={e => setF({ ...f, koperasiId: e.target.value })}>
              <option value="">Pilih koperasi</option>
              {kop.map(k => <option key={k.id} value={k.id}>{k.nama}</option>)}
            </select>
          </label>
        )}
        <label>
          Komoditas
          <select required value={f.komoditasId} onChange={e => setF({ ...f, komoditasId: e.target.value })}>
            <option value="">Pilih komoditas</option>
            {kom.map(k => <option key={k.id} value={k.id}>{k.nama}</option>)}
          </select>
        </label>
        <label>
          Jumlah (kg)
          <input type="number" min="1" required placeholder="Contoh: 1500" value={f.jumlahKg} onChange={e => setF({ ...f, jumlahKg: e.target.value })} />
        </label>
        {err && <div className="alert" role="alert">{err}</div>}
        <button className="btn block" disabled={busy}>
          <Icon name="plus" size={17} /> {busy ? "Menyimpan…" : "Simpan data"}
        </button>
      </form>

      <div className="card">
        <Head title="Riwayat produksi" hint="100 catatan terbaru">
          {rows && <Badge>{rows.length} catatan</Badge>}
        </Head>
        {!rows ? (
          <div className="skeleton" style={{ height: 240 }} />
        ) : rows.length === 0 ? (
          <Empty title="Belum ada catatan produksi" hint="Isi formulir di samping untuk mulai mencatat." />
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Tanggal</th>
                  <th>Koperasi</th>
                  <th>Komoditas</th>
                  <th className="num">Jumlah (kg)</th>
                  {isAdmin && <th className="aksi-th">Aksi</th>}
                </tr>
              </thead>
              <tbody>
                {rows.map(r => (
                  <tr key={r.id}>
                    <td>{new Date(r.tanggal).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}</td>
                    <td>{r.koperasi?.nama || "-"}</td>
                    <td><Badge tone="ok">{r.komoditas?.nama || "-"}</Badge></td>
                    <td className="num"><b>{fmt(r.jumlahKg)}</b></td>
                    {isAdmin && (
                      <td className="aksi-td">
                        <button className="btn-delete sm" disabled={delBusy === id} onClick={() => hapus(r.id)} title="Hapus catatan">
                          <Icon name="trash" size={14} />
                          {delBusy === id ? "Hapus…" : ""}
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
