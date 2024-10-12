import React from 'react';
import './styles/UserAndChat.css';
import Dropdown from './Dropdown';

const Chat = () => {
  const options = [
    { label: 'Excluir Grupo', route: '/delete-chat' },
    { label: 'Editar Grupo', route: '/edit-chat' },
  ];

  return (
    <div className='user-box'>
      <img className="user-icon" src="/img/user-icon.jpg" alt="User" />
      <div className='user-info'>
        <h2>grupo exemplo</h2>
        <h3>you, @user123 e @user1234</h3>
      </div>
      <div className='user-options'>
        <Dropdown options={options} />
      </div>
    </div>
  );
};

export default Chat;

