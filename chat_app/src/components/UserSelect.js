import React from 'react'
import "./styles/UserAndChat.css"

const UserSelect = ({ contactName, contactStatus, isSelected, onSelect }) => {
    return (
        <div className='user-select-container' onClick={onSelect}>
            <input type='checkbox' checked={isSelected} readOnly />
            <img className="user-icon" src="/img/user-icon.jpg" alt={contactName} />
            <div className='user-info'>
                <h2>{contactName}</h2>
                <h3>{contactStatus}</h3>
            </div>
        </div>
    );
};


export default UserSelect