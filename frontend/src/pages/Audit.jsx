import { useEffect, useState } from "react";
import api from "../api/apiClient";
 import { Link } from "react-router-dom";


export default function Audit() {
  const [unlocked, setUnlocked] = useState(!!sessionStorage.getItem("AUDIT_CODE"));
  const [code, setCode] = useState("");
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const [username, setUsername] = useState("");

  const fetchLogs = async (p = 1) => {
    const { data } = await api.get("/activities", { params: { page: p, q, username } });
    setItems(data.items);
    setTotal(data.total);
    setPage(data.page);
  };

  useEffect(() => {
    if (unlocked) fetchLogs(1);
  }, [unlocked]);

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
            onClick={() => {
              sessionStorage.setItem("AUDIT_CODE", code);
              setUnlocked(true);
            }}
          >
            Unlock
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: 16 }}>
      <h2>Activity Audit</h2>
      <div style={{ display: "flex", gap: 8, margin: "12px 0" }}>
        <input
          style={{ border: "1px solid #ddd", padding: 8 }}
          placeholder="Search (action/route/method)"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <input
          style={{ border: "1px solid #ddd", padding: 8 }}
          placeholder="Filter by username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <button style={{ border: "1px solid #333", padding: "8px 12px" }} onClick={() => fetchLogs(1)}>
          Search
        </button>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table style={{ minWidth: 900, borderCollapse: "collapse", width: "100%" }}>
          <thead>
            <tr style={{ background: "#f7f7f7" }}>
              {["Time", "User", "Action", "Method", "Route", "Status", "Meta"].map((h) => (
                <th key={h} style={{ border: "1px solid #eee", padding: 8, textAlign: "left" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((x) => (
              <tr key={x._id}>
                <td style={{ border: "1px solid #eee", padding: 8 }}>{new Date(x.createdAt).toLocaleString()}</td>
                <td className="p-2 border">
   <Link to={`/audit/user/${encodeURIComponent(x.username)}`} style={{ textDecoration: 'underline' }}>
     {x.username}
   </Link>
 </td>

                <td style={{ border: "1px solid #eee", padding: 8 }}>{x.action}</td>
                <td style={{ border: "1px solid #eee", padding: 8 }}>{x.method}</td>
                <td style={{ border: "1px solid #eee", padding: 8 }}>{x.route}</td>
                <td style={{ border: "1px solid #eee", padding: 8 }}>{x.status}</td>
                <td style={{ border: "1px solid #eee", padding: 8, fontSize: 12 }}>{x.meta && JSON.stringify(x.meta)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: 10, display: "flex", gap: 8, alignItems: "center" }}>
        <button
          style={{ border: "1px solid #333", padding: "6px 10px" }}
          disabled={page <= 1}
          onClick={() => fetchLogs(page - 1)}
        >
          Prev
        </button>
        <span>Page {page} of {Math.max(1, Math.ceil(total / 25))}</span>
        <button
          style={{ border: "1px solid #333", padding: "6px 10px" }}
          disabled={page >= Math.ceil(total / 25)}
          onClick={() => fetchLogs(page + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}
