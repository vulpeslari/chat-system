import React from 'react';
import "./styles/Message.css";
import { IoCheckmarkDoneOutline } from "react-icons/io5";

const Message = ({ type }) => {
    return (
        <div className={`user-message ${type === 'reply' ? 'reply' : ''}`}>
            <img className="user-icon" src="/img/user-icon.jpg" />
            <div className='message-info'>
                <h1>@user123</h1>
                <p>Conteúdo da mensagem.</p>
                <div className='timestamp'>
                    <p>09 de outubro de 2024 às 08:30</p>
                    <IoCheckmarkDoneOutline className='check-icon' />
                </div>
            </div>
        </div>
    );
}

export default Message;

