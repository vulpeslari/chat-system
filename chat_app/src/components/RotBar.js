import React from 'react';
import "./styles/RotBar.css";
import { Link, useParams, useLocation, useNavigate } from 'react-router-dom';

import { RiMessageFill } from "react-icons/ri";
import { BiSolidExit } from "react-icons/bi";

const RotBar = () => {
  const { userId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    console.log("Logout acionado");
    localStorage.removeItem(userId); // Remove o token de autenticação
    navigate('/'); 
  };

  return (
    <div className="rotbar">
      <Link to={`/${userId}/user`}>
        <img className="user-icon" src="/img/user-icon.jpg" alt="User" />
      </Link>
      <Link to={`/${userId}`}>
        <RiMessageFill className={`bar-icon ${location.pathname === `/${userId}` ? 'active' : ''}`} />
      </Link>
      <BiSolidExit className="bar-icon exit" onClick={handleLogout} />
    </div>
  );
};

export default RotBar;
