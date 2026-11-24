import React, {useState} from "react";

function ConversationsAndLiveChats(){

  var [selectedConversation,setSelectedConversation]=useState('');
  var [message,setMessage]=useState('');
  var [chatMessages, setChatMessages]= useState({});

  function sendMessage(){
    if(message.trim() !=='' && selectedConversation !==''){
      setChatMessages({...chatMessages,[selectedConversation]:[...(chatMessages[selectedConversation] || []), message
      ]});
      setMessage('');
    }
  }
  return(
    <div className="convo-page">
      <h1>Conversations & Live Chats</h1>
      <div className="conversations-container">
        <h2>All Conversations</h2>

        <input type="text" placeholder="search" />

        <div className="conversation-list">
          <div className="conversation">
            <h3>Muvendhan</h3>
            <p>I need help</p>
            <p>Status: Open</p>
             <p>Assigned to: Support Agent</p>
             <p>10: 30 am</p>
             <p>Messages: 3</p>
             <button onClick={()=> setSelectedConversation('Muvendhan')}>view</button>
          </div>

          <div className="conversation">
            <h3>Shiva</h3>
            <p>Where is my order</p>
            <p>Status: Pending</p>
            <p>Assigned to: Support Agent</p>
            <p>9:30 am</p>
            <p>Messages: 2</p>
            <button onClick={()=> setSelectedConversation('Shiva')}>view</button>
          </div>
        </div>
        {selectedConversation !=='' &&(
          <div>
            <h2>Chat with {selectedConversation}</h2>

            <div className="chat-messages">
              <p>Customer: i need help</p>
              <p>Agent: sure</p>
              <p>Customer: where is my order?</p>
              <p>Agent: let me check</p>
              {(chatMessages[selectedConversation] || []).map((chat,index)=>{
                  return(
                    <p key={index}>Agent: chat</p>
                  );
                })}
              }
            </div>

            <button onClick={()=> setChatMessages([])}>Clear message</button>

            <div className="chat-input">
              <input type="text" placeholder="type your message" value={message} onChange={(event)=> setMessage(event.target.value)}/>
              <button onClick={sendMessage}>send</button>
            </div>
          </div>
        )}
      </div>
    </div>

  
  );
}

export default ConversationsAndLiveChats;