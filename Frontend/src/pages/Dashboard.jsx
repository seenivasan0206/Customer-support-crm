import React, { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import "./Dashboard.css";

const allTickets = [
  {
    id: "#1001",
    customer: "Ravi Kumar",
    subject: "Unable to login",
    status: "Open",
    priority: "High",
    daysAgo: 0,
  },
  {
    id: "#1002",
    customer: "Priya Sharma",
    subject: "Payment not received",
    status: "Pending",
    priority: "Medium",
    daysAgo: 0,
  },
  {
    id: "#1003",
    customer: "Arun Raj",
    subject: "Change email address",
    status: "Resolved",
    priority: "Low",
    daysAgo: 1,
  },
  {
    id: "#1004",
    customer: "Divya Nair",
    subject: "App is crashing",
    status: "Open",
    priority: "High",
    daysAgo: 1,
  },
  {
    id: "#1005",
    customer: "Karthik S",
    subject: "Refund request",
    status: "Resolved",
    priority: "Medium",
    daysAgo: 2,
  },
  {
    id: "#1006",
    customer: "Meena R",
    subject: "Invoice not generated",
    status: "Pending",
    priority: "High",
    daysAgo: 3,
  },
  {
    id: "#1007",
    customer: "Suresh B",
    subject: "Password reset not working",
    status: "Open",
    priority: "Medium",
    daysAgo: 3,
  },
  {
    id: "#1008",
    customer: "Anitha K",
    subject: "Delivery delay",
    status: "Resolved",
    priority: "Low",
    daysAgo: 4,
  },
  {
    id: "#1009",
    customer: "Vignesh M",
    subject: "Wrong product received",
    status: "Open",
    priority: "High",
    daysAgo: 5,
  },
  {
    id: "#1010",
    customer: "Lakshmi P",
    subject: "Account locked",
    status: "Resolved",
    priority: "High",
    daysAgo: 6,
  },
  {
    id: "#1011",
    customer: "Manoj T",
    subject: "Update billing address",
    status: "Pending",
    priority: "Low",
    daysAgo: 9,
  },
  {
    id: "#1012",
    customer: "Deepa S",
    subject: "Unable to download report",
    status: "Resolved",
    priority: "Medium",
    daysAgo: 12,
  },
  {
    id: "#1013",
    customer: "Naveen Kumar",
    subject: "Slow performance",
    status: "Open",
    priority: "Medium",
    daysAgo: 15,
  },
  {
    id: "#1014",
    customer: "Sathish Kumar",
    subject: "Feature request",
    status: "Pending",
    priority: "Low",
    daysAgo: 20,
  },
  {
    id: "#1015",
    customer: "Harini V",
    subject: "Duplicate charge",
    status: "Resolved",
    priority: "High",
    daysAgo: 25,
  },
  {
    id: "#1016",
    customer: "Gokul N",
    subject: "Email not received",
    status: "Open",
    priority: "Low",
    daysAgo: 28,
  },
];

const ranges = [
  { label: "Today", days: 1 },
  { label: "Last 7 Days", days: 7 },
  { label: "Last 30 Days", days: 30 },
  { label: "All Time", days: 9999 },
];

const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function getDate(daysAgo) {
  return new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
}

function Dashboard() {
  const [rangeDays, setRangeDays] = useState(30);
  const [status, setStatus] = useState("All");
  const [priority, setPriority] = useState("All");

  // filter apply panna
  const filteredTickets = allTickets.filter((t) => {
    const matchRange = t.daysAgo < rangeDays;
    const matchStatus = status === "All" || t.status === status;
    const matchPriority = priority === "All" || t.priority === priority;
    return matchRange && matchStatus && matchPriority;
  });

  const stats = [
    { title: "Total Tickets", count: filteredTickets.length, color: "#4f46e5" },
    {
      title: "Open",
      count: filteredTickets.filter((t) => t.status === "Open").length,
      color: "#f59e0b",
    },
    {
      title: "Resolved",
      count: filteredTickets.filter((t) => t.status === "Resolved").length,
      color: "#16a34a",
    },
    {
      title: "Pending",
      count: filteredTickets.filter((t) => t.status === "Pending").length,
      color: "#dc2626",
    },
  ];

  const chartData = weekDays.map((day) => ({ day: day, tickets: 0 }));
  filteredTickets.forEach((t) => {
    const jsDay = getDate(t.daysAgo).getDay(); // 0 = Sunday
    const index = jsDay === 0 ? 6 : jsDay - 1;
    chartData[index].tickets += 1;
  });

  const shownTickets = filteredTickets.slice(0, 6);

  function resetFilters() {
    setRangeDays(30);
    setStatus("All");
    setPriority("All");
  }

  return (
    <div className="dashboard-page">
      <h2>Dashboard Overview</h2>
      <p className="dashboard-sub">
        Welcome back! Here is your support summary.
      </p>

      <div className="dash-filters">
        <div className="dash-range">
          {ranges.map((r) => (
            <button
              key={r.label}
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

          <button className="dash-reset" onClick={resetFilters}>
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
            <h3>{item.count}</h3>
          </div>
        ))}
      </div>

      <div className="dash-box">
        <h3>Tickets by Day</h3>
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

      <div className="dash-box">
        <h3>Recent Tickets</h3>
        <p className="dash-count">
          Showing {shownTickets.length} of {filteredTickets.length} tickets
        </p>

        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Customer</th>
              <th>Subject</th>
              <th>Date</th>
              <th>Status</th>
              <th>Priority</th>
            </tr>
          </thead>
          <tbody>
            {shownTickets.map((ticket) => (
              <tr key={ticket.id}>
                <td>{ticket.id}</td>
                <td>{ticket.customer}</td>
                <td>{ticket.subject}</td>
                <td>
                  {getDate(ticket.daysAgo).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                  })}
                </td>
                <td>
                  <span className={"dash-badge " + ticket.status.toLowerCase()}>
                    {ticket.status}
                  </span>
                </td>
                <td>{ticket.priority}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {shownTickets.length === 0 && (
          <p className="dash-empty">No tickets found</p>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
