import React from "react";
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

function Dashboard() {
  // dummy data, backend ready ana apram API la irundhu varum
  const stats = [
    { title: "Total Tickets", count: 120, color: "#4f46e5" },
    { title: "Open", count: 45, color: "#f59e0b" },
    { title: "Resolved", count: 60, color: "#16a34a" },
    { title: "Pending", count: 15, color: "#dc2626" },
  ];

  const weeklyData = [
    { day: "Mon", tickets: 12 },
    { day: "Tue", tickets: 18 },
    { day: "Wed", tickets: 9 },
    { day: "Thu", tickets: 22 },
    { day: "Fri", tickets: 15 },
    { day: "Sat", tickets: 7 },
    { day: "Sun", tickets: 11 },
  ];

  const recentTickets = [
    {
      id: "#1001",
      customer: "Naveen Kumar",
      subject: "Unable to login",
      status: "Open",
      priority: "High",
    },
    {
      id: "#1002",
      customer: "Sathish Kumar",
      subject: "Payment not received",
      status: "Pending",
      priority: "Medium",
    },
    {
      id: "#1003",
      customer: "Arun Raj",
      subject: "Change email address",
      status: "Resolved",
      priority: "Low",
    },
    {
      id: "#1004",
      customer: "Muvendhan",
      subject: "App is crashing",
      status: "Open",
      priority: "High",
    },
    {
      id: "#1005",
      customer: "Ashok Kumar",
      subject: "Refund request",
      status: "Resolved",
      priority: "Medium",
    },
  ];

  return (
    <div className="dashboard-page">
      <h2>Dashboard Overview</h2>
      <p className="dashboard-sub">
        Welcome back! Here is your support summary.
      </p>

      {/* Stats cards */}
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

      {/* Chart */}
      <div className="dash-box">
        <h3>Tickets This Week</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={weeklyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgb(41, 62, 104)" />
            <XAxis dataKey="day" stroke="#b8c5dc" />
            <YAxis stroke="#b8c5dc" />
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

      {/* Recent tickets table */}
      <div className="dash-box">
        <h3>Recent Tickets</h3>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Customer</th>
              <th>Subject</th>
              <th>Status</th>
              <th>Priority</th>
            </tr>
          </thead>
          <tbody>
            {recentTickets.map((ticket) => (
              <tr key={ticket.id}>
                <td>{ticket.id}</td>
                <td>{ticket.customer}</td>
                <td>{ticket.subject}</td>
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
      </div>
    </div>
  );
}

export default Dashboard;
