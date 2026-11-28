
import React, { useState, useEffect } from 'react';
import './ConversationsAndLiveChats.css';

function ConversationsAndLiveChats() {
  const [conversations, setConversations] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [message, setMessage] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [customersLoading, setCustomersLoading] = useState(false);
  const [showNewModal, setShowNewModal] = useState(false);
  const [newSubject, setNewSubject] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [newPriority, setNewPriority] = useState('NORMAL');

  const token = localStorage.getItem('access_token');

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };

  async function fetchConversations() {
    setLoading(true);

    try {
      let url = 'http://localhost:8000/api/conversations/';

      if (search.trim()) {
        url = `http://localhost:8000/api/conversations/search/?search=${encodeURIComponent(search.trim())}`;
      }

      const res = await fetch(url, { headers });

      if (res.ok) {
        const data = await res.json();
        const list = data.results || (Array.isArray(data) ? data : []);

        setConversations(list);

        if (
          selectedConversation &&
          !list.find(
            c =>
              c.conversation_id ===
              selectedConversation.conversation_id
          )
        ) {
          setSelectedConversation(null);
        }
      }
    } catch (err) {
      console.error('Error fetching conversations:', err);
    } finally {
      setLoading(false);
    }
  }

  async function fetchCustomers() {
    setCustomersLoading(true);

    try {
      const res = await fetch(
        'http://localhost:8000/api/customers/',
        { headers }
      );

      if (res.ok) {
        const data = await res.json();
        const list = data.results || (Array.isArray(data) ? data : []);

        setCustomers(list);
      } else {
        console.error('Failed to fetch customers.');
      }
    } catch (err) {
      console.error('Error fetching customers:', err);
    } finally {
      setCustomersLoading(false);
    }
  }

  async function fetchHistory(conversationId) {
    try {
      const res = await fetch(
        `http://localhost:8000/api/conversations/${conversationId}/history/`,
        { headers }
      );

      if (res.ok) {
        const data = await res.json();
        const list = data.results || (Array.isArray(data) ? data : []);

        setChatMessages(list);
      }
    } catch (err) {
      console.error('Error fetching chat history:', err);
    }
  }

  useEffect(() => {
    fetchConversations();
  }, [search]);

  useEffect(() => {
    if (showNewModal) {
      fetchCustomers();
    }
  }, [showNewModal]);

  function selectConversation(conversation) {
    setSelectedConversation(conversation);
    fetchHistory(conversation.conversation_id);
  }

  async function sendMessage() {
    if (message.trim() === '' || !selectedConversation) return;

    const textToSend = message.trim();
    setMessage('');

    try {
      const res = await fetch(
        `http://localhost:8000/api/conversations/${selectedConversation.conversation_id}/messages/`,
        {
          method: 'POST',
          headers,
          body: JSON.stringify({
            sender_type: 'AGENT',
            message_text: textToSend
          })
        }
      );

      if (res.ok) {
        fetchHistory(selectedConversation.conversation_id);
        fetchConversations();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to send message.');
      }
    } catch (err) {
      console.error('Error sending message:', err);
    }
  }

  async function createNewConversation(e) {
    e.preventDefault();

    if (!newSubject.trim() || !selectedCustomerId) {
      alert('Please select a customer and enter a subject.');
      return;
    }

    const selectedCustomer = customers.find(
      customer =>
        String(customer.customer_id) === String(selectedCustomerId)
    );

    if (!selectedCustomer) {
      alert('Please select a valid customer.');
      return;
    }

    try {
      const res = await fetch(
        'http://localhost:8000/api/conversations/',
        {
          method: 'POST',
          headers,
          body: JSON.stringify({
            subject: newSubject.trim(),
            customer_name: selectedCustomer.full_name,
            priority: newPriority,
            description: newSubject.trim()
          })
        }
      );

      if (res.ok) {
        const created = await res.json();

        setShowNewModal(false);
        setNewSubject('');
        setSelectedCustomerId('');
        setNewPriority('NORMAL');

        await fetchConversations();

        if (created.conversation_id) {
          selectConversation(created);
        }
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to start conversation.');
      }
    } catch (err) {
      console.error('Error creating conversation:', err);
      alert('Unable to create conversation. Please try again.');
    }
  }

  const statusCounts = conversations.reduce((counts, conversation) => {
    const status = conversation.status || 'Unknown';
    counts[status] = (counts[status] || 0) + 1;
    return counts;
  }, {});

  const chartStatuses = Object.entries(statusCounts);
  const maxStatusCount = Math.max(
    1,
    ...chartStatuses.map(([, count]) => count)
  );

  return (
    <div className="conversations-page">
      <div className="conversations-header">
        <div>
          <h1>Conversations &amp; Live Chat</h1>
          <p>
            Manage customer conversations and live messages.
          </p>
        </div>

        <button
          className="new-chat-button"
          onClick={() => setShowNewModal(true)}
        >
          + New Chat
        </button>
      </div>

      <div className="conversation-chart">
        <div className="conversation-chart-header">
          <div>
            <h2>Conversation Overview</h2>
            <p>Conversation status based on loaded records</p>
          </div>

          <span className="conversation-total">
            {conversations.length} Total
          </span>
        </div>

        {chartStatuses.length === 0 ? (
          <p className="chart-empty">
            No conversation data available yet.
          </p>
        ) : (
          <div className="status-chart">
            {chartStatuses.map(([status, count]) => (
              <div className="status-chart-row" key={status}>
                <span className="status-chart-label">
                  {status.replaceAll('_', ' ')}
                </span>

                <div className="status-chart-track">
                  <div
                    className="status-chart-bar"
                    style={{
                      width: `${(count / maxStatusCount) * 100}%`
                    }}
                  />
                </div>

                <span className="status-chart-count">
                  {count}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {showNewModal && (
        <div className="new-chat-overlay">
          <div className="new-chat-modal">
            <h3>Start New Conversation</h3>

            <form onSubmit={createNewConversation}>
              <div className="modal-form-group">
                <label>Customer *</label>

                <select
                  value={selectedCustomerId}
                  onChange={e => setSelectedCustomerId(e.target.value)}
                  required
                  disabled={customersLoading}
                >
                  <option value="">
                    {customersLoading
                      ? 'Loading customers...'
                      : 'Select a customer'}
                  </option>

                  {customers.map(customer => (
                    <option
                      key={customer.customer_id}
                      value={customer.customer_id}
                    >
                      {customer.full_name}
                      {customer.email ? ` (${customer.email})` : ''}
                    </option>
                  ))}
                </select>

                {!customersLoading && customers.length === 0 && (
                  <small className="modal-help">
                    No customers found. Add a customer in Customer Management first.
                  </small>
                )}
              </div>

              <div className="modal-form-group">
                <label>Topic / Subject *</label>

                <input
                  type="text"
                  placeholder="e.g. Need assistance with order"
                  required
                  value={newSubject}
                  onChange={e => setNewSubject(e.target.value)}
                />
              </div>

              <div className="modal-form-group">
                <label>Priority</label>

                <select
                  value={newPriority}
                  onChange={e => setNewPriority(e.target.value)}
                >
                  <option value="LOW">Low</option>
                  <option value="NORMAL">Normal</option>
                  <option value="HIGH">High</option>
                </select>
              </div>

              <div className="new-chat-modal-actions">
                <button
                  type="button"
                  className="cancel-chat-button"
                  onClick={() => {
                    setShowNewModal(false);
                    setNewSubject('');
                    setSelectedCustomerId('');
                    setNewPriority('NORMAL');
                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="create-chat-button"
                  disabled={customersLoading || customers.length === 0}
                >
                  Create Chat
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="chat-container">
        <div className="conversation-list">
          <h2>Active Conversations</h2>

          <input
            type="text"
            placeholder="Search conversations..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />

          {conversations.length === 0 ? (
            <p className="no-conversations">
              {loading
                ? 'Loading conversations...'
                : 'No conversations found. Click "+ New Chat" to start one.'}
            </p>
          ) : (
            conversations.map(conv => {
              const isSelected =
                selectedConversation?.conversation_id ===
                conv.conversation_id;

              return (
                <div
                  className={`conversation-item ${
                    isSelected ? 'active-chat-item' : ''
                  }`}
                  key={conv.conversation_id}
                  onClick={() => selectConversation(conv)}
                >
                  <h3>{conv.subject}</h3>
                  <p>{conv.customer_name || 'Customer'}</p>
                  <span>Status: {conv.status}</span>
                </div>
              );
            })
          )}
        </div>

        <div className="chat-section">
          {selectedConversation === null ? (
            <div className="empty-chat">
              <h2>Select a conversation</h2>
              <p>
                Choose a chat from the left panel or click
                "+ New Chat" to begin.
              </p>
            </div>
          ) : (
            <>
              <div className="chat-header">
                <h2>{selectedConversation.subject}</h2>

                <small>
                  Customer: {selectedConversation.customer_name || 'Customer'}
                  {' | '}
                  Status: {selectedConversation.status}
                </small>
              </div>

              <div className="chat-messages">
                {chatMessages.length === 0 && (
                  <p className="no-chat-messages">
                    No messages yet. Send the first response below.
                  </p>
                )}

                {chatMessages.map(chat => (
                  <div
                    key={chat.message_id}
                    className={`agent-message ${
                      chat.sender_type === 'AGENT'
                        ? 'agent-message-own'
                        : 'agent-message-customer'
                    }`}
                  >
                    <strong>
                      {chat.sender_type === 'AGENT' ? 'Agent' : 'Customer'}
                      {' • '}
                      {chat.sent_at
                        ? new Date(chat.sent_at).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })
                        : ''}
                    </strong>

                    <div>{chat.message_text}</div>
                  </div>
                ))}
              </div>

              <div className="chat-input">
                <input
                  type="text"
                  placeholder="Type your message..."
                  value={message}
                  onChange={event => setMessage(event.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') sendMessage();
                  }}
                />

                <button onClick={sendMessage}>Send</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default ConversationsAndLiveChats;
