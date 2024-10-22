import React from 'react'
import { useEffect } from 'react';
import { useState } from 'react';
import "./styles/CreateUser.css"

const CreateUser = () => {

    const [formData, setFormData] = useState({
        nome: "",
        email: "",
        senha: ""
    })

    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [pass, setPass] = useState("")

    const submit = (e) => {
        e.preventDefault()
        console.log(formData)
    }

    return (
        <div className='square'>
            <div className='top-bar'>
                <h1>Regsitre-se</h1>
            </div>

            <div className='photo'>
                <img src="..\..\public\img\user-icon.jpg"></img>
            </div>

            <form className="formulario" method="POST" onSubmit={submit}>
                <div className='text-bar'>
                    <h3>Nome de Usuário</h3>
                    <input type='text' className="nome" value={formData.nome}
                    onChange={(a)=> setFormData({...formData, nome: a.target.value})}/>
                </div>

                <div className='text-bar'>
                    <h3>Endereço de e-mail</h3>
                    <input type='text' className="email" value={formData.email}
                    onChange={(a)=> setFormData({...formData, email: a.target.value})}/>
                </div>

                <div className='text-bar'>
                    <h3>Senha</h3>
                    <input type='text' className="pass" value={formData.senha}
                    onChange={(a)=> setFormData({...formData, senha: a.target.value})}/>
                </div>

                <input type="submit" className="submit" value={"Cadastrar"}/>
            </form>
        </div>
    )
}

export default CreateUser
