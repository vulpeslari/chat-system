import React, { useState, useEffect } from 'react';
import { useCreateUserWithEmailAndPassword } from "react-firebase-hooks/auth";
import { useNavigate } from "react-router-dom"; // Importa o useNavigate
import { auth } from "../services/firebaseConfig";
import { ref, update } from "firebase/database";
import { database } from '../services/firebaseConfig';
import "./styles/LoginAndRegister.css";

const CreateUser = () => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [pass, setPass] = useState("");
    const [createUserWithEmailAndPassword, user, error] = useCreateUserWithEmailAndPassword(auth);
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate(); // Instancia o hook useNavigate

    const handleRegister = async (e) => {
        e.preventDefault();
        await createUserWithEmailAndPassword(email, pass);
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
             // Função para criar a chave do usuário
                const createUserKey = async () => {
                    try {
                        const response = await fetch('https://api-itjc4yhhoq-uc.a.run.app/createKeyUser', {
                            method: 'POST', // Método POST
                            headers: {
                                'Content-Type': 'application/json', // Definindo o tipo de conteúdo
                            },
                            body: JSON.stringify(bodyKeyCreate), // Convertendo o corpo para JSON
                        });

                        if (!response.ok) {
                            throw new Error('Erro ao criar a chave do usuário');
                        }

                        const result = await response.json(); // Pega a resposta em JSON

                        console.log("Chave do usuário criada com sucesso:", result);
                        navigate("/"); // Redireciona para a rota principal após salvar
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
                    <h3>Nome de Usuário</h3>
                    <input type='text' className="nome" onChange={(e) => setName(e.target.value)} />
                </div>

                <div className='text-bar'>
                    <h3>Endereço de e-mail</h3>
                    <input type='text' className="email" onChange={(e) => setEmail(e.target.value)} />
                </div>

                <div className='text-bar'>
                    <h3>Senha</h3>
                    <input type={showPassword ? 'text' : 'password'} onChange={(e) => setPass(e.target.value)} />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)} // Alterna o estado
                        className="password"
                    >
                        {showPassword ? "Ocultar senha" : "Mostrar senha"}
                    </button>
                </div>

                <input type="submit" className="submit" value="Cadastrar" />
            </form>
        </div>
    );
};

export default CreateUser;
