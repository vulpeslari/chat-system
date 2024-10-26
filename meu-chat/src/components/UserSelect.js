import React from 'react'
import "./styles/UserAndChat.css"

const UserSelect = () => {
    return (
        <div className='user-select-container'>
            <input type='checkbox'></input>
            <img className="user-icon" src="/img/user-icon.jpg" />
            <div className='user-info'>
                <h2>@user123</h2>
                <h3>online</h3>
            </div>
        </div>
    )
}

export default UserSelect