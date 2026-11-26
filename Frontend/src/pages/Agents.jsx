import React, { useState, useEffect } from 'react';
import './Agents.css';

function Agents() {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statistics, setStatistics] = useState({ total_agents: 0, available: 0, unavailable: 0 });

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showForm, setShowForm] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Customer Support');
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState('Available');
  const [errorMsg, setErrorMsg] = useState('');

  const token = localStorage.getItem('access_token');

  async function fetchStats() {
    try {
      const res = await fetch('http://localhost:8000/api/agents/statistics/', {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });
      if (res.ok) {
        const data = await res.json();
        setStatistics({
          total_agents: data.total_agents || 0,
          available: data.availability?.available || 0,
          unavailable: (data.availability?.busy || 0) + (data.availability?.inactive || 0),
        });
      }
    } catch (err) {
      console.error('Error fetching agent stats:', err);
    }
  }

  async function fetchAgents() {
    setLoading(true);
    try {
      let url = 'http://localhost:8000/api/agents/';
      if (search.trim()) {
        url = `http://localhost:8000/api/agents/search/?search=${encodeURIComponent(search.trim())}`;
      }

      const res = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });

      if (res.ok) {
        const data = await res.json();
        const list = data.results || (Array.isArray(data) ? data : []);
        setAgents(list);
      } else {
        console.error('Failed to load agents:', res.status);
      }
    } catch (err) {
      console.error('Network error loading agents:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchAgents();
    fetchStats();
  }, [search]);

  async function addAgent() {
    if (name.trim() === '' || email.trim() === '') {
      setErrorMsg('Please enter agent name and email.');
      return;
    }
    setErrorMsg('');

    try {
      const agentStatus = status === 'Available' ? 'AVAILABLE' : 'INACTIVE';
      const res = await fetch('http://localhost:8000/api/agents/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          full_name: name.trim(),
          email: email.trim(),
          department: role.trim() || 'Customer Support',
          phone_number: phone.trim(),
          status: agentStatus,
        })
      });

      const data = await res.json();
      if (res.ok) {
        setName('');
        setEmail('');
        setPhone('');
        setRole('Customer Support');
        setStatus('Available');
        setShowForm(false);
        fetchAgents();
        fetchStats();
      } else {
        const errorText = Object.entries(data)
          .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(' ') : v}`)
          .join(' | ');
        setErrorMsg(errorText || 'Failed to save agent.');
      }
    } catch (err) {
      setErrorMsg('Network error while creating agent.');
    }
  }

  async function deleteAgent(agentId) {
    if (!window.confirm('Are you sure you want to delete this agent?')) return;
    try {
      const res = await fetch(`http://localhost:8000/api/agents/${agentId}/`, {
        method: 'DELETE',
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });
      if (res.ok) {
        fetchAgents();
        fetchStats();
      } else {
        alert('Failed to delete agent.');
      }
    } catch (err) {
      console.error('Error deleting agent:', err);
    }
  }

  const filteredAgents = agents.filter((agent) => {
    if (statusFilter === 'All') return true;
    const isAvail = (agent.status || '').toUpperCase() === 'AVAILABLE';
    return statusFilter === 'Available' ? isAvail : !isAvail;
  });

  return (
    <div className="agents-page">
      <div className="agents-heading">
        <p>AGENT MANAGEMENT</p>
        <h1>Agents</h1>
        <p>Manage your support team and monitor agent availability directly in the database.</p>
      </div>

      <div className="agent-cards">
        <div className="agent-card">
          <h3>Total Agents</h3>
          <h1>{statistics.total_agents || agents.length}</h1>
          <p>All database team members</p>
        </div>

        <div className="agent-card">
          <h3>Available Agents</h3>
          <h1>{statistics.available}</h1>
          <p>Ready to handle conversations</p>
        </div>

        <div className="agent-card">
          <h3>Unavailable Agents</h3>
          <h1>{statistics.unavailable}</h1>
          <p>Currently busy or inactive</p>
        </div>
      </div>

      <div className="agent-list-section">
        <div className="agent-list-heading">
          <div>
            <h2>Agent List</h2>
            <p>View and manage your support team records.</p>
          </div>

          <button onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Close' : '+ Add Agent'}
          </button>
        </div>

        {showForm && (
          <div className="agent-form">
            <h3>Add New Agent to Database</h3>
            {errorMsg && <p style={{ color: '#ef4444', marginBottom: '8px' }}>{errorMsg}</p>}

            <input
              type="text"
              placeholder="Agent name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <input
              type="text"
              placeholder="Phone number (optional)"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />

            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="Customer Support">Customer Support</option>
              <option value="Technical Support">Technical Support</option>
              <option value="Team Leader">Team Leader</option>
              <option value="Admin">Admin</option>
            </select>

            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="Available">Available</option>
              <option value="Unavailable">Unavailable / Inactive</option>
            </select>

            <button onClick={addAgent}>Save Agent to Database</button>
          </div>
        )}

        <div className="agent-toolbar">
          <input
            type="text"
            placeholder="Search agent by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Status</option>
            <option value="Available">Available</option>
            <option value="Unavailable">Unavailable</option>
          </select>
        </div>

        <div className="agent-table">
          <table>
            <thead>
              <tr>
                <th>Agent Name</th>
                <th>Email</th>
                <th>Department / Role</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredAgents.map((agent) => {
                const isAvail = (agent.status || '').toUpperCase() === 'AVAILABLE';
                return (
                  <tr key={agent.agent_id || agent.email}>
                    <td>{agent.full_name}</td>
                    <td>{agent.email}</td>
                    <td>{agent.department || 'Customer Support'}</td>
                    <td>
                      <span className={isAvail ? 'available-status' : 'unavailable-status'}>
                        {isAvail ? 'Available' : 'Unavailable'}
                      </span>
                    </td>
                    <td>
                      <button
                        className="delete-agent"
                        onClick={() => deleteAgent(agent.agent_id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredAgents.length === 0 && (
            <p className="no-agents">
              {loading ? 'Loading agents from database...' : 'No agents found in database.'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Agents;
