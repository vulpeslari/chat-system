import React, { useState, useEffect } from 'react';
import './styles/AddUserAndChat.css';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { IoCloseSharp, IoSearch } from "react-icons/io5";
import { FaPen } from "react-icons/fa";
import UserSelect from './UserSelect';
import { LineWave } from 'react-loader-spinner';
import { ref, set, onValue, update, push, get, remove } from "firebase/database";
import { database } from '../services/firebaseConfig';
import { generateAES, encryptAES, decryptAES } from '../services/cryptograph';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { decryptRSA, getPrivateKey, encryptRSA, getPulicKey } from '../services/crypto-utils';

import DOMPurify from 'dompurify'; 

const EXPIRED_TIME = 1 * 1 * 60 * 1000;

// Componente para adicionar um novo chat
const AddChat = () => {
    const { userId, chatId } = useParams();
    const navigate = useNavigate();

    // Estados para gerenciar dados e interface
    const [searchTerm, setSearchTerm] = useState('');
    const [nomeGrupo, setNomeGrupo] = useState('');
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isGroupChat, setIsGroupChat] = useState(false);

    const chatDel = (message) => toast.info(message, {
        position: "top-left",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        progress: undefined,
        theme: "dark"
    });

    // Função para exibir erro via toast
    const chatError = (message) => toast.error(message, {
        position: "top-left",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        progress: undefined,
        theme: "dark"
    });

    // Define se o chat é de grupo, baseado na quantidade de usuários selecionados
    useEffect(() => {
        setIsGroupChat(selectedUsers.length > 1);
    }, [selectedUsers]);

    // Efeito para buscar dados do chat caso já exista
    useEffect(() => {
        const fetchChatData = async () => {
            if (chatId) { // Verifica se é um chat para edição
                const chatRef = ref(database, `chats/${chatId}`);
                const snapshot = await get(chatRef);
                if (snapshot.exists()) {
                    const chatData = snapshot.val();
                    setNomeGrupo(chatData.nomeGrupo || ''); // Nome do grupo (caso exista)
                    setSelectedUsers(chatData.idUsers.filter(id => id !== userId)); // Exclui o usuário atual
                } else {
                    console.log("Chat não encontrado");
                }
            }
        };
        fetchChatData();
    }, [chatId, userId]);

    // Efeito para buscar usuários do banco de dados Firebase
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const dataRef = ref(database, "/user/");
                onValue(dataRef, (snapshot) => {
                    const usersData = snapshot.val();
                    if (usersData) {
                        const filteredData = Object.keys(usersData).map((id) => ({
                            id,
                            nome: usersData[id].nome,
                        }));
                        setUsers(filteredData);
                    } else {
                        console.log("Nenhum dado encontrado.");
                    }
                });
            } catch (error) {
                console.error('Erro ao buscar usuários:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchUsers();
    }, []);

    // Filtra usuários com base na pesquisa e exclui o usuário atual
    const filteredUsers = users
        .filter(user => user && user.id !== userId) // Exclui o usuário atual
        .filter(user => user.nome && user.nome.toLowerCase().includes(searchTerm.toLowerCase())); // Garante que `nome` exista

    // Alterna a seleção de um usuário para o chat
    const handleUserSelect = (userId) => {
        setSelectedUsers(prevSelectedUsers =>
            prevSelectedUsers.includes(userId)
                ? prevSelectedUsers.filter(id => id !== userId)
                : [...prevSelectedUsers, userId]
        );
    };
    useEffect(() => {
        const fetchChatData = async () => {
            if (chatId) {
                const chatRef = ref(database, `chats/${chatId}`);
                const snapshot = await get(chatRef);
                if (snapshot.exists()) {
                    const chatData = snapshot.val();
                    setNomeGrupo(chatData.nomeGrupo || '');
                    setSelectedUsers(chatData.idUsers.filter(id => id !== userId));
                } else {
                    console.log("Chat não encontrado");
                }
            }
        };
        fetchChatData();
    }, [chatId, userId]);

    const handleDeleteChat = async () => {
        if (!chatId) return;

        try {
            await remove(ref(database, `chats/${chatId}/`))
            await remove(ref(database, `sdk/${chatId}/`))
            console.log('Chat excluído com sucesso');
            navigate(`/${userId}`);
        } catch (error) {
            console.error('Erro ao fazer requisição de exclusão:', error);
        }
    };

// Função para sanitizar strings
const sanitizeInput = (input) => {
    return DOMPurify.sanitize(input.trim());
};

