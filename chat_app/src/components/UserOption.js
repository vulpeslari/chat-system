import React, { useState } from 'react';
import './styles/UserAndChat.css';
import { IoPersonAdd } from "react-icons/io5";

const UserOption = ({ userName, initialStatus, onChangeStatus }) => {
    const [status, setStatus] = useState(initialStatus); 

    const handleAddUser = () => {
        setStatus(true);
        if (onChangeStatus) {
            onChangeStatus(true);
        }
    };

    return (
        <div className='user-box'>
            <img className="user-icon" src="/img/user-icon.jpg" alt={`${userName} icon`} />
            <div className='user-info'>
                <h2>{userName}</h2>
                <h3>{status ? 'Adicionado.' : 'Não adicionado.'}</h3>
            </div>
            {!status && ( 
                <IoPersonAdd className='menu-icon add-user' onClick={handleAddUser} />
            )}
        </div>
    );
};

export default UserOption;
