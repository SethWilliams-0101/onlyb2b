import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/apiClient";

export default function UploadReport() {
  const { id } = useParams();
  const [report, setReport] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get(`/upload-reports/${id}`);
        setReport(data);
      } catch (e) {
        setErr(e?.response?.data?.message || "Failed to load report");
      }
    })();
  }, [id]);

  if (err) return <div style={{ padding: 16, color: "crimson" }}>{err}</div>;
  if (!report) return <div style={{ padding: 16 }}>Loading report…</div>;

  return (
    <div style={{ padding: 16, display: "grid", gap: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h2>Upload Report</h2>
        <Link to="/">Back to Dashboard</Link>
      </div>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <Card title="Filename" value={report.filename} />
        <Card title="Uploaded by" value={report.username || "unknown"} />
        <Card title="Processed" value={report.processed} />
        <Card title="Inserted" value={report.inserted} />
        <Card title="Updated" value={report.updated} />
        <Card title="Duplicates in File" value={report.duplicatesInFile?.length || 0} />
        <Card title="Already in DB" value={report.duplicatesExisting?.length || 0} />
      </div>

      <Section title="Duplicates inside uploaded file (same EmailID present multiple times)">
        <Table
          columns={[{ key: "EmailID", label: "EmailID" }, { key: "count", label: "Count in file" }]}
          rows={report.duplicatesInFile || []}
        />
      </Section>

      <Section title="Rows that already existed in database (by EmailID)">
        <Table
          columns={[{ key: "EmailID", label: "EmailID" }]}
          rows={(report.duplicatesExisting || []).map((e) => ({ EmailID: e }))}
        />
      </Section>
    </div>
  );
}

function Card({ title, value }) {
  return (
    <div style={{ border: "1px solid #eee", borderRadius: 12, padding: 14, minWidth: 180 }}>
      <div style={{ color: "#666", fontSize: 12 }}>{title}</div>
      <div style={{ fontWeight: 600, fontSize: 22 }}>{value}</div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ border: "1px solid #eee", borderRadius: 12, padding: 16 }}>
      <h3 style={{ marginTop: 0 }}>{title}</h3>
      {children}
    </div>
  );
}

function Table({ columns, rows }) {
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: "#f7f7f7" }}>
            {columns.map((c) => (
              <th key={c.key} style={{ borderBottom: "1px solid #eee", textAlign: "left", padding: 8 }}>
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && (
            <tr><td colSpan={columns.length} style={{ padding: 12, color: "#777" }}>No duplicates</td></tr>
          )}
          {rows.map((r, i) => (
            <tr key={i}>
              {columns.map((c) => (
                <td key={c.key} style={{ borderBottom: "1px solid #f1f1f1", padding: 8 }}>
                  {r[c.key] ?? "—"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
