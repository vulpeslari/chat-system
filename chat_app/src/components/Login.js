import React, { useState, useEffect } from 'react';
import { useSignInWithEmailAndPassword } from "react-firebase-hooks/auth";
import { auth } from "../services/firebaseConfig";
import { useNavigate } from "react-router-dom";
import "./styles/LoginAndRegister.css";

const Login = () => {
    const [name, setName] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false); 
    const navigate = useNavigate();
    
    const [signInWithEmailAndPassword, user, error] = useSignInWithEmailAndPassword(auth);

    // Efeito para redirecionar após login
    useEffect(() => {
        if (user) {
            localStorage.setItem(user.user.uid, user.user.accessToken); // TOKEN DE AUTENTICAÇÃO
            navigate(`/${user.user.uid}`);
        }
    }, [user, navigate]);

    function handleSignIn(e) {
        e.preventDefault();
        signInWithEmailAndPassword(name, password);
    }
    
    return (
        <div className='square'>
            <div className='top-bar'>
                <h1>Login</h1>
            </div>

            <form className="formulario" onSubmit={handleSignIn}>
                <div className='text-bar'>
                    <h3>Endereço de Email</h3>
                    <input 
                        type='text' 
                        className="nome"
                        onChange={(e) => setName(e.target.value)}
                    />
                </div>

                <div className='text-bar'>
                    <h3>Senha</h3>
                    <input
                        type={showPassword ? 'text' : 'password'} // Alterna entre texto e senha
                        className="pass"
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <button 
                        type="button" 
                        onClick={() => setShowPassword(!showPassword)} // Alterna o estado
                        className="password"
                    >
                        {showPassword ? "Ocultar senha" : "Mostrar senha"}
                    </button>
                </div>

                <input type="submit" className="submit" value={"Entrar"} />

                <div className="toRegister">
                    <p>Ou caso não tenha uma conta,</p>
                    <a href='/create-user'>Registre-se</a>
                </div>
            </form>
        </div>
    );
}

export default Login;
