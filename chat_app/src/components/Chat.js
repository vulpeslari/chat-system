import React from 'react';
import './styles/UserAndChat.css';

const Chat = ({ chatName, chatUsers, status, number }) => {
  return (
    <div className='user-box'>
      <img className="user-icon" src="/img/user-icon.jpg" alt="User" />
      {status && <div className='notif'>{number}</div>}
      <div className='user-info'>
        <h2>{chatName}</h2>
        <h3>{chatUsers}</h3>
      </div>
    </div>
  );
};

export default Chat;
