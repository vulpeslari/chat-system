import React from 'react'
import "./styles/AddUserAndChat.css"

import UserSelect from "./UserSelect"

import { Link } from 'react-router-dom';
import { IoSearch } from "react-icons/io5";
import { IoCloseSharp } from "react-icons/io5";
import { IoIosAdd } from "react-icons/io";
import { FaPen } from "react-icons/fa";

const AddChat = () => {
    return (
        <div className='pop-up'>
            <div className='top-bar'>
                <h1>Nova conversa</h1>
                <Link to='/'>
                    <IoCloseSharp className='menu-icon' />
                </Link>
            </div>
            <div className='search-bar'>
                <label for='search'>
                    <IoSearch className='menu-icon search' />
                </label>
                <input type='text' id='search' placeholder='Pesquisar usuários'></input>
            </div>
            <div className='add-container'>
                <div className='chat-info'>
                    <h2>Foto do Chat</h2>
                    <div className='chat-photo-container'>
                        <label for='chat-photo'>
                            <img className="chat-icon" src="/img/user-icon.jpg" />
                        </label>
                        <input id='chat-photo' type='file'></input>
                    </div>
                    <h2>Nome do Chat</h2>
                    <div className='chat-name-container'>
                        <input id='chat-name' type='text' placeholder='Dê um nome ao grupo'></input>
                        <label for='chat-name'>
                            <FaPen className='menu-icon' />
                        </label>
                    </div>
                </div>
                <div className='users-select'>
                    <h2>Membros do Chat</h2>
                    <div className='users-select-list'>
                        <UserSelect />
                        <UserSelect />
                        <UserSelect />
                        <UserSelect />
                    </div>
                </div>
            </div>
            <div className='footer'>
                <button className='button'>Criar chat <IoIosAdd className='button-icon' />
                </button>
            </div>
        </div >
    )
}

export default AddChat

