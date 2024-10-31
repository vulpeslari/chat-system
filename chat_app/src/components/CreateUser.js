import React, { useState, useEffect } from 'react';
import { useCreateUserWithEmailAndPassword } from "react-firebase-hooks/auth";
import { useNavigate } from "react-router-dom";
import { auth } from "../services/firebaseConfig";
import { ref, update, get } from "firebase/database";
import { database } from '../services/firebaseConfig';
import "./styles/LoginAndRegister.css";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const CreateUser = () => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [pass, setPass] = useState("");
    const [createUserWithEmailAndPassword, user, error] = useCreateUserWithEmailAndPassword(auth);
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate(); 

    const registerSucess = () => toast.success('Bem-vindo(a)!', {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark"
    });

    const registerError = (message) => toast.warning(message, {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark"
    });

    const handleRegister = async (e) => {
        e.preventDefault();
        
        // Verificar se o nome de usuário já está em uso
        const userRef = ref(database, `user/`);
        get(userRef)
            .then(snapshot => {
                let userExists = false;
                let emailExists = false;

                snapshot.forEach(childSnapshot => {
                    const userData = childSnapshot.val();
                    if (userData.nome === name) {
                        userExists = true; // Nome de usuário já existe
                    } 
                    if (userData.email === email) {
                        emailExists = true; // E-mail já existe
                    }
                });

                if (userExists) {
                    registerError("O usuário " + name + " já está cadastrado!"); 
                } else if (emailExists) {
                    registerError("O e-mail " + email + " já está cadastrado!");
                }
                else if (pass.length < 6){
                    registerError("A senha deve ter no mínimo 6 caracteres.");
                }
                else {
                    createUserWithEmailAndPassword(email, pass);
                }
            })
            .catch(error => {
                console.error("Erro ao verificar o usuário:", error);
                registerError("Erro ao verificar o nome de usuário.");
            });
    };

    useEffect(() => {
        if (user) {
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

            const bodyKeyCreate = {
                idUser: user.user.uid,
            }
            const createUserKey = async () => {
                try {
                    const response = await fetch('https://api-itjc4yhhoq-uc.a.run.app/createKeyUser', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(bodyKeyCreate),
                    });

                    if (!response.ok) {
                        throw new Error('Erro ao criar a chave do usuário');
                    }

                    const result = await response.json();
                    registerSucess();
                    navigate("/");
                } catch (error) {
                    console.error("Erro ao criar a chave do usuário:", error);
                }
            };
            createUserKey();
        }
    }, [user, name, email, pass, navigate]);

    return (
        <div className='square'>
            <div className='top-bar'>
                <h1>Registre-se</h1>
            </div>

            <form className="formulario" onSubmit={handleRegister}>
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
                    <input type={showPassword ? 'text' : 'password'} onChange={(e) => setPass(e.target.value)} />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="password"
                    >
                        {showPassword ? "Ocultar senha" : "Mostrar senha"}
                    </button>
                </div>

                <input type="submit" className="submit" value="Cadastrar" />
            </form>
            <ToastContainer />
        </div>
    );
};

export default CreateUser;
