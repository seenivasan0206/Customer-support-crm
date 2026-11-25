import React, { useState, useEffect } from "react";
import "./SupportRequests.css";

function SupportRequests() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showForm, setShowForm] = useState(false);

  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [errorMessage, setErrorMessage] = useState("");

  const token = localStorage.getItem("access_token");

  async function fetchTickets() {
    setLoading(true);
    try {
      let url = "http://localhost:8000/api/tickets/";
      const params = new URLSearchParams();

      if (search) params.append("search", search);
      if (statusFilter !== "All") params.append("status", statusFilter.toUpperCase());

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (response.ok) {
        setTickets(data.results || []);
      } else {
        console.error("Failed to fetch tickets:", data);
      }
    } catch (err) {
      console.error("Error connecting to tickets API:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchTickets();
  }, [search, statusFilter]);

  async function handleAdd(e) {
    e.preventDefault();
    setErrorMessage("");

    try {
      const response = await fetch("http://localhost:8000/api/tickets/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: subject,
          description: description || subject,
          priority: priority.toUpperCase(),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSubject("");
        setDescription("");
        setPriority("Medium");
        setShowForm(false);
        fetchTickets();
      } else {
        setErrorMessage(data.title?.[0] || data.detail || "Failed to create ticket.");
      }
    } catch (err) {
      setErrorMessage("Network error while creating ticket.");
    }
  }

  async function handleStatusChange(id, newStatus) {
    try {
      const response = await fetch(`http://localhost:8000/api/tickets/${id}/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: newStatus.toUpperCase(),
        }),
      });

      if (response.ok) {
        fetchTickets();
      } else {
        const errorData = await response.json();
        alert(errorData.detail || "Unable to update ticket status.");
      }
    } catch (err) {
      alert("Network error while updating status.");
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Are you sure you want to delete this ticket?")) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:8000/api/tickets/${id}/`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (response.ok || response.status === 204) {
        fetchTickets();
      } else {
        const errorData = await response.json();
        alert(errorData.detail || "You do not have permission to delete this ticket.");
      }
    } catch (err) {
      alert("Network error while deleting ticket.");
    }
  }

  return (
    <div className="sr-page">
      <div className="sr-header">
        <div>
          <h2>Support Requests</h2>
          <p>Manage all customer support tickets</p>
        </div>
        <button className="sr-add-btn" onClick={() => setShowForm(!showForm)}>
          {showForm ? "Close" : "+ New Request"}
        </button>
      </div>

      {/* Error Banner */}
      {errorMessage && (
        <div style={{ color: "#ef4444", marginBottom: "16px" }}>
          {errorMessage}
        </div>
      )}

      {/* New Ticket Form Modal */}
      {showForm && (
        <form className="sr-form" onSubmit={handleAdd}>
          <div>
            <label>Subject</label>
            <input
              type="text"
              placeholder="Brief summary of the issue"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
            />
          </div>

          <div>
            <label>Description</label>
            <input
              type="text"
              placeholder="Detailed description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div>
            <label>Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Urgent">Urgent</option>
            </select>
          </div>

          <button type="submit" className="sr-save-btn">
            Save
          </button>
        </form>
      )}

      {/* Search & Filter Toolbar */}
      <div className="sr-toolbar">
        <input
          type="text"
          placeholder="Search by ID, title, or customer"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="All">All Statuses</option>
          <option value="Open">Open</option>
          <option value="Pending">Pending</option>
          <option value="Resolved">Resolved</option>
          <option value="Closed">Closed</option>
        </select>
      </div>

      {/* Tickets Table */}
      <div className="sr-table-box">
        <table>
          <thead>
            <tr>
              <th>Ticket ID</th>
              <th>Customer</th>
              <th>Subject</th>
              <th>Status</th>
              <th>Priority</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" style={{ textAlign: "center", padding: "20px" }}>
                  Loading tickets from database...
                </td>
              </tr>
            ) : tickets.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: "center", padding: "20px" }}>
                  No support tickets found.
                </td>
              </tr>
            ) : (
              tickets.map((ticket) => (
                <tr key={ticket.id}>
                  <td>{ticket.ticket_id}</td>
                  <td>{ticket.customer?.username || "N/A"}</td>
                  <td>{ticket.title}</td>
                  <td>
                    <select
                      className={"sr-status " + (ticket.status?.toLowerCase() || "")}
                      value={
                        ticket.status
                          ? ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1).toLowerCase()
                          : "Open"
                      }
                      onChange={(e) => handleStatusChange(ticket.id, e.target.value)}
                    >
                      <option value="Open">Open</option>
                      <option value="Pending">Pending</option>
                      <option value="Resolved">Resolved</option>
                      <option value="Closed">Closed</option>
                    </select>
                  </td>
                  <td>{ticket.priority}</td>
                  <td>
                    <button
                      className="sr-delete"
                      onClick={() => handleDelete(ticket.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default SupportRequests;