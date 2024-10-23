import React from 'react'
import { useState, useEffect } from 'react';
import { useCreateUserWithEmailAndPassword } from "react-firebase-hooks/auth";
import { Link } from "react-router-dom";
import { auth } from "../services/firebaseConfig";
import "./styles/CreateUser.css"

const CreateUser = () => {

    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [pass, setPass] = useState("")

    const [createUserWithEmailAndPassword, user, error] = useCreateUserWithEmailAndPassword(auth);

    const handleRegister = async () => {
        await createUserWithEmailAndPassword(email, pass);
    
        // Criando o objeto body com os campos
        const body = {
          idUser: user.user.uid, //problema aqui
          nome: name,
          email: email,
          senha: pass,
        };
    
        console.log("Dados do formulário:", body);
    
        // Aqui você pode usar o objeto body para enviar a uma API, salvar no banco de dados, etc.
        // Exemplo: enviar o body via fetch:
        await fetch("http://127.0.0.1:5001/chat-cipher/us-central1/api/createUser", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
    };

    useEffect(() => {
        if (user) {
          const uid = user.user.uid; // Pega o UID do usuário
          console.log("UID do usuário:", uid);
          console.log("Nome do usuário:", name); // Pega o nome inserido pelo usuário
        }
    }, [user, name]);
    
    function handleSignOut(e) {
        e.preventDefault();
        handleRegister(); // Chama a função de registrar e criar o body
    }


    return (
        <div className='square'>
            <div className='top-bar'>
                <h1>Regsitre-se</h1>
            </div>

            <div className='photo'>
                <img src="..\..\public\img\user-icon.jpg" alt="Ícone usuário sem rosto"></img>
            </div>

            <form className="formulario" method="POST" onSubmit={handleSignOut}>
                <div className='text-bar'>
                    <h3>Nome de Usuário</h3>
                    <input type='text' className="nome"
                    onChange={(a)=> setName(a.target.value)}/>
                </div>

                <div className='text-bar'>
                    <h3>Endereço de e-mail</h3>
                    <input type='text' className="email"
                    onChange={(a)=> setEmail(a.target.value)}/>
                </div>

                <div className='text-bar'>
                    <h3>Senha</h3>
                    <input type='text' className="pass"
                    onChange={(a)=> setPass(a.target.value)}/>
                </div>

                <input type="submit" className="submit" value={"Cadastrar"} />
            </form>
        </div>
    )
}

export default CreateUser