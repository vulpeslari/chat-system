import React from 'react'
import "./styles/CreateUser.css"

function cadastro(){
   
}

const CreateUser = () => {
    return (
        <div className='square'>
            <div className='top-bar'>
                <h1>Regsitre-se</h1>
            </div>

            <div className='photo'>
                <img src="..\..\public\img\user-icon.jpg"></img>
            </div>

            <form className="formulario" method="POST">
                <div className='text-bar'>
                    <h3>Nome de Usuário</h3>
                    <input type='text' name='name'></input>
                </div>

                <div className='text-bar'>
                    <h3>Endereço de e-mail</h3>
                    <input type='text' name='email'></input>
                </div>

                <div className='text-bar'>
                    <h3>Senha</h3>
                    <input type='text' name="pass"></input>
                </div>

                <input type="submit" className='submit'>Cadastrar</input>
            </form>
        </div>
    )
}

export default CreateUser
