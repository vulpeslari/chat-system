import React from 'react';
import "./styles/RotBar.css";
import { Link } from 'react-router-dom';

import { RiMessageFill } from "react-icons/ri";
import { IoPersonAdd } from "react-icons/io5";
import { BiSolidExit } from "react-icons/bi";
import { useLocation } from "react-router-dom";


const RotBar = () => {
  const location = useLocation();

  return (
    <div className="rotbar">
      <img className="user-icon" src="/img/user-icon.jpg" />
      <RiMessageFill className={`bar-icon ${location.pathname === '/' ? 'active' : ''}`} />
      <Link to={'/add-user'}>
        <IoPersonAdd className={`bar-icon ${location.pathname === '/add-user' ? 'active' : ''}`} />
      </Link>
      <BiSolidExit className='bar-icon exit' />
    </div>
  );
}

export default RotBar;
