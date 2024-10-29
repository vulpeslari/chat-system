import React from 'react';
import './styles/UserAndChat.css';
import { IoNotificationsCircle } from "react-icons/io5";

const Chat = ({ chatName, chatUsers, status }) => {
  return (
    <div className='user-box'>
      <img className="user-icon" src="/img/user-icon.jpg" alt="User" />
      {status && <IoNotificationsCircle className='notif' />}
      <div className='user-info'>
        <h2>{chatName}</h2>
        <h3>{chatUsers}</h3>
      </div>
    </div>
  );
};

export default Chat;
