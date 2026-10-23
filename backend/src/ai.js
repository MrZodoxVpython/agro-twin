// Layanan AI dan Prediction. Bila ANALYTICS_URL diisi (mis. model Python), backend memanggilnya lewat API.
// Jika tidak tersedia, dipakai regresi linear sederhana sebagai cadangan.
export async function forecast(series, steps = 4) {
  if (process.env.ANALYTICS_URL) {
    try {
      const r = await fetch(process.env.ANALYTICS_URL + "/predict", { method:"POST", headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({ series, steps }), signal: AbortSignal.timeout(4000) });
      if (r.ok) return { ...(await r.json()), sumber:"layanan analitik" };
    } catch { /* lanjut ke cadangan */ }
  }
  const n = series.length, mx = (n-1)/2, my = series.reduce((a,b)=>a+b,0)/n;
  const b = series.reduce((a,y,i)=>a+(i-mx)*(y-my),0) / series.reduce((a,_,i)=>a+(i-mx)**2,0), a = my - b*mx;
  return { prakiraan:Array.from({ length:steps }, (_,k) => Math.max(0, Math.round(a + b*(n+k)))), sumber:"regresi linear", tren:b > 0 ? "naik" : "turun" };
}
