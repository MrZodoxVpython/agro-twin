import Icon from "./Icon.jsx";

export const fmt = n => Math.round(n || 0).toLocaleString("id-ID");
export const heat = r => (r > .6 ? "#d1432f" : r > .25 ? "#d98e04" : "#0f766e");
export const levelClass = t => (t === "Tinggi" ? "bad" : t === "Sedang" ? "warn" : "ok");
export const riskLabel = r => (r > .6 ? ["Tinggi", "bad"] : r > .25 ? ["Sedang", "warn"] : ["Rendah", "ok"]);

export const Badge = ({ tone = "plain", children }) => <span className={"badge " + tone}>{children}</span>;

export const Empty = ({ icon = "inbox", title, hint }) =>
  <div className="empty"><Icon name={icon} size={34} stroke={1.5} /><b>{title}</b>{hint && <span>{hint}</span>}</div>;

export const Loading = ({ kpi = 4 }) => <>
  <div className="grid">{Array.from({ length: kpi }, (_, i) => <div key={i} className="skeleton sk-kpi" />)}</div>
  <div className="skeleton sk-chart" /></>;

export const Head = ({ title, hint, children }) =>
  <div className="card-head"><div><h2>{title}</h2>{hint && <p>{hint}</p>}</div>{children}</div>;

export const tooltipStyle = { borderRadius: 10, border: "1px solid #e1e9ea", boxShadow: "0 8px 24px rgba(16,39,43,.12)", fontSize: 13 };