const handleSubmit = async () => {
    const sanitizedNomeGrupo = sanitizeInput(nomeGrupo);
    if (isGroupChat && sanitizedNomeGrupo === '') {
        chatError('Dê um nome para o grupo!');
        return;
    }

    const sanitizedUsers = selectedUsers.map(user => sanitizeInput(user));
    const payload = isGroupChat
        ? { nomeGrupo: sanitizedNomeGrupo, idUsers: [sanitizeInput(userId), ...sanitizedUsers] }
        : { idUsers: [sanitizeInput(userId), sanitizeInput(selectedUsers[0])] };

    try {
        // Verifica se o chat entre dois usuários já existe (não é um grupo)
        if (!isGroupChat && sanitizedUsers.length === 1) {
            const existingChat = await checkExistingChat([sanitizeInput(userId), sanitizeInput(selectedUsers[0])]);
            if (existingChat) {
                chatError('Já existe um chat entre esses usuários.');
                return;
            }
        }

        const chatRef = ref(database, "chats/");
        // Verifica se já existe um chat de grupo com o mesmo nome e usuários
        if (isGroupChat) {
            const existingGroupChat = await checkExistingGroupChat(sanitizedNomeGrupo, [sanitizeInput(userId), ...sanitizedUsers]);
            if (existingGroupChat) {
                chatError('Já existe um chat de grupo com essas pessoas e o mesmo nome.');
                return;
            }
        }

        // Se for um chat existente, atualiza-o; caso contrário, cria um novo
        if (chatId) {
            await update(ref(database, `chats/${chatId}`), payload);
            await updateChatKeys(chatId, payload.idUsers)
            console.log('Chat atualizado:', payload);
        } else {
            const newChatRef = await push(chatRef, payload);
            console.log('ID do novo chat:', newChatRef.key);

            // Gera a chave AES e define a referência para o SDK
            const chatId = newChatRef.key;
            const keyAES = generateAES();
            const keyRef = ref(database, `sdk/${chatId}/key`);
            console.log("chave aes gerada para o chat:", keyAES);

            // Criptografa e salva as chaves
            const encryptedKeys = {
                version: 1,
                expirationTimestamp: Date.now() + EXPIRED_TIME,
                used: false,
            };

            for (const idUser of payload.idUsers) {
                try {
                    const chatKeyRef = ref(database, `user/${idUser}/public_key`);
                    const snapshot = await get(chatKeyRef);

                    if (snapshot.exists()) {
                        const publicKey = snapshot.val();
                        const encryptedKey = await encryptRSA(publicKey, keyAES);
                        encryptedKeys[idUser] = encryptedKey;
                    } else {
                        console.warn(`Chave pública não encontrada para o usuário: ${idUser}`);
                    }
                } catch (error) {
                    console.error(`Erro ao processar a chave pública do usuário ${idUser}:`, error);
                }
            }
            console.log(encryptedKeys);

            await set(keyRef, encryptedKeys);
        }

        navigate(`/${sanitizeInput(userId)}`);
    } catch (error) {
        console.error('Erro ao criar/atualizar chat:', error);
    }
};

    const updateChatKeys = async (chatId, idUsers) => {
        console.log(idUsers)
        const dataRef = ref(database, `sdk/${chatId}/key/`)
        const snapshot = await get(dataRef);
        const key = snapshot.val()
        const version = key.version

        const dataVersionsRef = ref(database, `sdk/${chatId}/versions`)
        const snapshotVersions = await get(dataVersionsRef)
        const versions = snapshotVersions.val()
        if (versions) {
            for (const version of Object.keys(versions)) {

                const versionKeyRef = ref(database, `sdk/${chatId}/versions/${version}`)
                const snapshotV = await get(versionKeyRef)
                const versionKey = snapshotV.val()
                const keyVersion = {}

                for (const idUser of Object.keys(versionKey)) {
                    if (idUser !== "expirationTimestamp" && idUser !== "version" && idUser != "used" && idUsers.includes(idUser)) {
                        keyVersion[idUser] = versionKey[idUser]
                    }
                }

                await set(versionKeyRef, keyVersion)

            }
        }

        if (key.used) {
            const versionSaveKey = ref(database, `sdk/${chatId}/versions/${version}/`)
            // Objeto para armazenar as chaves criptografadas
            const encryptedKeys = {};
            console.log(key)
            for (const idUser of Object.keys(key)) {
                if (idUser !== "expirationTimestamp" && idUser !== "version" && idUser !== "used" && idUsers.includes(idUser)) {
                    encryptedKeys[idUser] = key[idUser];
                }
            }

            await set(versionSaveKey, encryptedKeys)
        }

        const newKey = generateAES();
        const encryptedKeys = {
            version: version + 1,
            used: false,
        };

        for (const id of idUsers) {
            const publickey = await getPulicKey(id)
            encryptedKeys[id] = await encryptRSA(publickey, newKey)
        }

        await set(dataRef, encryptedKeys)

    }

    // Verifica se já existe um chat entre dois usuários
    const checkExistingChat = async (userIds) => {
        const chatsRef = ref(database, "chats/");
        const snapshot = await get(chatsRef);

        if (snapshot.exists()) {
            const chats = snapshot.val();
            // Itera por cada chat no banco de dados
            for (const chatId in chats) {
                const chat = chats[chatId];
                const chatUsers = chat.idUsers;

                // Verifica se os dois usuários estão no chat (independente da ordem)
                if (chatUsers.length === userIds.length && userIds.every(userId => chatUsers.includes(userId))) {
                    return true; // Já existe um chat entre esses usuários
                }
            }
        }
        return false; // Não existe um chat entre os usuários
    };

    // Verifica se já existe um grupo de mesmo nome entre mais de dois usuários
    const checkExistingGroupChat = async (groupName, userIds) => {
        const chatsRef = ref(database, "chats/");
        const snapshot = await get(chatsRef);

        if (snapshot.exists()) {
            const chats = snapshot.val();
            // Itera por cada chat no banco de dados
            for (const chatId in chats) {
                const chat = chats[chatId];
                const chatUsers = chat.idUsers;

                // Verifica se os usuários são os mesmos e se o nome do grupo é igual
                if (chat.nomeGrupo === groupName && chatUsers.length === userIds.length && userIds.every(userId => chatUsers.includes(userId))) {
                    return true; // Já existe um chat de grupo com esses usuários e nome
                }
            }
        }
        return false; // Não existe um chat de grupo com o nome e usuários especificados
    };

    // Função para obter chave AES para cada usuário do chat
    const fetchAESKey = async (userId) => {
        const response = await fetch('https://api-itjc4yhhoq-uc.a.run.app/createKeyChat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ idUsers: userId }),
        });

        if (!response.ok) {
            throw new Error('Erro ao obter a chave AES');
        }

        const data = await response.json();
        console.log('Chave AES Criptografada:', data.encryptedAESKey);
        return data.encryptedAESKey;
    };

    // Renderização da interface
    return (
        <div className='pop-up'>
            <div className='top-bar'>
                <h1>{chatId ? 'Editar conversa' : 'Nova conversa'}</h1>
                <Link to={`/${userId}`}>
                    <IoCloseSharp className='menu-icon' />
                </Link>
            </div>
            <div className='search-bar'>
                <label htmlFor='search'>
                    <IoSearch className='menu-icon search' />
                </label>
                <input
                    type='text'
                    id='search'
                    placeholder='Pesquisar usuários'
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <div className='add-container'>
                {isLoading ? (
                    <LineWave visible={true} height="130" width="130" color="var(--orange)" ariaLabel="line-wave-loading" />
                ) : (
                    <>
                        {isGroupChat && (
                            <div className='chat-info'>
                                <h2 className='required'>Nome do Grupo</h2>
                                <div className='chat-name-container'>
                                    <input
                                        id='chat-name'
                                        type='text'
                                        placeholder='Dê um nome ao grupo'
                                        value={nomeGrupo}
                                        onChange={(e) => setNomeGrupo(e.target.value)}
                                        required
                                    />
                                    <label htmlFor='chat-name'>
                                        <FaPen className='menu-icon' />
                                    </label>
                                </div>
                            </div>
                        )}
                        <div className='users-select'>
                            <h2>Membros do Chat</h2>
                            <div className='users-select-list'>
                                {filteredUsers.map((user, index) => (
                                    <UserSelect
                                        key={index}
                                        contactName={user.nome}
                                        isSelected={selectedUsers.includes(user.id)}
                                        onSelect={() => handleUserSelect(user.id)}
                                    />
                                ))}
                            </div>
                        </div>
                    </>
                )}
            </div>
            <div className='footer'>
                <button className='button' onClick={handleSubmit}>
                    {chatId ? 'Salvar alterações' : 'Criar chat'}
                </button>
            </div>
            <ToastContainer />
        </div>
    );
};

export default AddChat;
