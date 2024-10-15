import React from 'react'
import "./styles/CreateUser.css"

import UserOption from "./UserOption"

import { Link } from 'react-router-dom';
import { IoSearch } from "react-icons/io5";
import { IoCloseSharp } from "react-icons/io5";

const CreateUser = () => {
    return (
        <div className='square'>
            <div className='top-bar'>
                <h1>Regsitre-se</h1>
            </div>

            <div className='photo'>
                <img src="..\..\public\img\user-icon.jpg"></img>
            </div>

            <div className='text-bar'>
                <h3>Nome de Usuário</h3>
                <input type='text'></input>
            </div>

            <div className='text-bar'>
                <h3>Endereço de e-mail</h3>
                <input type='text'></input>
            </div>

            <div className='text-bar'>
                <h3>Senha</h3>
                <input type='text'></input>
            </div>

            <button>Cadastrar</button>
        </div>
    )
}

export default CreateUser

