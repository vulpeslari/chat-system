import React from 'react'
import './styles/ChatMenu.css'
import { Link } from 'react-router-dom';

import { BiSolidMessageAdd } from "react-icons/bi"
import { IoSearch } from "react-icons/io5";
import { useLocation } from "react-router-dom";

import Chat from "./Chat"

const ChatMenu = () => {
    const location = useLocation();

    return (
        <div className='chatmenu'>
            <div className='top-bar'>
                <h1>Chats</h1>
                <Link to={'/add-chat'}>
                    <BiSolidMessageAdd className={`menu-icon add ${location.pathname === '/add-chat' ? 'active' : ''}`} />
                </Link>
            </div>
            <div className='search-bar'>
                <label for='search'>
                    <IoSearch className='menu-icon search' />
                </label>
                <input type='text' id='search' placeholder='Pesquisar conversas'></input>
            </div>
            <div className='user-list'>
                <Chat />
                <Chat />
                <Chat />
                <Chat />
                <Chat />
                <Chat />
            </div>
        </div >
    )
}

export default ChatMenu

