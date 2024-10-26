import React from 'react'
import "./styles/AddUserAndChat.css"

import UserOption from "./UserOption"

import { Link } from 'react-router-dom';
import { IoSearch } from "react-icons/io5";
import { IoCloseSharp } from "react-icons/io5";

const AddUser = () => {
    return (
        <div className='pop-up'>
            <div className='top-bar'>
                <h1>Buscar usuários</h1>
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
                <div className='users-options'>
                    <div className='users-options-list'>
                        <UserOption />
                        <UserOption />
                        <UserOption />
                        <UserOption />
                    </div>
                </div>
            </div>
    )
}

export default AddUser

