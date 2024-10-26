import React from 'react'
import "./styles/User.css"
import { SlOptionsVertical } from "react-icons/sl";

const User = () => {
  return (
    <div className='user-box'>
        <img className="user-icon" src="/img/user-icon.jpg" />
        <div className='user-info'>
            <h2>@user123</h2>
            <h3>online</h3>
        </div>
        <SlOptionsVertical className='bar-icon user-options'/>
    </div>
  )
}

export default User