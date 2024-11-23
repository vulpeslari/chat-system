import React, { useState, useEffect } from 'react';
import { useCreateUserWithEmailAndPassword } from "react-firebase-hooks/auth";
import { useNavigate } from "react-router-dom";
import { auth } from "../services/firebaseConfig";
import { ref, update, get } from "firebase/database";
import { database } from '../services/firebaseConfig';
import "./styles/LoginAndRegister.css";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { SendVerificationEmail } from '../services/SendVerificationEmail'; // Importa o componente de envio de email

const CreateUser = () => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [pass, setPass] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showVerification, setShowVerification] = useState(false); // Controla a exibição do componente de verificação
    const [isVerified, setIsVerified] = useState(false); // Controla se o código foi verificado
    const [createUserWithEmailAndPassword, user, error] = useCreateUserWithEmailAndPassword(auth);
    const navigate = useNavigate();

    const registerSucess = () => toast.success('Bem-vindo(a)!', { theme: "dark" });
    const registerError = (message) => toast.warning(message, { theme: "dark" });

    const handleContinue = (e) => {
        e.preventDefault();

        if (name === "" || email === "" || pass === "") {
            registerError("Preencha todos os campos!");
        } else if (pass.length < 6) {
            registerError("A senha deve ter no mínimo 6 caracteres.");
        } else {
            // Exibe o componente de verificação de e-mail
            setShowVerification(true);
        }
    };

    const handleRegister = async () => {
        const userRef = ref(database, `user/`);
        get(userRef)
            .then(snapshot => {
                let userExists = false;
                let emailExists = false;

                snapshot.forEach(childSnapshot => {
                    const userData = childSnapshot.val();
                    if (userData.nome === name) userExists = true;
                    if (userData.email === email) emailExists = true;
                });

                if (userExists) {
                    registerError(`O usuário "${name}" já está cadastrado!`);
                } else if (emailExists) {
                    registerError(`O e-mail "${email}" já está cadastrado!`);
                } else {
                    createUserWithEmailAndPassword(email, pass);
                }
            })
            .catch(error => {
                console.error("Erro ao verificar o usuário:", error);
                registerError("Erro ao verificar o nome de usuário.");
            });
    };

    const handleVerification = () => {
        setIsVerified(true); 
        handleRegister(); 
    };
    
    useEffect(() => {
        if (user && isVerified) { // Apenas registra se a verificação foi concluída
            const body = {
                [`user/${user.user.uid}`]: {
                    nome: name,
                    email: email,
                    senha: pass,
                    status: "online",
                },
            };
            const rootRef = ref(database);
    
            update(rootRef, body)
                .then(() => {
                    console.log("Usuário salvo com sucesso!");
                    navigate("/"); // Redireciona para a rota principal após salvar
                })
                .catch(error => console.error("Erro ao salvar o usuário:", error));
    
            const createUserKey = async () => {
                try {
                    const response = await fetch('https://api-itjc4yhhoq-uc.a.run.app/createKeyUser', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ idUser: user.user.uid }),
                    });
    
                    if (!response.ok) throw new Error('Erro ao criar a chave do usuário');
                    await response.json();
                    registerSucess();
                } catch (error) {
                    console.error("Erro ao criar a chave do usuário:", error);
                }
            };
            createUserKey();
        }
    }, [user, name, email, pass, navigate, isVerified]);
    

    return (
        <div className='square'>
            <div className='top-bar'>
                <h1>Registre-se</h1>
            </div>

            {!showVerification ? (
                <form className="formulario" onSubmit={handleContinue}>
                    <div className='text-bar'>
                        <h3 className='required'>Nome de Usuário</h3>
                        <input type='text' className="nome" onChange={(e) => setName(e.target.value)} required />
                    </div>

                    <div className='text-bar'>
                        <h3 className='required'>Endereço de e-mail</h3>
                        <input type='email' className="email" onChange={(e) => setEmail(e.target.value)} required />
                    </div>

                    <div className='text-bar'>
                        <h3 className='required'>Senha</h3>
                        <input
                            type={showPassword ? 'text' : 'password'}
                            onChange={(e) => setPass(e.target.value)}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="password"
                        >
                            {showPassword ? "Ocultar senha" : "Mostrar senha"}
                        </button>
                    </div>

                    <input type="submit" className="submit" value="Continuar" />
                </form>
            ) : (
                <SendVerificationEmail email={email} onVerification={handleVerification} />
            )}

            <ToastContainer />
        </div>
    );
};

export default CreateUser;
