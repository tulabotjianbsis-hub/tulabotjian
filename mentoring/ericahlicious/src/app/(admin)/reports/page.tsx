"use client";

import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
} from "recharts";
import { MOCK_ANALYTICS, MOCK_DAILY_ORDER_STATS } from "@/lib/mock-data";

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState<"Day" | "Week" | "Month" | "Year">("Day");

  const revenue = MOCK_ANALYTICS.salesByDay.reduce((a, b) => a + b.total, 0);
  const expenses = MOCK_ANALYTICS.salesByDay.reduce((a, b) => a + b.expenses, 0);
  const netProfit = revenue - expenses;
  const orders = MOCK_DAILY_ORDER_STATS.total;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title" style={{ margin: 0 }}>Reports</h1>
        <div className="page-actions">
          <button className="btn btn-secondary">🖨️ Print</button>
          <button className="btn btn-secondary">📥 Download CSV</button>
        </div>
      </div>

      <div className="tab-list boxed mb-6">
        {["Day", "Week", "Month", "Year"].map((tab) => (
          <button
            key={tab}
            className={`tab-btn ${activeTab === tab ? "active" : ""}`}
            onClick={() => setActiveTab(tab as any)}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="grid-4 mb-6">
        <div className="stat-card">
          <div className="stat-label">Total Revenue</div>
          <div className="flex items-center justify-between">
            <div className="stat-value">₱{revenue.toLocaleString()}</div>
            <span style={{ color: "var(--status-good)", fontWeight: "bold" }}>↗</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Expenses</div>
          <div className="flex items-center justify-between">
            <div className="stat-value">₱{expenses.toLocaleString()}</div>
            <span style={{ color: "var(--status-critical)", fontWeight: "bold" }}>↘</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Net Profit</div>
          <div className="flex items-center justify-between">
            <div className="stat-value">₱{netProfit.toLocaleString()}</div>
            <span style={{ fontSize: 24, opacity: 0.8 }}>🪙</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Orders</div>
          <div className="flex items-center justify-between">
            <div className="stat-value">{orders}</div>
            <span style={{ fontSize: 24, opacity: 0.8 }}>🛒</span>
          </div>
        </div>
      </div>

      <div className="grid-2 mb-6">
        {/* Revenue vs Expenses Chart */}
        <div className="card">
          <h2 className="card-title">Revenue vs Expenses</h2>
          <div style={{ width: "100%", height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={MOCK_ANALYTICS.salesByDay} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={(val) => `${val / 1000}k`} />
                <Tooltip formatter={(val) => `₱${val}`} />
                <Legend />
                <Bar dataKey="total" name="Revenue" fill="#22c55e" radius={[4, 4, 0, 0]} maxBarSize={40} />
                <Bar dataKey="expenses" name="Expenses" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Profit Trend Chart */}
        <div className="card">
          <h2 className="card-title">Profit Trend</h2>
          <div style={{ width: "100%", height: 300 }}>
            <ResponsiveContainer>
              <LineChart data={MOCK_ANALYTICS.profitTrend} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={(val) => `${val / 1000}k`} />
                <Tooltip formatter={(val) => `₱${val}`} />
                <Line type="monotone" dataKey="profit" name="Profit" stroke="#f97316" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="card-title">Top Menu Items</h2>
        <div className="flex-col gap-0">
          {MOCK_ANALYTICS.topItems.map((item, i) => (
            <div key={item.name} className="flex justify-between items-center py-4" style={{ borderBottom: i < MOCK_ANALYTICS.topItems.length - 1 ? "1px solid var(--card-border)" : "none" }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 500 }}>{item.name}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div className="font-bold">₱{item.revenue.toLocaleString()}</div>
                <div className="text-sm text-muted">{item.quantity} Orders</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
