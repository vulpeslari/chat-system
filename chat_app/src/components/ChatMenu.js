import React, { useState } from 'react';
import './styles/ChatMenu.css';
import { Link, useParams, useLocation } from 'react-router-dom';
import { BiSolidMessageAdd } from "react-icons/bi";
import { IoSearch } from "react-icons/io5";
import Chat from "./Chat";

import usersData from './../pseudobd/users.json'; 
import chatsData from './../pseudobd/chats.json'; 

const ChatMenu = () => {
    const location = useLocation();
    const { userId } = useParams();
    const [chats, setChats] = useState(chatsData); 
    const [users, setUsers] = useState(usersData); 
    const [searchTerm, setSearchTerm] = useState(""); 

    {/* GET USERNAMES FROM IDS */}
    const getUsernamesFromIds = (chatUserIds) => {
        const usernames = chatUserIds.map(id => {
            if (id === userId) {
                return 'you'; 
            }
            const user = users.find(u => u.userId === id);
            return user ? " @" + user.username : id;  
        });
    
        // Verifica a quantidade de nomes e ajusta a última vírgula para "e"
        if (usernames.length > 1) {
            return `${usernames.slice(0, -1).join(',')} e ${usernames[usernames.length - 1]}`;
        }
        
        return usernames[0]; // Retorna o único nome se houver só um usuário
    };

    {/* FILTER CHATS */}
    const filteredChats = chats.filter(chat => {
        const usernames = getUsernamesFromIds(chat.chatUsers);
        return usernames.toLowerCase().includes(searchTerm.toLowerCase());
    });

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value); 
    };

    return (
        <div className='chatmenu'>
            <div className='top-bar'>
                <h1>Chats</h1>
                <Link to={`/${userId}/add-chat`}>
                    <BiSolidMessageAdd className={`menu-icon add ${location.pathname === `/${userId}/add-chat` ? 'active' : ''}`} />
                </Link>
            </div>
            <div className='search-bar'>
                <label htmlFor='search'>
                    <IoSearch className='menu-icon search' />
                </label>
                <input 
                    type='text' 
                    id='search' 
                    placeholder='Pesquisar conversas' 
                    value={searchTerm}
                    onChange={handleSearchChange} 
                />
            </div>
            <div className='user-list'>
                {/* MAP CHATS */}
                {filteredChats.map(chat => (
                    <Link key={chat.id} to={`/${userId}/chat/${chat.id}`}>
                        <Chat chatName={chat.chatName} chatUsers={getUsernamesFromIds(chat.chatUsers)} />
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default ChatMenu;
