
import React, { useState } from 'react';
import './Agents.css';

function Agents() {

  var [agents, setAgents] = useState([]);

  var [search, setSearch] = useState('');
  var [statusFilter, setStatusFilter] = useState('All');
  var [showForm, setShowForm] = useState(false);

  var [name, setName] = useState('');
  var [email, setEmail] = useState('');
  var [role, setRole] = useState('');
  var [status, setStatus] = useState('Available');

  function addAgent() {

    if (name === '' || email === '' || role === '') {
      alert('Please fill all details');
      return;
    }

    var newAgent = {
      name: name,
      email: email,
      role: role,
      status: status
    };

    setAgents([...agents, newAgent]);

    setName('');
    setEmail('');
    setRole('');
    setStatus('Available');
    setShowForm(false);
  }

  function deleteAgent(email) {

    var updatedAgents = agents.filter((agent) => {
      return agent.email !== email;
    });

    setAgents(updatedAgents);
  }

  var filteredAgents = agents.filter((agent) => {

    var searchMatch =
      agent.name.toLowerCase().includes(search.toLowerCase()) ||
      agent.email.toLowerCase().includes(search.toLowerCase());

    var statusMatch =
      statusFilter === 'All' || agent.status === statusFilter;

    return searchMatch && statusMatch;
  });

  var availableAgents = agents.filter((agent) => {
    return agent.status === 'Available';
  });

  var unavailableAgents = agents.filter((agent) => {
    return agent.status === 'Unavailable';
  });

  return (

    <div className="agents-page">

      <div className="agents-heading">
        <p>AGENT MANAGEMENT</p>
        <h1>Agents</h1>
        <p>Manage your support team and monitor agent availability.</p>
      </div>

      <div className="agent-cards">

        <div className="agent-card">
          <h3>Total Agents</h3>
          <h1>{agents.length}</h1>
          <p>All team members</p>
        </div>

        <div className="agent-card">
          <h3>Available Agents</h3>
          <h1>{availableAgents.length}</h1>
          <p>Ready to handle conversations</p>
        </div>

        <div className="agent-card">
          <h3>Unavailable Agents</h3>
          <h1>{unavailableAgents.length}</h1>
          <p>Currently unavailable</p>
        </div>

      </div>

      <div className="agent-list-section">

        <div className="agent-list-heading">

          <div>
            <h2>Agent List</h2>
            <p>View and manage your support team.</p>
          </div>

          <button onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Close' : '+ Add Agent'}
          </button>

        </div>

        {showForm && (

          <div className="agent-form">

            <h3>Add New Agent</h3>

            <input
              type="text"
              placeholder="Agent name"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />

            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />

            <select
              value={role}
              onChange={(event) => setRole(event.target.value)}
            >
              <option value="">Select Role</option>
              <option value="Support Agent">Support Agent</option>
              <option value="Team Leader">Team Leader</option>
              <option value="Admin">Admin</option>
            </select>

            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
            >
              <option value="Available">Available</option>
              <option value="Unavailable">Unavailable</option>
            </select>

            <button onClick={addAgent}>Save Agent</button>

          </div>

        )}

        <div className="agent-toolbar">

          <input
            type="text"
            placeholder="Search agent by name or email..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
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
                <th>Role</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>

              {filteredAgents.map((agent) => (

                <tr key={agent.email}>

                  <td>{agent.name}</td>
                  <td>{agent.email}</td>
                  <td>{agent.role}</td>

                  <td>
                    <span className={agent.status === 'Available' ? 'available-status' : 'unavailable-status'}>
                      {agent.status}
                    </span>
                  </td>

                  <td>
                    <button
                      className="delete-agent"
                      onClick={() => deleteAgent(agent.email)}
                    >
                      Delete
                    </button>
                  </td>

                </tr>

              ))}

            </tbody>

          </table>

          {filteredAgents.length === 0 && (
            <p className="no-agents">No agents found.</p>
          )}

        </div>

      </div>

    </div>

  );
}

export default Agents;
