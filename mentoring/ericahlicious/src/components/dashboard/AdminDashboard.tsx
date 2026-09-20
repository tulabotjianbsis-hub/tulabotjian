"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type DashboardProps = {
  statusCards: { name: string; status: string; type: "low" | "good" | "out" }[];
  topItems: { name: string; quantity: number; revenue: number }[];
  recommendations: any[];
  totalIngredients: number;
  lowStockCount: number;
  expiringSoonCount: number;
};

export function AdminDashboard(props: DashboardProps) {
  return (
    <div>
      <h1 className="page-title">Dashboard</h1>

      {/* Inventory Status Cards */}
      <div className="card mb-6">
        <h2 className="card-title">Inventory Status</h2>
        <div className="flex gap-4 overflow-x-auto pb-2">
          {props.statusCards.map((c, i) => (
            <div key={i} className={`inv-status-card ${c.type}`}>
              <div className="inv-status-name">{c.name}</div>
              <div className="inv-status-label">{c.status}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid-2 mb-6">
        {/* Top Selling Items (Bar Chart) */}
        <div className="card">
          <h2 className="card-title">Top Selling Items</h2>
          <div style={{ width: "100%", height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={props.topItems.slice(0, 4)} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} width={100} tickFormatter={(val) => val.split(" ")[0]} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="quantity" fill="#22c55e" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Decision Support Insights */}
        <div className="card">
          <h2 className="card-title">Decision Support Insights</h2>
          <div className="flex-col gap-3">
            {props.recommendations.map((rec, i) => (
              <div key={i} className="insight-card">
                <div className="insight-card-title">{rec.title}</div>
                <div className="insight-card-text">{rec.description}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid-3 mb-6">
        <div className="stat-card">
          <div className="stat-label">Total Ingredients</div>
          <div className="stat-value">{props.totalIngredients}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Low Stock</div>
          <div className="stat-value" style={{ color: "var(--status-critical)" }}>{props.lowStockCount}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Expiring Soon (7 Days)</div>
          <div className="stat-value" style={{ color: "var(--status-out)" }}>{props.expiringSoonCount}</div>
        </div>
      </div>
    </div>
  );
}
