
import React, { useState } from 'react';
import './ConversationsAndLiveChats.css';

function ConversationsAndLiveChats() {

  var [conversations, setConversations] = useState([
    {
    
    }
  ]);
  var [selectedConversation, setSelectedConversation] = useState(null);
  var [message, setMessage] = useState('');
  var [chatMessages, setChatMessages] = useState([]);

  function selectConversation(conversation) {
    setSelectedConversation(conversation);
    setChatMessages([]);
  }

  function sendMessage() {
    if (message.trim() === '') {
      return;
    }

    if (selectedConversation === null) {
      return;
    }

    var newMessage = {
      text: message,
      sender: 'Agent'
    };

    setChatMessages([...chatMessages, newMessage]);
    setMessage('');
  }

  return (
    <div className="conversations-page">

      <div className="conversations-header">
        <h1>Conversations & Live Chat</h1>
        <p>Manage customer conversations and respond to messages.</p>
      </div>

      <div className="chat-container">

        <div className="conversation-list">

          <h2>All Conversations</h2>

          <input
            type="text"
            placeholder="Search conversations..."
          />

          {conversations.length === 0 ? (
            <p className="no-conversations">
              No conversations available.
            </p>
          ) : (
            conversations.map((conversation, index) => (
              <div
                className="conversation-item"
                key={index}
                onClick={() => selectConversation(conversation)}
              >
                <h3>{conversation.name}</h3>
                <p>{conversation.lastMessage}</p>
                <span>{conversation.status}</span>
              </div>
            ))
          )}

        </div>

        <div className="chat-section">

          {selectedConversation === null ? (
            <div className="empty-chat">
              <h2>Select a conversation</h2>
              <p>Choose a conversation to view messages.</p>
            </div>
          ) : (
            <>
              <div className="chat-header">
                <h2>{selectedConversation.name}</h2>
              </div>

              <div className="chat-messages">
                {chatMessages.map((chat, index) => (
                  <p key={index} className="agent-message">
                    {chat.sender}: {chat.text}
                  </p>
                ))}
              </div>

              <div className="chat-input">
                <input
                  type="text"
                  placeholder="Type your message..."
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                />

                <button onClick={sendMessage}>
                  Send
                </button>
              </div>
            </>
          )}

        </div>

      </div>

    </div>
  );
}

export default ConversationsAndLiveChats;
