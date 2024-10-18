import React from 'react';
import "./styles/Message.css";
import { IoCheckmarkDoneOutline } from "react-icons/io5";

{/* TIMESTAMP FORMATTING */ }
const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return new Intl.DateTimeFormat('pt-BR', { 
        dateStyle: 'long', 
        timeStyle: 'short' 
    }).format(date);
};

const Message = ({ type, content, timestamp, username, status }) => {
    const formattedTimestamp = formatTimestamp(timestamp);

    {/* SEEN/UNSEEN MESSAGE ICON */}
    const checkIconColor = status === 'seen' ? 'var(--orange)' : 'var(--white)'; 

    return (
        <div className={`user-message ${type === 'reply' ? 'reply' : ''}`}>
            <img className="user-icon" src="/img/user-icon.jpg" alt="User Icon" />
            <div className='message-info'>
                <h1>@{username}</h1> 
                <p>{content}</p>
                <div className='timestamp'>
                    <p>{formattedTimestamp}</p>
                    <IoCheckmarkDoneOutline className='check-icon' style={{ color: checkIconColor }} />
                </div>
            </div>
        </div>
    );
};

export default Message;
