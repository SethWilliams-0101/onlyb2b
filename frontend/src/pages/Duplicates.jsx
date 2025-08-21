import { useEffect, useState } from "react";
import api from "../api/apiClient";

const KEYS = [
  { key: "EmailID", label: "EmailID" },
  { key: "DirectNumber", label: "Direct Number" },
  { key: "NameCompany", label: "First + Last + Company" },
];

export default function Duplicates() {
  const [unlocked, setUnlocked] = useState(!!sessionStorage.getItem("AUDIT_CODE"));
  const [code, setCode] = useState("");

  const [key, setKey] = useState("EmailID");
  const [groups, setGroups] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const [openGroup, setOpenGroup] = useState(null);
  const [items, setItems] = useState([]);
  const [itemsPage, setItemsPage] = useState(1);
  const [itemsTotal, setItemsTotal] = useState(0);

  const loadGroups = async (p = 1) => {
    const { data } = await api.get("/duplicates/groups", { params: { key, page: p, limit: 20 } });
    setGroups(data.items);
    setPage(data.page);
    setTotal(data.total);
  };

  const open = async (g) => {
    setOpenGroup(g);
    const { data } = await api.get("/duplicates/items", { params: { key: g.key, value: g.value, page: 1, limit: 100 } });
    setItems(data.items);
    setItemsTotal(data.total);
    setItemsPage(1);
  };

  const loadItemsPage = async (p) => {
    if (!openGroup) return;
    const { data } = await api.get("/duplicates/items", { params: { key: openGroup.key, value: openGroup.value, page: p, limit: 100 } });
    setItems(data.items);
    setItemsPage(p);
  };

  useEffect(() => { if (unlocked) loadGroups(1); }, [unlocked, key]);

  if (!unlocked) {
    return (
      <div style={{ maxWidth: 560, margin: "40px auto", padding: 16 }}>
        <h2>Duplicate Audit (DB-wide)</h2>
        <p style={{ color: "#666" }}>Enter audit code to view duplicates.</p>
        <div style={{ display: "flex", gap: 8 }}>
          <input value={code} onChange={(e)=>setCode(e.target.value)} placeholder="Audit Code" style={{ border: "1px solid #ddd", padding: 8, flex: 1 }} />
          <button onClick={()=>{ sessionStorage.setItem("AUDIT_CODE", code); setUnlocked(true); }} style={{ border: "1px solid #333", padding: "8px 12px" }}>
            Unlock
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: 16, display: "grid", gap: 16 }}>
      <h2>Duplicate Audit</h2>

      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <label>Key:&nbsp;</label>
        <select value={key} onChange={(e)=>{ setKey(e.target.value); setPage(1); }}>
          {KEYS.map(k => <option key={k.key} value={k.key}>{k.label}</option>)}
        </select>
        <button onClick={()=>loadGroups(1)} style={{ border: "1px solid #333", padding: "6px 10px" }}>Refresh</button>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f8f8f8" }}>
              <th style={{ textAlign: "left", padding: 8 }}>Key</th>
              <th style={{ textAlign: "left", padding: 8 }}>Value</th>
              <th style={{ textAlign: "left", padding: 8 }}>Count</th>
              <th style={{ textAlign: "left", padding: 8 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {groups.length === 0 && (
              <tr><td colSpan={4} style={{ padding: 12, color: "#777" }}>No duplicates found</td></tr>
            )}
            {groups.map((g) => (
              <tr key={`${g.key}:${g.value}`}>
                <td style={{ padding: 8 }}>{g.key}</td>
                <td style={{ padding: 8, fontFamily: "monospace" }}>{g.value}</td>
                <td style={{ padding: 8 }}>{g.count}</td>
                <td style={{ padding: 8 }}>
                  <button onClick={()=>open(g)} style={{ border: "1px solid #333", padding: "4px 8px" }}>
                    View members
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div>
        <button disabled={page<=1} onClick={()=>loadGroups(page-1)}>Prev</button>
        <span style={{ margin: "0 8px" }}>Page {page} of {Math.max(1, Math.ceil(total/20))}</span>
        <button disabled={page>=Math.ceil(total/20)} onClick={()=>loadGroups(page+1)}>Next</button>
      </div>

      {openGroup && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.4)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "#fff", padding: 16, width: "95%", maxWidth: 1100, maxHeight: "85vh", overflow: "auto", borderRadius: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3>Members of: {openGroup.key} = <span style={{ fontFamily: "monospace" }}>{openGroup.value}</span></h3>
              <button onClick={()=>setOpenGroup(null)} style={{ border: "1px solid #333", padding: "4px 8px" }}>Close</button>
            </div>

            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#f8f8f8" }}>
                    {["FirstName","LastName","EmailID","DirectNumber","CompanyName","Level","MainIndustry","_id"].map(h=>(
                      <th key={h} style={{ textAlign: "left", padding: 8 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {items.map((u) => (
                    <tr key={u._id}>
                      <td style={{ padding: 8 }}>{u.FirstName}</td>
                      <td style={{ padding: 8 }}>{u.LastName}</td>
                      <td style={{ padding: 8 }}>{u.EmailID}</td>
                      <td style={{ padding: 8 }}>{u.DirectNumber}</td>
                      <td style={{ padding: 8 }}>{u.CompanyName}</td>
                      <td style={{ padding: 8 }}>{u.Level}</td>
                      <td style={{ padding: 8 }}>{u.MainIndustry}</td>
                      <td style={{ padding: 8, fontFamily: "monospace" }}>{u._id}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ marginTop: 8 }}>
              <button disabled={itemsPage<=1} onClick={()=>loadItemsPage(itemsPage-1)}>Prev</button>
              <span style={{ margin: "0 8px" }}>Page {itemsPage} of {Math.max(1, Math.ceil(itemsTotal/100))}</span>
              <button disabled={itemsPage>=Math.ceil(itemsTotal/100)} onClick={()=>loadItemsPage(itemsPage+1)}>Next</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
