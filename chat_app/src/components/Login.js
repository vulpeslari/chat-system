import React, { useState, useEffect, useContext } from 'react';
import { useSignInWithEmailAndPassword } from "react-firebase-hooks/auth";
import { auth } from "../services/firebaseConfig";
import { useNavigate } from "react-router-dom";
import "./styles/LoginAndRegister.css";
import { database, ref, update } from '../services/firebaseConfig';
import { AppContext } from '../AppContext';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { SendVerificationEmail } from '../services/SendVerificationEmail';
import { rotationChat, verifyExpiration } from '../services/rotationKeys';

const Login = () => {
    const { setUserUid } = useContext(AppContext);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [awaitingVerification, setAwaitingVerification] = useState(false); // Controla se está aguardando a verificação do código
    const navigate = useNavigate();

    const [signInWithEmailAndPassword, user, loading, error] = useSignInWithEmailAndPassword(auth);

    const loginError = (message) => toast.error(message, { theme: "dark", autoClose: 2000 });

    useEffect(() => {
        if (user) {
            setAwaitingVerification(true); // Troca para etapa de verificação
        }
    }, [user]);

    useEffect(() => {
        if (error) {
            loginError("Erro ao fazer login. Verifique suas credenciais.");
        }
    }, [error]);

    const handleSignIn = (e) => {
        e.preventDefault();
        signInWithEmailAndPassword(email, password);
    };

    const handleVerificationSuccess = () => {
        const tokenExpiration = Date.now() + 24 * 60 * 60 * 1000; // 1 dia em milissegundos
        localStorage.setItem(user.user.uid, JSON.stringify({
            token: user.user.accessToken,
            expiration: tokenExpiration
        }));

        const userRf = ref(database, `/user/${user.user.uid}`);
        const status = { status: "online" };


        rotationChat(user.user.uid)
        update(userRf, status)
            .then(() => {
                setUserUid(user.user.uid);
                console.log("User UID:", user?.user?.uid);
                navigate(`/${user.user.uid}`);
            })
            .catch((error) => {
                console.error("Erro ao atualizar o status:", error);
                loginError("Erro ao atualizar o status do usuário.");
            });
    };

    return (
        <div className='square'>
            {!awaitingVerification ? (
                <>
                    <div className='top-bar'>
                        <h1>Login</h1>
                    </div>
                    <form className="formulario" onSubmit={handleSignIn}>
                        <div className='text-bar'>
                            <h3 className='required'>Endereço de Email</h3>
                            <input
                                type='email'
                                className="nome"
                                onChange={(e) => setEmail(e.target.value)}
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
                </>
            ) : (
                <>
                    <div className='top-bar'>
                        <h1>Login</h1>
                    </div>
                    <SendVerificationEmail
                        email={email}
                        onVerification={handleVerificationSuccess}
                    />
                </>
            )}
            <ToastContainer />
        </div>
    );
};

export default Login;
