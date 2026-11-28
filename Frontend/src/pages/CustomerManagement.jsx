
import React, { useState, useEffect } from 'react';
import './CustomerManagement.css';

function CustomersManagement() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statistics, setStatistics] = useState({
    total_customers: 0,
    active: 0,
    inactive: 0
  });

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showForm, setShowForm] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState('Active');
  const [plan, setPlan] = useState('BASIC');
  const [errorMsg, setErrorMsg] = useState('');

  const token = localStorage.getItem('access_token');

  async function fetchStats() {
    try {
      const res = await fetch(
        'http://localhost:8000/api/customers/statistics/',
        {
          headers: {
            'Content-Type': 'application/json',
            ...(token
              ? { Authorization: `Bearer ${token}` }
              : {})
          }
        }
      );

      if (res.ok) {
        const data = await res.json();

        setStatistics({
          total_customers: data.total_customers || 0,
          active: data.account_status?.active || 0,
          inactive:
            (data.account_status?.inactive || 0) +
            (data.account_status?.suspended || 0)
        });
      }
    } catch (err) {
      console.error('Failed to fetch customer stats:', err);
    }
  }

  async function fetchCustomers() {
    setLoading(true);

    try {
      let url = 'http://localhost:8000/api/customers/';

      if (search.trim()) {
        url = `http://localhost:8000/api/customers/search/?search=${encodeURIComponent(
          search.trim()
        )}`;
      } else if (statusFilter !== 'All') {
        url = `http://localhost:8000/api/customers/filter/?account_status=${statusFilter.toUpperCase()}`;
      }

      const res = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...(token
            ? { Authorization: `Bearer ${token}` }
            : {})
        }
      });

      if (res.ok) {
        const data = await res.json();
        const list = data.results || (Array.isArray(data) ? data : []);

        setCustomers(list);
      } else {
        console.error('Error fetching customers:', res.status);
      }
    } catch (err) {
      console.error('Network error connecting to customers API:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCustomers();
    fetchStats();
  }, [search, statusFilter]);

  async function addCustomer() {
    if (name.trim() === '' || email.trim() === '') {
      setErrorMsg('Please enter customer name and email.');
      return;
    }

    setErrorMsg('');

    try {
      const res = await fetch(
        'http://localhost:8000/api/customers/',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token
              ? { Authorization: `Bearer ${token}` }
              : {})
          },
          body: JSON.stringify({
            full_name: name.trim(),
            email: email.trim(),
            phone_number: phone.trim(),
            account_status: status.toUpperCase(),
            subscription_plan: plan.toUpperCase()
          })
        }
      );

      const data = await res.json();

      if (res.ok) {
        setName('');
        setEmail('');
        setPhone('');
        setStatus('Active');
        setPlan('BASIC');
        setShowForm(false);

        fetchCustomers();
        fetchStats();
      } else {
        const errorText = Object.entries(data)
          .map(([k, v]) =>
            `${k}: ${Array.isArray(v) ? v.join(' ') : v}`
          )
          .join(' | ');

        setErrorMsg(errorText || 'Failed to create customer.');
      }
    } catch (err) {
      setErrorMsg('Network error while saving customer.');
    }
  }

  async function deleteCustomer(customerId) {
    if (
      !window.confirm(
        'Are you sure you want to delete this customer?'
      )
    ) {
      return;
    }

    try {
      const res = await fetch(
        `http://localhost:8000/api/customers/${customerId}/`,
        {
          method: 'DELETE',
          headers: {
            ...(token
              ? { Authorization: `Bearer ${token}` }
              : {})
          }
        }
      );

      if (res.ok) {
        fetchCustomers();
        fetchStats();
      } else {
        alert('Failed to delete customer.');
      }
    } catch (err) {
      console.error('Error deleting customer:', err);
    }
  }

  return (
    <div className="customers-page">
      <div className="customers-heading">
        <div>
          
          <h1>Customer Management</h1>
          <p>
            Manage your customer details stored directly in the CRM database.
          </p>
        </div>

        <button
          className="customer-primary-button"
          onClick={() => {
            setErrorMsg('');
            setShowForm(true);
          }}
        >
          + Add Customer
        </button>
      </div>

      <div className="customer-cards">
        <div className="customer-card">
          <div className="customer-card-icon">👥</div>
          <h3>Total Customers</h3>
          <h1>{statistics.total_customers || customers.length}</h1>
          <p>All database customer records</p>
        </div>

        <div className="customer-card">
          <div className="customer-card-icon">✓</div>
          <h3>Active Customers</h3>
          <h1>{statistics.active}</h1>
          <p>Currently active</p>
        </div>

        <div className="customer-card">
          <div className="customer-card-icon">⏸</div>
          <h3>Inactive Customers</h3>
          <h1>{statistics.inactive}</h1>
          <p>Inactive or suspended</p>
        </div>
      </div>

      <div className="customer-list-section">
        <div className="customer-list-heading">
          <div>
            <h2>Customer List</h2>
            <p>
              View, search, and manage all database customer records.
            </p>
          </div>
        </div>

        <div className="customer-toolbar">
          <input
            type="text"
            placeholder="Search name, email or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="Suspended">Suspended</option>
          </select>
        </div>

        <div className="customer-table">
          <table>
            <thead>
              <tr>
                <th>Customer Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Plan</th>
                <th>Status</th>
                <th>Joined Date</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {customers.map((c) => {
                const accountStatus = (
                  c.account_status || 'ACTIVE'
                ).toUpperCase();

                const isActive = accountStatus === 'ACTIVE';

                const dateStr = c.registration_date
                  ? new Date(
                      c.registration_date
                    ).toLocaleDateString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric'
                    })
                  : 'Recent';

                return (
                  <tr key={c.customer_id || c.email}>
                    <td>
                      <div className="customer-name">
                        {c.full_name}
                      </div>
                    </td>

                    <td>{c.email}</td>

                    <td>{c.phone_number || '—'}</td>

                    <td>
                      <span className="customer-plan">
                        {c.subscription_plan || 'BASIC'}
                      </span>
                    </td>

                    <td>
                      <span
                        className={
                          isActive
                            ? 'active-status'
                            : 'inactive-status'
                        }
                      >
                        {c.account_status || 'ACTIVE'}
                      </span>
                    </td>

                    <td>{dateStr}</td>

                    <td>
                      <button
                        className="delete-customer"
                        onClick={() =>
                          deleteCustomer(c.customer_id)
                        }
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {customers.length === 0 && (
            <p className="no-customers">
              {loading
                ? 'Loading customers from database...'
                : 'No customers found in database.'}
            </p>
          )}
        </div>
      </div>

      {showForm && (
        <div
          className="customer-modal-overlay"
          onClick={() => setShowForm(false)}
        >
          <div
            className="customer-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="customer-modal-header">
              <div>
                <h2>Add New Customer</h2>
                <p>Enter the customer details below.</p>
              </div>

              <button
                className="customer-modal-close"
                onClick={() => setShowForm(false)}
              >
                ×
              </button>
            </div>

            {errorMsg && (
              <p className="customer-error-message">
                {errorMsg}
              </p>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                addCustomer();
              }}
            >
              <label>Customer Name</label>
              <input
                type="text"
                placeholder="Enter customer name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />

              <label>Email Address</label>
              <input
                type="email"
                placeholder="Enter email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <label>Phone Number</label>
              <input
                type="text"
                placeholder="Enter phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />

              <label>Subscription Plan</label>
              <select
                value={plan}
                onChange={(e) => setPlan(e.target.value)}
              >
                <option value="FREE">Free Plan</option>
                <option value="BASIC">Basic Plan</option>
                <option value="STANDARD">Standard Plan</option>
                <option value="PREMIUM">Premium Plan</option>
              </select>

              <label>Account Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Suspended">Suspended</option>
              </select>

              <div className="customer-modal-actions">
                <button
                  type="button"
                  className="customer-cancel-button"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="customer-save-button"
                >
                  Save Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default CustomersManagement;
