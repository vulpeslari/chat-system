import React from 'react';
import './styles/UserAndChat.css';

import { IoPersonAdd } from "react-icons/io5";

const UserOption = () => {
    return (
        <div className='user-box'>
            <img className="user-icon" src="/img/user-icon.jpg" alt="User" />
            <div className='user-info'>
                <h2>@user123</h2>
                <h3>Não adicionado.</h3>
            </div>
            <IoPersonAdd className='menu-icon add-user'/>
        </div>
    );
};

export default UserOption;

