import React, { useState, useEffect, useContext } from 'react';
import { useSignInWithEmailAndPassword } from "react-firebase-hooks/auth";
import { auth } from "../services/firebaseConfig";
import { useNavigate } from "react-router-dom";
import "./styles/LoginAndRegister.css";
import { database, ref, update } from '../services/firebaseConfig';
import { AppContext } from '../AppContext';

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Login = () => {
    const { userUid, setUserUid } = useContext(AppContext);
    const [name, setName] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const [signInWithEmailAndPassword, user, loading, error] = useSignInWithEmailAndPassword(auth);

    const loginError = (message) => toast.error(message, {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark"
    });

    useEffect(() => {
        if (user) {
            localStorage.setItem(user.user.uid, user.user.accessToken);
            const userRf = ref(database, `/user/${user.user.uid}`);
            const status = { status: "online" };

            update(userRf, status)
                .then(() => {
                    setUserUid(user.user.uid);
                    navigate(`/${user.user.uid}`);
                })
                .catch(error => {
                    console.error("Erro ao atualizar o status:", error);
                    loginError("Erro ao atualizar o status do usuário.");
                });
        }
    }, [user, navigate, setUserUid]);

    useEffect(() => {
        if (error) {
            let errorMessage = "Erro ao fazer login. Dados incorretos ou usuário não cadastrado no sistema.";
            loginError(errorMessage);
        }
    }, [error]);

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
                    <h3 className='required'>Endereço de Email</h3>
                    <input
                        type='email'
                        className="nome"
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                </div>

                <div className='text-bar'>
                    <h3 className='required'>Senha</h3>
                    <input
                        type={showPassword ? 'text' : 'password'}
                        className="pass"
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
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
            <ToastContainer />
        </div>
    );
}

export default Login;
