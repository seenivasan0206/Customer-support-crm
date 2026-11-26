import React, { useState, useEffect } from 'react';
import './ConversationsAndLiveChats.css';

function ConversationsAndLiveChats() {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [message, setMessage] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // New conversation form modal
  const [showNewModal, setShowNewModal] = useState(false);
  const [newSubject, setNewSubject] = useState('');
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newPriority, setNewPriority] = useState('NORMAL');

  const token = localStorage.getItem('access_token');

  async function fetchConversations() {
    setLoading(true);
    try {
      let url = 'http://localhost:8000/api/conversations/';
      if (search.trim()) {
        url = `http://localhost:8000/api/conversations/search/?search=${encodeURIComponent(search.trim())}`;
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
        setConversations(list);
        if (selectedConversation && !list.find(c => c.conversation_id === selectedConversation.conversation_id)) {
          setSelectedConversation(null);
        }
      }
    } catch (err) {
      console.error('Error fetching conversations:', err);
    } finally {
      setLoading(false);
    }
  }

  async function fetchHistory(conversationId) {
    try {
      const res = await fetch(`http://localhost:8000/api/conversations/${conversationId}/history/`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });
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

  function selectConversation(conversation) {
    setSelectedConversation(conversation);
    fetchHistory(conversation.conversation_id);
  }

  async function sendMessage() {
    if (message.trim() === '' || !selectedConversation) return;

    const textToSend = message.trim();
    setMessage('');

    try {
      const res = await fetch(`http://localhost:8000/api/conversations/${selectedConversation.conversation_id}/messages/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          sender_type: 'AGENT',
          message_text: textToSend,
        })
      });

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
    if (!newSubject.trim()) return;

    try {
      const res = await fetch('http://localhost:8000/api/conversations/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          subject: newSubject.trim(),
          customer_name: newCustomerName.trim() || 'Website Visitor',
          priority: newPriority,
          description: newSubject.trim(),
        })
      });

      if (res.ok) {
        const created = await res.json();
        setShowNewModal(false);
        setNewSubject('');
        setNewCustomerName('');
        fetchConversations();
        selectConversation(created);
      } else {
        alert('Failed to start conversation.');
      }
    } catch (err) {
      console.error('Error creating conversation:', err);
    }
  }

  return (
    <div className="conversations-page">
      <div className="conversations-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Conversations & Live Chat</h1>
          <p>Real-time customer messages stored in the CRM database.</p>
        </div>
        <button
          onClick={() => setShowNewModal(true)}
          style={{
            backgroundColor: '#4f46e5',
            color: 'white',
            border: 'none',
            padding: '10px 18px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: '600'
          }}
        >
          + New Chat
        </button>
      </div>

      {showNewModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999
        }}>
          <div style={{
            backgroundColor: '#1e293b', padding: '24px', borderRadius: '10px', width: '400px', border: '1px solid #334155', color: 'white'
          }}>
            <h3 style={{ marginTop: 0 }}>Start New Conversation</h3>
            <form onSubmit={createNewConversation}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '13px', marginBottom: '4px' }}>Customer Name</label>
                <input
                  type="text"
                  placeholder="e.g. John Doe"
                  value={newCustomerName}
                  onChange={(e) => setNewCustomerName(e.target.value)}
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #475569', backgroundColor: '#0f172a', color: 'white' }}
                />
              </div>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '13px', marginBottom: '4px' }}>Topic / Subject *</label>
                <input
                  type="text"
                  placeholder="e.g. Need assistance with order"
                  required
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #475569', backgroundColor: '#0f172a', color: 'white' }}
                />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', marginBottom: '4px' }}>Priority</label>
                <select
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value)}
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #475569', backgroundColor: '#0f172a', color: 'white' }}
                >
                  <option value="LOW">Low</option>
                  <option value="NORMAL">Normal</option>
                  <option value="HIGH">High</option>
                </select>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  style={{ padding: '8px 14px', borderRadius: '4px', border: '1px solid #64748b', background: 'transparent', color: 'white', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '8px 16px', borderRadius: '4px', border: 'none', backgroundColor: '#4f46e5', color: 'white', cursor: 'pointer' }}
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
            onChange={(e) => setSearch(e.target.value)}
          />

          {conversations.length === 0 ? (
            <p className="no-conversations">
              {loading ? 'Loading conversations...' : 'No conversations in database. Click "+ New Chat" to start one.'}
            </p>
          ) : (
            conversations.map((conv) => {
              const isSelected = selectedConversation?.conversation_id === conv.conversation_id;
              return (
                <div
                  className={`conversation-item ${isSelected ? 'active-chat-item' : ''}`}
                  key={conv.conversation_id}
                  onClick={() => selectConversation(conv)}
                  style={isSelected ? { backgroundColor: 'rgba(79, 70, 229, 0.25)', borderLeft: '4px solid #4f46e5' } : {}}
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
              <p>Choose an active chat from the left panel or click "+ New Chat" to begin.</p>
            </div>
          ) : (
            <>
              <div className="chat-header">
                <h2>{selectedConversation.subject}</h2>
                <small style={{ color: '#94a3b8' }}>
                  Customer: {selectedConversation.customer_name || 'Customer'} | Status: {selectedConversation.status}
                </small>
              </div>

              <div className="chat-messages" style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', padding: '16px' }}>
                {chatMessages.length === 0 && (
                  <p style={{ color: '#94a3b8', textAlign: 'center', margin: 'auto' }}>
                    No messages yet in this conversation. Send the first response below.
                  </p>
                )}
                {chatMessages.map((chat) => (
                  <div
                    key={chat.message_id}
                    className="agent-message"
                    style={{
                      padding: '8px 14px',
                      borderRadius: '8px',
                      backgroundColor: chat.sender_type === 'AGENT' ? '#312e81' : '#1e293b',
                      alignSelf: chat.sender_type === 'AGENT' ? 'flex-end' : 'flex-start',
                      maxWidth: '80%'
                    }}
                  >
                    <strong style={{ fontSize: '11px', display: 'block', color: '#93c5fd', marginBottom: '2px' }}>
                      {chat.sender_type === 'AGENT' ? 'Agent' : 'Customer'} • {new Date(chat.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </strong>
                    {chat.message_text}
                  </div>
                ))}
              </div>

              <div className="chat-input">
                <input
                  type="text"
                  placeholder="Type your message to store in database..."
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  onKeyDown={(e) => {
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
