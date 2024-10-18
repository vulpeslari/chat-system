import React from 'react';
import "./styles/RotBar.css";
import { Link, useParams, useLocation } from 'react-router-dom';

import { RiMessageFill } from "react-icons/ri";
import { IoPersonAdd } from "react-icons/io5";
import { BiSolidExit } from "react-icons/bi";

const RotBar = () => {
  const { userId } = useParams();
  const location = useLocation();

  return (
    <div className="rotbar">
      <img className="user-icon" src="/img/user-icon.jpg" alt="User" />
      <Link to={`/${userId}`}>
        <RiMessageFill className={`bar-icon ${location.pathname === `/${userId}` ? 'active' : ''}`} />
      </Link>
      <Link to={`/${userId}/add-user`}>
        <IoPersonAdd className={`bar-icon ${location.pathname === `/${userId}/add-user` ? 'active' : ''}`} />
      </Link>
      <Link to={'/'}>
        <BiSolidExit className='bar-icon exit' />
      </Link>
    </div>
  );
};

export default RotBar;
