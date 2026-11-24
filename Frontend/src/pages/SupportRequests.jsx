import React, { useState } from "react";
import "./SupportRequests.css";

function SupportRequests() {
  // dummy data, backend ready ana apram API la irundhu varum
  const [tickets, setTickets] = useState([
    {
      id: 1001,
      customer: "Naveen Kumar",
      subject: "Unable to login",
      status: "Open",
      priority: "High",
    },
    {
      id: 1002,
      customer: "Sathish Kumar",
      subject: "Payment not received",
      status: "Pending",
      priority: "Medium",
    },
    {
      id: 1003,
      customer: "Arun Raj",
      subject: "Change email address",
      status: "Resolved",
      priority: "Low",
    },
    {
      id: 1004,
      customer: "Muvendhan",
      subject: "App is crashing",
      status: "Open",
      priority: "High",
    },
    {
      id: 1005,
      customer: "Ashok Kumar",
      subject: "Refund request",
      status: "Resolved",
      priority: "Medium",
    },
  ]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showForm, setShowForm] = useState(false);

  // form fields
  const [customer, setCustomer] = useState("");
  const [subject, setSubject] = useState("");
  const [priority, setPriority] = useState("Medium");

  // pudhu ticket add panna
  function handleAdd(e) {
    e.preventDefault();

    const ids = tickets.map((t) => t.id);
    const newId = Math.max(...ids, 1000) + 1;

    const newTicket = {
      id: newId,
      customer: customer,
      subject: subject,
      status: "Open",
      priority: priority,
    };

    setTickets([...tickets, newTicket]);

    // form clear pannunga
    setCustomer("");
    setSubject("");
    setPriority("Medium");
    setShowForm(false);
  }

  // ticket delete panna
  function handleDelete(id) {
    if (window.confirm("Are you sure you want to delete this ticket?")) {
      const updated = tickets.filter((t) => t.id !== id);
      setTickets(updated);
    }
  }

  // status maathura
  function handleStatusChange(id, newStatus) {
    const updated = tickets.map((t) => {
      if (t.id === id) {
        return { ...t, status: newStatus };
      }
      return t;
    });
    setTickets(updated);
  }

  // search and filter apply panna
  const filteredTickets = tickets.filter((t) => {
    const matchSearch =
      t.customer.toLowerCase().includes(search.toLowerCase()) ||
      t.subject.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "All" || t.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="sr-page">
      {/* Header */}
      <div className="sr-header">
        <div>
          <h2>Support Requests</h2>
          <p>Manage all customer support tickets</p>
        </div>
        <button className="sr-add-btn" onClick={() => setShowForm(!showForm)}>
          {showForm ? "Close" : "+ New Request"}
        </button>
      </div>

      {/* New request form */}
      {showForm && (
        <form className="sr-form" onSubmit={handleAdd}>
          <div>
            <label>Customer</label>
            <input
              type="text"
              placeholder="Customer name"
              value={customer}
              onChange={(e) => setCustomer(e.target.value)}
              required
            />
          </div>

          <div>
            <label>Subject</label>
            <input
              type="text"
              placeholder="Issue"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
            />
          </div>

          <div>
            <label>Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
            >
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
            </select>
          </div>

          <button type="submit" className="sr-save-btn">
            Save
          </button>
        </form>
      )}

      {/* Search and filter */}
      <div className="sr-toolbar">
        <input
          type="text"
          placeholder="Search by customer or subject"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option>All</option>
          <option>Open</option>
          <option>Pending</option>
          <option>Resolved</option>
        </select>
      </div>

      {/* Tickets table */}
      <div className="sr-table-box">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Customer</th>
              <th>Subject</th>
              <th>Status</th>
              <th>Priority</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredTickets.map((ticket) => (
              <tr key={ticket.id}>
                <td>#{ticket.id}</td>
                <td>{ticket.customer}</td>
                <td>{ticket.subject}</td>
                <td>
                  <select
                    className={"sr-status " + ticket.status.toLowerCase()}
                    value={ticket.status}
                    onChange={(e) =>
                      handleStatusChange(ticket.id, e.target.value)
                    }
                  >
                    <option>Open</option>
                    <option>Pending</option>
                    <option>Resolved</option>
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
            ))}
          </tbody>
        </table>

        {filteredTickets.length === 0 && (
          <p className="sr-empty">No tickets found</p>
        )}
      </div>
    </div>
  );
}

export default SupportRequests;
