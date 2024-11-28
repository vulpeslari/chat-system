import React, { useState, useEffect, useContext } from 'react';
import { useSignInWithEmailAndPassword } from "react-firebase-hooks/auth";
import { auth } from "../services/firebaseConfig";
import { useNavigate } from "react-router-dom";
import DOMPurify from 'dompurify'; // Importa DOMPurify
import "./styles/LoginAndRegister.css";
import { database, ref, update } from '../services/firebaseConfig';
import { AppContext } from '../AppContext';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { SendVerificationEmail } from '../services/SendVerificationEmail';
import { rotationChat, verifyExpiration } from '../services/rotationKeys';
import ReCAPTCHA from "react-google-recaptcha";

const Login = () => {
    const { setUserUid } = useContext(AppContext);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [awaitingVerification, setAwaitingVerification] = useState(false);
    const [recaptchaToken, setRecaptchaToken] = useState("");
    const navigate = useNavigate();

    const [signInWithEmailAndPassword, user, loading, error] = useSignInWithEmailAndPassword(auth);

    const loginError = (message) => toast.error(message, { theme: "dark", autoClose: 2000 });
    const loginAlert = (message) => toast.error(message, { theme: "dark", autoClose: 2000 });

    useEffect(() => {
        if (user) {
            setAwaitingVerification(true);
        }
    }, [user]);

    useEffect(() => {
        if (error) {
            loginError("Erro ao fazer login. Verifique suas credenciais.");
        }
    }, [error]);

    // Função para sanitizar entradas
    const sanitizeInput = (input) => DOMPurify.sanitize(input);

    const handleSignIn = (e) => {
        e.preventDefault();
        if (!recaptchaToken) {
            loginAlert("Por favor, complete o reCAPTCHA.");
            return;
        }

        const userSession = localStorage.getItem('userSession');
        if (!userSession) {
            loginAlert('Por favor, faça o cadastro antes de fazer login.');
        } else if (userSession !== email) {
            loginAlert('O usuário não fez o cadastro no mesmo navegador.');
        } else {
            // Sanitiza os valores antes de usá-los
            const sanitizedEmail = sanitizeInput(email);
            const sanitizedPassword = sanitizeInput(password);

            signInWithEmailAndPassword(sanitizedEmail, sanitizedPassword);
        }
    };

    const handleVerificationSuccess = () => {
        const tokenExpiration = Date.now() + 24 * 60 * 60 * 1000; // 1 dia em milissegundos
        localStorage.setItem(user.user.uid, JSON.stringify({
            token: user.user.accessToken,
            expiration: tokenExpiration
        }));

        const userRf = ref(database, `/user/${user.user.uid}`);
        const status = { status: "online" };

        rotationChat(user.user.uid);
        update(userRf, status)
            .then(() => {
                setUserUid(user.user.uid);
                //console.log("User UID:", user?.user?.uid);
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
                                onChange={(e) => setEmail(sanitizeInput(e.target.value))} // Sanitiza em tempo real
                                required
                            />
                        </div>
                        <div className='text-bar'>
                            <h3 className='required'>Senha</h3>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                className="pass"
                                onChange={(e) => setPassword(sanitizeInput(e.target.value))} // Sanitiza em tempo real
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
                        <div className="recaptcha-container">
                            <ReCAPTCHA
                                sitekey="6LcmzYwqAAAAAPfqBx_RF52DSlcEtrxo5XA9OwwF"
                                onChange={(token) => setRecaptchaToken(token)}
                                onExpired={() => setRecaptchaToken("")}
                            />
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
