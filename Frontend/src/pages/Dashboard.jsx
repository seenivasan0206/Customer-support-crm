import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area,
  LabelList,
} from "recharts";
import "./Dashboard.css";

const ranges = [
  { label: "Today", days: 1 },
  { label: "Last 7 Days", days: 7 },
  { label: "Last 30 Days", days: 30 },
  { label: "All Time", days: 9999 },
];

const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const tooltipStyle = {
  backgroundColor: "rgb(19, 35, 73)",
  border: "1px solid rgb(41, 62, 104)",
  color: "white",
};

function renderPieLabel({ cx, cy, midAngle, innerRadius, outerRadius, value }) {
  const RAD = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) / 2;
  const x = cx + radius * Math.cos(-midAngle * RAD);
  const y = cy + radius * Math.sin(-midAngle * RAD);

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={14}
      fontWeight="bold"
    >
      {value}
    </text>
  );
}

function PieCard({ title, data, innerRadius }) {
  return (
    <div className="dash-box">
      <h3>{title}</h3>

      {data.length === 0 ? (
        <p className="dash-empty">No data</p>
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={innerRadius}
              outerRadius={95}
              paddingAngle={data.length > 1 ? 3 : 0}
              labelLine={false}
              label={renderPieLabel}
            >
              {data.map((item) => (
                <Cell key={item.name} fill={item.color} stroke="none" />
              ))}
            </Pie>
            <Tooltip
              contentStyle={tooltipStyle}
              itemStyle={{ color: "white" }}
            />
            <Legend
              formatter={(value) => (
                <span style={{ color: "#dce5f5" }}>{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

function Dashboard() {
  const [rangeDays, setRangeDays] = useState(1);
  const [status, setStatus] = useState("All");
  const [priority, setPriority] = useState("All");

  const [dbTickets, setDbTickets] = useState([]);
  const [dbSummary, setDbSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      const token = localStorage.getItem("access_token");

      try {
        const [overviewRes, ticketsRes] = await Promise.all([
          fetch("http://localhost:8000/api/dashboard/overview/", {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
          }),
          fetch("http://localhost:8000/api/tickets/", {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
          }),
        ]);

        let overviewData = null;
        if (overviewRes.ok) {
          overviewData = await overviewRes.json();
          setDbSummary(overviewData.summary);
        }

        let rawTicketsList = [];
        if (ticketsRes.ok) {
          const ticketsData = await ticketsRes.json();
          rawTicketsList = Array.isArray(ticketsData)
            ? ticketsData
            : ticketsData.results || [];
        } else if (overviewData && overviewData.recent_requests) {
          rawTicketsList = overviewData.recent_requests;
        }

        const normalized = rawTicketsList.map((t) => {
          const created = t.created_at ? new Date(t.created_at) : new Date();
          const daysAgo = Math.max(
            0,
            Math.floor(
              (Date.now() - created.getTime()) / (24 * 60 * 60 * 1000),
            ),
          );
          const statusFormatted = t.status
            ? t.status.charAt(0).toUpperCase() + t.status.slice(1).toLowerCase()
            : "Open";
          const priorityFormatted = t.priority
            ? t.priority.charAt(0).toUpperCase() +
              t.priority.slice(1).toLowerCase()
            : "Medium";
          const customerName =
            t.customer?.username ||
            (t.customer?.first_name
              ? `${t.customer.first_name} ${t.customer.last_name || ""}`.trim()
              : null) ||
            t.customer_name ||
            (typeof t.customer === "string" ? t.customer : "Support User");

          return {
            id: t.ticket_id || `#${t.id}`,
            customer: customerName,
            subject: t.title,
            status: statusFormatted,
            priority: priorityFormatted,
            daysAgo: daysAgo,
            created_at: created,
          };
        });

        setDbTickets(normalized);
      } catch (err) {
        console.error("Network error while connecting to dashboard API:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  const filteredTickets = dbTickets.filter((t) => {
    if (t.daysAgo > rangeDays) return false;
    if (status !== "All" && t.status.toLowerCase() !== status.toLowerCase())
      return false;
    if (
      priority !== "All" &&
      t.priority.toLowerCase() !== priority.toLowerCase()
    )
      return false;
    return true;
  });

  const resetFilters = () => {
    setRangeDays(1);
    setStatus("All");
    setPriority("All");
  };

  const isFiltered =
    status !== "All" || priority !== "All" || rangeDays !== 9999;

  const stats = [
    {
      title: "Total Tickets",
      count: isFiltered
        ? filteredTickets.length
        : (dbSummary?.total_tickets ?? dbTickets.length),
      color: "#4f46e5",
    },
    {
      title: "Open",
      count: isFiltered
        ? filteredTickets.filter((t) => t.status.toLowerCase() === "open")
            .length
        : (dbSummary?.open_tickets ??
          dbTickets.filter((t) => t.status.toLowerCase() === "open").length),
      color: "#f59e0b",
    },
    {
      title: "Resolved",
      count: isFiltered
        ? filteredTickets.filter((t) => t.status.toLowerCase() === "resolved")
            .length
        : (dbSummary?.resolved_tickets ??
          dbTickets.filter((t) => t.status.toLowerCase() === "resolved")
            .length),
      color: "#16a34a",
    },
    {
      title: "Pending",
      count: isFiltered
        ? filteredTickets.filter((t) => t.status.toLowerCase() === "pending")
            .length
        : (dbSummary?.pending_tickets ??
          dbTickets.filter((t) => t.status.toLowerCase() === "pending").length),
      color: "#dc2626",
    },
  ];

  const chartData = weekDays.map((day, idx) => {
    const dayOffset = (new Date().getDay() - 1 - idx + 7) % 7;
    const count = filteredTickets.filter((t) => t.daysAgo === dayOffset).length;
    return { day, tickets: count };
  });

  const statusData = [
    { name: "Open", color: "#f59e0b" },
    { name: "Pending", color: "#dc2626" },
    { name: "Resolved", color: "#16a34a" },
  ]
    .map((s) => ({
      ...s,
      value: filteredTickets.filter(
        (t) => t.status.toLowerCase() === s.name.toLowerCase(),
      ).length,
    }))
    .filter((s) => s.value > 0);

  const priorityData = [
    { name: "High", color: "#f43f5e" },
    { name: "Medium", color: "#3e52d4" },
    { name: "Low", color: "#14b8a6" },
  ]
    .map((p) => ({
      ...p,
      value: filteredTickets.filter(
        (t) => t.priority.toLowerCase() === p.name.toLowerCase(),
      ).length,
    }))
    .filter((p) => p.value > 0);

  const trendDays = Math.max(7, Math.min(rangeDays, 14));
  const trendData = [];
  for (let i = trendDays - 1; i >= 0; i--) {
    const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    trendData.push({
      label: date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
      }),
      tickets: filteredTickets.filter((t) => t.daysAgo === i).length,
    });
  }

  const customerCounts = {};
  filteredTickets.forEach((t) => {
    if (!t.customer || t.customer === "Support User") return;
    customerCounts[t.customer] = (customerCounts[t.customer] || 0) + 1;
  });

  const topCustomers = Object.keys(customerCounts)
    .map((name) => ({ name: name, tickets: customerCounts[name] }))
    .sort((a, b) => b.tickets - a.tickets)
    .slice(0, 5);

  return (
    <div className="dashboard-page">
      <h2>Dashboard Overview</h2>
      <p className="dashboard-sub">
        Welcome back! Here is your real-time support summary from the database.
      </p>

      <div className="dash-filters">
        <div className="dash-range">
          {ranges.map((r) => (
            <button
              key={r.label}
              type="button"
              className={rangeDays === r.days ? "active" : ""}
              onClick={() => setRangeDays(r.days)}
            >
              {r.label}
            </button>
          ))}
        </div>

        <div className="dash-selects">
          <label>
            Status
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option>All</option>
              <option>Open</option>
              <option>Pending</option>
              <option>Resolved</option>
            </select>
          </label>

          <label>
            Priority
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
            >
              <option>All</option>
              <option>High</option>
              <option>Medium</option>
              <option>Low</option>
            </select>
          </label>

          <button type="button" className="dash-reset" onClick={resetFilters}>
            Reset
          </button>
        </div>
      </div>

      <div className="stats-container">
        {stats.map((item) => (
          <div
            className="stat-card"
            key={item.title}
            style={{ borderLeftColor: item.color }}
          >
            <p>{item.title}</p>
            <h3>
              {loading && !dbSummary && dbTickets.length === 0
                ? "..."
                : item.count}
            </h3>
          </div>
        ))}
      </div>

      <div className="dash-box">
        <h3>Tickets Summary Chart</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgb(41, 62, 104)" />
            <XAxis dataKey="day" stroke="#b8c5dc" />
            <YAxis stroke="#b8c5dc" allowDecimals={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgb(19, 35, 73)",
                border: "1px solid rgb(41, 62, 104)",
                color: "white",
              }}
              labelStyle={{ color: "white" }}
              cursor={{ fill: "rgba(255, 255, 255, 0.05)" }}
            />
            <Bar dataKey="tickets" fill="rgb(62, 82, 212)" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="dash-charts-row">
        <PieCard title="Tickets by Status" data={statusData} innerRadius={60} />
        <PieCard
          title="Tickets by Priority"
          data={priorityData}
          innerRadius={0}
        />
      </div>

      <div className="dash-charts-row">
        <div className="dash-box">
          <h3>Tickets Trend</h3>

          {filteredTickets.length === 0 ? (
            <p className="dash-empty">No data</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="rgb(62, 82, 212)"
                      stopOpacity={0.6}
                    />
                    <stop
                      offset="95%"
                      stopColor="rgb(62, 82, 212)"
                      stopOpacity={0.05}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgb(41, 62, 104)"
                />
                <XAxis dataKey="label" stroke="#b8c5dc" />
                <YAxis stroke="#b8c5dc" allowDecimals={false} />
                <Tooltip
                  contentStyle={tooltipStyle}
                  labelStyle={{ color: "white" }}
                />
                <Area
                  type="monotone"
                  dataKey="tickets"
                  stroke="#8fa2ff"
                  strokeWidth={2}
                  fill="url(#trendFill)"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="dash-box">
          <h3>Top Customers</h3>

          {topCustomers.length === 0 ? (
            <p className="dash-empty">No data</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart
                data={topCustomers}
                layout="vertical"
                margin={{ left: 10, right: 30 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgb(41, 62, 104)"
                  horizontal={false}
                />
                <XAxis type="number" stroke="#b8c5dc" allowDecimals={false} />
                <YAxis
                  type="category"
                  dataKey="name"
                  stroke="#b8c5dc"
                  width={110}
                />
                <Tooltip
                  contentStyle={tooltipStyle}
                  labelStyle={{ color: "white" }}
                  cursor={{ fill: "rgba(255, 255, 255, 0.05)" }}
                />
                <Bar dataKey="tickets" fill="#14b8a6" radius={[0, 6, 6, 0]}>
                  <LabelList dataKey="tickets" position="right" fill="white" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="dash-box">
        <h3>Recent Support Tickets</h3>
        <table>
          <thead>
            <tr>
              <th>Ticket ID</th>
              <th>Customer</th>
              <th>Subject</th>
              <th>Date</th>
              <th>Status</th>
              <th>Priority</th>
            </tr>
          </thead>
          <tbody>
            {loading && dbTickets.length === 0 ? (
              <tr>
                <td
                  colSpan="6"
                  style={{
                    textAlign: "center",
                    padding: "24px",
                    color: "#8b93a7",
                  }}
                ></td>
              </tr>
            ) : filteredTickets.length === 0 ? (
              <tr>
                <td
                  colSpan="6"
                  style={{
                    textAlign: "center",
                    padding: "24px",
                    color: "#8b93a7",
                  }}
                ></td>
              </tr>
            ) : (
              filteredTickets.slice(0, 8).map((ticket) => (
                <tr key={ticket.id}>
                  <td>{ticket.id}</td>
                  <td>{ticket.customer}</td>
                  <td>{ticket.subject}</td>
                  <td>
                    {new Date(ticket.created_at).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                    })}
                  </td>
                  <td>
                    <span
                      className={"dash-badge " + ticket.status.toLowerCase()}
                    >
                      {ticket.status}
                    </span>
                  </td>
                  <td>{ticket.priority}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Dashboard;
