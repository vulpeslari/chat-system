import React from 'react'
import { useState} from 'react';
import { useSignInWithEmailAndPassword } from "react-firebase-hooks/auth";
import { auth } from "../services/firebaseConfig";
import { useNavigate } from "react-router-dom";
import "./styles/Login.css"

const Login = () => {

    const [name, setName] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();
    
    const [signInWithEmailAndPassword, user, error] =
    useSignInWithEmailAndPassword(auth);

    function handleSignIn(e) {
        e.preventDefault();
        signInWithEmailAndPassword(name, password);
    }

    if (user) {
        navigate("/:userId");
    }


    return (
        <div className='square'>
            <div className='top-bar'>
                <h1>Login</h1>
            </div>

            <form className="formulario" onSubmit={handleSignIn}>
                <div className='text-bar'>
                    <h3>Nome de Usuário</h3>
                    <input type='text' className="nome"
                    onChange={(e) => setName(e.target.value)}/>
                </div>

                <div className='text-bar'>
                    <h3>Senha</h3>
                    <input type='text' className="pass"
                    onChange={(e) => setPassword(e.target.value)}/>
                </div>

                <input type="submit" className="submit" value={"Entrar"} />

                <div className="toRegister">
                    <p>Ou caso não tenha uma conta,</p>
                    <a href='/create-user'>Registre-se</a>
                </div>
            </form>
        </div>
    )
}

export default Login