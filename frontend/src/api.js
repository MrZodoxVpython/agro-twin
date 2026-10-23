import { mockApi } from "./mock.js";
// Mode demo (bawaan, untuk GitHub Pages): data tiruan di browser. Mode API asli: build dengan VITE_USE_API=true.
const LIVE = import.meta.env.VITE_USE_API === "true";
let token = null; try { token = localStorage.getItem("token"); } catch {}
export const DEMO = !LIVE;
export const setToken = t => { token = t; try { t ? localStorage.setItem("token", t) : localStorage.removeItem("token"); } catch {} };
export async function api(path, body, method) {
  const m = method || (body ? "POST" : "GET");
  if (!LIVE) return mockApi(path, body, m, token);
  const r = await fetch("/api" + path, { method: m,
    headers: { "Content-Type": "application/json", ...(token && { Authorization: "Bearer " + token }) },
    body: body && JSON.stringify(body) });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(data.error || "Permintaan gagal.");
  return data;
}
