
import React, { useState } from 'react';
import './CustomerManagement.css';

function CustomersManagement() {

  var [customers, setCustomers] = useState([]);
  var [search, setSearch] = useState('');
  var [statusFilter, setStatusFilter] = useState('All');
  var [showForm, setShowForm] = useState(false);

  var [name, setName] = useState('');
  var [email, setEmail] = useState('');
  var [phone, setPhone] = useState('');
  var [status, setStatus] = useState('Active');

  function addCustomer() {

    if (name === '' || email === '' || phone === '') {
      alert('Please fill all details');
      return;
    }

    var newCustomer = {
      name: name,
      email: email,
      phone: phone,
      status: status,
      joinedDate: new Date().toLocaleDateString()
    };

    setCustomers([...customers, newCustomer]);

    setName('');
    setEmail('');
    setPhone('');
    setStatus('Active');
    setShowForm(false);
  }

  function deleteCustomer(phone) {

    var updatedCustomers = customers.filter((customer) => {
      return customer.phone !== phone;
    });

    setCustomers(updatedCustomers);
  }

  var filteredCustomers = customers.filter((customer) => {

    var searchMatch =
      customer.name.toLowerCase().includes(search.toLowerCase()) ||
      customer.email.toLowerCase().includes(search.toLowerCase()) ||
      customer.phone.includes(search);

    var statusMatch =
      statusFilter === 'All' || customer.status === statusFilter;

    return searchMatch && statusMatch;
  });

  var activeCustomers = customers.filter((customer) => {
    return customer.status === 'Active';
  });

  var inactiveCustomers = customers.filter((customer) => {
    return customer.status === 'Inactive';
  });

  return (

    <div className="customers-page">

      <div className="customers-heading">
        <p>CUSTOMER MANAGEMENT</p>
        <h1>Customers</h1>
        <p>Manage your customer details and monitor customer activity.</p>
      </div>

      <div className="customer-cards">

        <div className="customer-card">
          <h3>Total Customers</h3>
          <h1>{customers.length}</h1>
          <p>All customer records</p>
        </div>

        <div className="customer-card">
          <h3>Active Customers</h3>
          <h1>{activeCustomers.length}</h1>
          <p>Currently active</p>
        </div>

        <div className="customer-card">
          <h3>Inactive Customers</h3>
          <h1>{inactiveCustomers.length}</h1>
          <p>Currently inactive</p>
        </div>

      </div>

      <div className="customer-list-section">

        <div className="customer-list-heading">
          <div>
            <h2>Customer List</h2>
            <p>View and manage all your customers.</p>
          </div>

          <button onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Close' : '+ Add Customer'}
          </button>
        </div>

        {showForm && (

          <div className="customer-form">

            <h3>Add New Customer</h3>

            <input
              type="text"
              placeholder="Customer name"
              value={name}
              onChange={(event) => setName(event.target.value)}/>

            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(event) => setEmail(event.target.value)}/>

            <input
              type="text"
              placeholder="Phone number"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}/>

            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>

            <button onClick={addCustomer}>Save Customer</button>

          </div>

        )}

        <div className="customer-toolbar">

          <input
            type="text"
            placeholder="Search name, email or phone..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}/>

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}>
            <option value="All">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>

        </div>

        <div className="customer-table">

          <table>

            <thead>
              <tr>
                <th>Customer Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Status</th>
                <th>Joined Date</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>

              {filteredCustomers.map((customer) => (

                <tr key={customer.phone}>

                  <td>{customer.name}</td>
                  <td>{customer.email}</td>
                  <td>{customer.phone}</td>

                  <td>
                    <span className={customer.status === 'Active' ? 'active-status' : 'inactive-status'}>
                      {customer.status}
                    </span>
                  </td>

                  <td>{customer.joinedDate}</td>

                  <td>
                    <button
                      className="delete-customer"
                      onClick={() => deleteCustomer(customer.phone)}>
                      Delete
                    </button>
                  </td>

                </tr>

              ))}

            </tbody>

          </table>

          {filteredCustomers.length === 0 && (
            <p className="no-customers">No customers found.</p>
          )}

        </div>

      </div>

    </div>

  );
}

export default CustomersManagement;
