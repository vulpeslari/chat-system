import React from 'react';
import "./styles/RotBar.css";
import { RiMessageFill } from "react-icons/ri";
import { TiUserAdd } from "react-icons/ti";
import { BiSolidExit } from "react-icons/bi";
import { useLocation } from "react-router-dom"; 

const RotBar = () => {
  const location = useLocation();

  return (
    <div className="rotbar">
      <img className="user-icon" src="/img/user-icon.jpg"/>
      <RiMessageFill className={`bar-icon ${location.pathname === '/' ? 'active' : ''}`} />
      <TiUserAdd className='bar-icon'/>
      <BiSolidExit className='bar-icon exit'/>
    </div>
  );
}

export default RotBar;
