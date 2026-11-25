import React, { useState, useEffect } from "react";
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
  // State for dashboard metrics and live tickets
  const [summary, setSummary] = useState({
    total_tickets: 0,
    open_tickets: 0,
    resolved_tickets: 0,
    pending_tickets: 0,
  });
  const [recentTickets, setRecentTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch real-time dashboard data from Django API on page load
  useEffect(() => {
    async function fetchDashboardData() {
      const token = localStorage.getItem("access_token");

      try {
        const response = await fetch("http://localhost:8000/api/dashboard/overview/", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (response.ok) {
          // Update state with real MySQL aggregated counts
          setSummary(data.summary);
          setRecentTickets(data.recent_requests || []);
        } else {
          console.error("Failed to load dashboard data:", data);
        }
      } catch (err) {
        console.error("Network error while connecting to dashboard API:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  // Format statistics cards using live MySQL data
  const stats = [
    { title: "Total Tickets", count: summary.total_tickets, color: "#4f46e5" },
    { title: "Open", count: summary.open_tickets, color: "#f59e0b" },
    { title: "Resolved", count: summary.resolved_tickets, color: "#16a34a" },
    { title: "Pending", count: summary.pending_tickets, color: "#dc2626" },
  ];

  const weeklyData = [
    { day: "Mon", tickets: summary.open_tickets },
    { day: "Tue", tickets: summary.pending_tickets },
    { day: "Wed", tickets: summary.resolved_tickets },
    { day: "Thu", tickets: summary.total_tickets },
    { day: "Fri", tickets: summary.open_tickets },
    { day: "Sat", tickets: 2 },
    { day: "Sun", tickets: summary.total_tickets },
  ];

  return (
    <div className="dashboard-page">
      <h2>Dashboard Overview</h2>
      <p className="dashboard-sub">
        Welcome back! Here is your support summary.
      </p>

      {/* Top Statistic Cards */}
      <div className="stats-container">
        {stats.map((item) => (
          <div
            className="stat-card"
            key={item.title}
            style={{ borderLeftColor: item.color }}
          >
            <p>{item.title}</p>
            <h3>{loading ? "..." : item.count}</h3>
          </div>
        ))}
      </div>

      {/* Weekly Chart */}
      <div className="dash-box">
        <h3>Tickets Summary Chart</h3>
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

      {/* Recent Support Requests Table */}
      <div className="dash-box">
        <h3>Recent Support Tickets</h3>
        <table>
          <thead>
            <tr>
              <th>Ticket ID</th>
              <th>Customer</th>
              <th>Subject</th>
              <th>Status</th>
              <th>Priority</th>
            </tr>
          </thead>
          <tbody>
            {recentTickets.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ textAlign: "center", padding: "16px" }}>
                  {loading ? "Loading tickets..." : "No support tickets found in database."}
                </td>
              </tr>
            ) : (
              recentTickets.map((ticket) => (
                <tr key={ticket.id}>
                  <td>{ticket.ticket_id}</td>
                  <td>{ticket.customer?.username || "N/A"}</td>
                  <td>{ticket.title}</td>
                  <td>
                    <span className={"dash-badge " + ticket.status?.toLowerCase()}>
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