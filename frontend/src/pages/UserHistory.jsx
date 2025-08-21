import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/apiClient";

export default function UserHistory() {
  const { username } = useParams();
  const [unlocked, setUnlocked] = useState(!!sessionStorage.getItem("AUDIT_CODE"));
  const [code, setCode] = useState("");

  const [logs, setLogs] = useState([]);
  const [logsTotal, setLogsTotal] = useState(0);
  const [logsPage, setLogsPage] = useState(1);

  const [snaps, setSnaps] = useState([]);
  const [snapsTotal, setSnapsTotal] = useState(0);
  const [snapsPage, setSnapsPage] = useState(1);

  const [selectedSnap, setSelectedSnap] = useState(null);
  const [snapItems, setSnapItems] = useState([]);
  const [snapItemsPage, setSnapItemsPage] = useState(1);
  const [err, setErr] = useState("");

  const fetchLogs = async (p = 1) => {
    setErr("");
    try {
      const { data } = await api.get("/activities", { params: { username, page: p, limit: 25 } });
      setLogs(data.items); setLogsTotal(data.total); setLogsPage(p);
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to load activity");
    }
  };

  const fetchSnaps = async (p = 1) => {
    setErr("");
    try {
      const { data } = await api.get("/exports", { params: { username, page: p, limit: 10 } });
      setSnaps(data.items); setSnapsTotal(data.total); setSnapsPage(p);
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to load exports");
    }
  };

  const openSnap = async (snap) => {
    setSelectedSnap(snap);
    const { data } = await api.get(`/exports/${snap._id}/items`, { params: { page: 1, limit: 100 } });
    setSnapItems(data.items);
    setSnapItemsPage(1);
  };

  const loadSnapPage = async (p) => {
    if (!selectedSnap) return;
    const { data } = await api.get(`/exports/${selectedSnap._id}/items`, { params: { page: p, limit: 100 } });
    setSnapItems(data.items);
    setSnapItemsPage(p);
  };

  useEffect(() => {
    if (unlocked) { fetchLogs(1); fetchSnaps(1); }
  }, [unlocked, username]);

  if (!unlocked) {
    return (
      <div style={{ maxWidth: 560, margin: "40px auto", padding: 16 }}>
        <h2>Enter Audit Access Code</h2>
        <p style={{ color: "#666", marginBottom: 8 }}>
          You must be an <b>admin</b> or <b>auditor</b> and provide the special credential.
        </p>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            style={{ border: "1px solid #ddd", padding: 8, flex: 1 }}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Audit Code"
          />
          <button
            style={{ border: "1px solid #333", padding: "8px 12px" }}
            onClick={() => { sessionStorage.setItem("AUDIT_CODE", code); setUnlocked(true); }}
          >
            Unlock
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: 16 }}>
      <h2>User History: {username}</h2>
      {err && <div style={{ color: "crimson", margin: "8px 0" }}>{err}</div>}

      <section style={{ marginTop: 16 }}>
        <h3>Exports</h3>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead><tr>
            {["When","Format","Rows","Fields","Actions"].map(h=>(
              <th key={h} style={{ borderBottom: "1px solid #eee", textAlign: "left", padding: 8 }}>{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {snaps.map(s => (
              <tr key={s._id}>
                <td style={{ padding: 8 }}>{new Date(s.createdAt).toLocaleString()}</td>
                <td style={{ padding: 8 }}>{s.format.toUpperCase()}</td>
                <td style={{ padding: 8 }}>{s.total}</td>
                <td style={{ padding: 8, fontSize: 12 }}>{(s.fields || []).join(", ") || "—"}</td>
                <td style={{ padding: 8 }}>
                  <button onClick={() => openSnap(s)} style={{ border: "1px solid #333", padding: "4px 8px" }}>
                    View Exact Rows
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ marginTop: 8 }}>
          <button disabled={snapsPage<=1} onClick={()=>fetchSnaps(snapsPage-1)}>Prev</button>
          <span style={{ margin: "0 8px" }}>Page {snapsPage} of {Math.max(1, Math.ceil(snapsTotal/10))}</span>
          <button disabled={snapsPage>=Math.ceil(snapsTotal/10)} onClick={()=>fetchSnaps(snapsPage+1)}>Next</button>
        </div>
      </section>

      <section style={{ marginTop: 24 }}>
        <h3>Activity Timeline</h3>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead><tr>
            {["When","Action","Method","Route","Status","Meta"].map(h=>(
              <th key={h} style={{ borderBottom: "1px solid #eee", textAlign: "left", padding: 8 }}>{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {logs.map(x => (
              <tr key={x._id}>
                <td style={{ padding: 8 }}>{new Date(x.createdAt).toLocaleString()}</td>
                <td style={{ padding: 8 }}>{x.action}</td>
                <td style={{ padding: 8 }}>{x.method}</td>
                <td style={{ padding: 8 }}>{x.route}</td>
                <td style={{ padding: 8 }}>{x.status}</td>
                <td style={{ padding: 8, fontSize: 12 }}>{x.meta && JSON.stringify(x.meta)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ marginTop: 8 }}>
          <button disabled={logsPage<=1} onClick={()=>fetchLogs(logsPage-1)}>Prev</button>
          <span style={{ margin: "0 8px" }}>Page {logsPage} of {Math.max(1, Math.ceil(logsTotal/25))}</span>
          <button disabled={logsPage>=Math.ceil(logsTotal/25)} onClick={()=>fetchLogs(logsPage+1)}>Next</button>
        </div>
      </section>

      {selectedSnap && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,.4)",
          display: "flex", alignItems: "center", justifyContent: "center"
        }}>
          <div style={{ background: "#fff", padding: 16, width: "90%", maxWidth: 1000, maxHeight: "80vh", overflow: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3>Export items ({selectedSnap.total})</h3>
              <button onClick={()=>setSelectedSnap(null)} style={{ border: "1px solid #333", padding: "4px 8px" }}>Close</button>
            </div>

            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    {["FirstName","LastName","EmailID","CompanyName","Level","MainIndustry"].map(h=>(
                      <th key={h} style={{ borderBottom: "1px solid #eee", textAlign: "left", padding: 8 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {snapItems.map(u => (
                    <tr key={u._id}>
                      <td style={{ padding: 8 }}>{u.FirstName}</td>
                      <td style={{ padding: 8 }}>{u.LastName}</td>
                      <td style={{ padding: 8 }}>{u.EmailID}</td>
                      <td style={{ padding: 8 }}>{u.CompanyName}</td>
                      <td style={{ padding: 8 }}>{u.Level}</td>
                      <td style={{ padding: 8 }}>{u.MainIndustry}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ marginTop: 8 }}>
              <button disabled={snapItemsPage<=1} onClick={()=>loadSnapPage(snapItemsPage-1)}>Prev</button>
              <span style={{ margin: "0 8px" }}>Page {snapItemsPage} of {Math.max(1, Math.ceil((selectedSnap?.total||0)/100))}</span>
              <button disabled={snapItemsPage>=Math.ceil((selectedSnap?.total||0)/100)} onClick={()=>loadSnapPage(snapItemsPage+1)}>Next</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
