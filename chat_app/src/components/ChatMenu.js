import React from 'react'
import './styles/ChatMenu.css'
import { BiSolidMessageAdd } from "react-icons/bi"
import { IoSearch } from "react-icons/io5";

import User from "./User"

const ChatMenu = () => {
    return (
        <div className='chatmenu'>
            <div className='top-bar'>
                <h1>Chats</h1>
                <BiSolidMessageAdd className='menu-icon add' />
            </div>
            <div className='search-bar'>
                <IoSearch className='menu-icon search' />
                <input type='text' placeholder='Pesquisar conversas'></input>
            </div>
            <div className='user-list'>
                <User />
                <User />
                <User />
                <User />
                <User />
                <User />
            </div>
        </div>
    )
}

export default ChatMenu

