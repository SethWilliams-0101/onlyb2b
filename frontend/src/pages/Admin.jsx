import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import api from "../api/apiClient";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  Legend,
} from "recharts";
import "../style/Admin.css";

/**
 * Admin Dashboard (enhanced)
 * - Adds responsive, accessible charts using Recharts
 * - Keeps your existing tables & filters
 * - Works even if some series are missing (defensive fallbacks)
 *
 * Install once:  npm i recharts
 */

function StatCard({ title, value }) {
  return (
    <div className="stat-card">
      <div className="stat-title">{title}</div>
      <div className="stat-value">{value}</div>
    </div>
  );
}

function Table({ columns, rows, keyField = "_id", renderers = {} }) {
  return (
    <div className="table-wrapper">
      <table className="custom-table">
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c.key}>{c.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r[keyField]}>
              {columns.map((c) => {
                const val = r[c.key];
                const Renderer = renderers[c.key];
                return (
                  <td key={c.key}>{Renderer ? <Renderer row={r} value={val} /> : val ?? "—"}</td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Generic card wrapper for charts so they look consistent
function ChartCard({ title, subtitle, children, right }) {
  return (
    <div className="card chart-card">
      <div className="chart-card-header">
        <div className="chart-card-titles">
          <h3>{title}</h3>
          {subtitle ? <div className="muted">{subtitle}</div> : null}
        </div>
        {right ? <div className="chart-card-right">{right}</div> : null}
      </div>
      <div className="chart-card-body">{children}</div>
    </div>
  );
}

export default function Admin() {
  const [unlocked, setUnlocked] = useState(!!sessionStorage.getItem("AUDIT_CODE"));
  const [code, setCode] = useState("");
  const [username, setUsername] = useState("");
  const [q, setQ] = useState("");
  const [pageA, setPageA] = useState(1);
  const [pageE, setPageE] = useState(1);

  const statsQuery = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => (await api.get("/admin/stats")).data,
    enabled: unlocked,
    staleTime: 10_000,
  });

  const activitiesQuery = useQuery({
    queryKey: ["activities", username, q, pageA],
    queryFn: async () => {
      const { data } = await api.get("/activities", {
        params: { username, q, page: pageA, limit: 20 },
      });
      return data;
    },
    enabled: unlocked,
  });

  const exportsQuery = useQuery({
    queryKey: ["exports", username, pageE],
    queryFn: async () => {
      const { data } = await api.get("/exports", {
        params: { username, page: pageE, limit: 10 },
      });
      return data;
    },
    enabled: unlocked,
  });

  const topActors = useMemo(() => statsQuery.data?.topActors || [], [statsQuery.data]);
  const actionBreakdown = useMemo(() => statsQuery.data?.actionBreakdown || [], [statsQuery.data]);

  // Optional time series returned by /admin/stats
  const activitySeries = useMemo(() => {
    // Expecting e.g. statsQuery.data?.series?.activityByDay = [{ date: '2025-08-01', count: 12 }]
    const s = statsQuery.data?.series?.activityByDay || [];
    return s.map((d) => ({ ...d, dateLabel: formatDay(d.date) }));
  }, [statsQuery.data]);

  const exportSeries = useMemo(() => {
    const s = statsQuery.data?.series?.exportsByDay || [];
    return s.map((d) => ({ ...d, dateLabel: formatDay(d.date) }));
  }, [statsQuery.data]);

  // Fallback pie (method breakdown) from currently loaded activity page
  const methodBreakdown = useMemo(() => {
    const items = activitiesQuery.data?.items || [];
    const m = new Map();
    for (const a of items) {
      const key = a.method || "OTHER";
      m.set(key, (m.get(key) || 0) + 1);
    }
    return Array.from(m.entries()).map(([name, value]) => ({ name, value }));
  }, [activitiesQuery.data]);

  useEffect(() => {}, [unlocked]);

  if (!unlocked) {
    return (
      <div className="unlock-container">
        <h2>Admin Dashboard</h2>
        <p>Enter your audit access code to view admin data.</p>
        <div className="unlock-input-group">
          <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Audit Code" />
          <button
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
    <div className="admin-container">
      {/* Stats */}
      <div className="stat-grid">
        <StatCard title="Total Users" value={statsQuery.data?.totals?.users ?? "—"} />
        <StatCard title="Total Activities" value={statsQuery.data?.totals?.activities ?? "—"} />
        <StatCard title="Total Exports" value={statsQuery.data?.totals?.exports ?? "—"} />
      </div>

      {/* Charts Grid */}
      <div className="charts-grid">
        <ChartCard title="Top Actors" subtitle="Last 7 days">
          <div className="chart-wrap">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={topActors.slice(0, 10)} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="_id"
                  tick={{ fontSize: 12 }}
                  interval={0}
                  angle={-20}
                  textAnchor="end"
                  height={60}
                />
                <YAxis allowDecimals={false} width={40} />
                <Tooltip formatter={(v) => [v, "Events"]} />
                <Bar dataKey="count" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Action Breakdown" subtitle="Last 7 days">
          <div className="chart-wrap">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={actionBreakdown} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="_id" tick={{ fontSize: 12 }} interval={0} angle={-15} textAnchor="end" height={50} />
                <YAxis allowDecimals={false} width={40} />
                <Tooltip formatter={(v) => [v, "Events"]} />
                <Bar dataKey="count" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* <ChartCard title="Activity Trend" subtitle="Daily - last 30 days">
          <div className="chart-wrap">
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={activitySeries} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
                <defs>
                  <linearGradient id="areaA" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopOpacity={0.35} />
                    <stop offset="95%" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="dateLabel" tick={{ fontSize: 11 }} minTickGap={16} />
                <YAxis allowDecimals={false} width={40} />
                <Tooltip formatter={(v) => [v, "Activities"]} labelFormatter={(l) => `Date: ${l}`} />
                <Area type="monotone" dataKey="count" strokeWidth={2} fillOpacity={1} fill="url(#areaA)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartCard> */}

        {/* <ChartCard title="Exports Trend" subtitle="Daily - last 30 days">
          <div className="chart-wrap">
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={exportSeries} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
                <defs>
                  <linearGradient id="areaB" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopOpacity={0.35} />
                    <stop offset="95%" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="dateLabel" tick={{ fontSize: 11 }} minTickGap={16} />
                <YAxis allowDecimals={false} width={40} />
                <Tooltip formatter={(v) => [v, "Exports"]} labelFormatter={(l) => `Date: ${l}`} />
                <Area type="monotone" dataKey="count" strokeWidth={2} fillOpacity={1} fill="url(#areaB)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartCard> */}

        {/* <ChartCard title="Method Split" subtitle="From current page of activity">
          <div className="chart-wrap">
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Tooltip formatter={(v, n) => [v, n]} />
                <Legend verticalAlign="bottom" height={36} />
                <Pie data={methodBreakdown} dataKey="value" nameKey="name" innerRadius={48} outerRadius={100} paddingAngle={2}>
                  {methodBreakdown.map((_, i) => (
                    <Cell key={`c-${i}`} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </ChartCard> */}
      </div>

      {/* Filters */}
      <div className="filter-bar">
        <input
          placeholder="Filter by username (exact)"
          value={username}
          onChange={(e) => {
            setUsername(e.target.value);
            setPageA(1);
            setPageE(1);
          }}
        />
        <input
          placeholder="Search activity (action/route/method)"
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setPageA(1);
          }}
        />
        <button
          onClick={() => {
            activitiesQuery.refetch();
            exportsQuery.refetch();
          }}
        >
          Apply
        </button>
        <Link to="/audit" className="link-btn">
          Open Full Audit
        </Link>
      </div>

      {/* Activities */}
      <div className="card">
        <h3>Recent Activity</h3>
        <Table
          columns={[
            { key: "createdAt", label: "Time" },
            { key: "username", label: "User" },
            { key: "action", label: "Action" },
            { key: "method", label: "Method" },
            { key: "route", label: "Route" },
            { key: "status", label: "Status" },
          ]}
          rows={(activitiesQuery.data?.items || []).map((a) => ({
            ...a,
            createdAt: new Date(a.createdAt).toLocaleString(),
          }))}
          renderers={{
            username: ({ value }) => <Link to={`/audit/user/${encodeURIComponent(value)}`}>{value}</Link>,
          }}
        />
        <div className="pagination">
          <button disabled={(activitiesQuery.data?.page || 1) <= 1} onClick={() => setPageA((p) => p - 1)}>
            Prev
          </button>
          <span>
            Page {activitiesQuery.data?.page || 1} of {Math.max(1, Math.ceil((activitiesQuery.data?.total || 0) / 20))}
          </span>
          <button
            disabled={(activitiesQuery.data?.page || 1) >= Math.ceil((activitiesQuery.data?.total || 0) / 20)}
            onClick={() => setPageA((p) => p + 1)}
          >
            Next
          </button>
        </div>
      </div>

      {/* Exports */}
      <div className="card">
        <h3>Recent Exports</h3>
        <Table
          columns={[
            { key: "createdAt", label: "Time" },
            { key: "username", label: "User" },
            { key: "format", label: "Format" },
            { key: "total", label: "Rows" },
            { key: "fields", label: "Fields" },
            { key: "_id", label: "Actions" },
          ]}
          rows={(exportsQuery.data?.items || []).map((s) => ({
            ...s,
            createdAt: new Date(s.createdAt).toLocaleString(),
            fields: (s.fields || []).join(", ") || "—",
          }))}
          renderers={{
            username: ({ value }) => <Link to={`/audit/user/${encodeURIComponent(value)}`}>{value}</Link>,
            _id: ({ row }) => <Link to={`/audit/user/${encodeURIComponent(row.username)}`}>View Exact Rows</Link>,
          }}
        />
        <div className="pagination">
          <button disabled={(exportsQuery.data?.page || 1) <= 1} onClick={() => setPageE((p) => p - 1)}>
            Prev
          </button>
          <span>
            Page {exportsQuery.data?.page || 1} of {Math.max(1, Math.ceil((exportsQuery.data?.total || 0) / 10))}
          </span>
          <button
            disabled={(exportsQuery.data?.page || 1) >= Math.ceil((exportsQuery.data?.total || 0) / 10)}
            onClick={() => setPageE((p) => p + 1)}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------- utils ----------
function formatDay(input) {
  // input can be Date | string
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) return String(input);
  return d.toLocaleDateString(undefined, { month: "short", day: "2-digit" });
}