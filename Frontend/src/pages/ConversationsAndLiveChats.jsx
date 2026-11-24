import React, { useState } from 'react';

function ConversationsAndLiveChats() {

  var [search, setSearch] = useState('');
  var [selectedConversation, setSelectedConversation] = useState('');
  var [message, setMessage] = useState('');
  var [chatMessages, setChatMessages] = useState({});

  var [conversations, setConversations] = useState([
    {
      name: 'Muvendhan',
      lastMessage: 'I need help with my order',
      status: 'Open',
      agent: 'Support Agent',
      time: '10:30 AM'
    },
    {
      name: 'Shiva',
      lastMessage: 'Where is my order?',
      status: 'Pending',
      agent: 'Support Agent',
      time: '10:45 AM'
    }
  ]);

  var filteredConversations = conversations.filter((conversation) => {
    return conversation.name.toLowerCase().includes(search.toLowerCase());
  });

  function sendMessage() {

    if (message.trim() !== '' && selectedConversation !== '') {

      setChatMessages({
        ...chatMessages,
        [selectedConversation]: [
          ...(chatMessages[selectedConversation] || []),
          message
        ]
      });

      setMessage('');
    }
  }

  function clearMessages() {

    setChatMessages({
      ...chatMessages,
      [selectedConversation]: []
    });
  }

  return (
    <div className="conversations-page">

      <h1>Conversations & Live Chats</h1>

      <div className="conversations-container">

        <div className="conversation-list">

          <h2>All Conversations</h2>

          <input
            type="text"
            placeholder="Search conversations..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />

          {filteredConversations.map((conversation, index) => {

            return (
              <div className="conversation" key={index}>

                <h3>{conversation.name}</h3>

                <p>{conversation.lastMessage}</p>

                <p>Status: {conversation.status}</p>

                <p>Assigned to: {conversation.agent}</p>

                <p>{conversation.time}</p>

                <button
                  onClick={() => setSelectedConversation(conversation.name)}
                >
                  View Conversation
                </button>

              </div>
            );
          })}

        </div>

        {selectedConversation !== '' && (

          <div className="chat-container">

            <h2>Chat with {selectedConversation}</h2>

            <div className="chat-messages">

              <p>Customer: Hello, I need help.</p>

              <p>Agent: Sure, I'd be happy to help.</p>

              {(chatMessages[selectedConversation] || []).map((chat, index) => {

                return (
                  <p key={index}>Agent: {chat}</p>
                );

              })}

            </div>

            <button onClick={clearMessages}>
              Clear Messages
            </button>

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

          </div>

        )}

      </div>

    </div>
  );
}

export default ConversationsAndLiveChats;