import React, { useState, useEffect } from 'react';
import './styles/AddUserAndChat.css';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { IoCloseSharp, IoSearch } from "react-icons/io5";
import { FaPen } from "react-icons/fa";
import UserSelect from './UserSelect';
import { LineWave } from 'react-loader-spinner';
import { ref, set, onValue, update, push, get, remove} from "firebase/database";
import { database } from '../services/firebaseConfig';

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AddChat = () => {
    const { userId, chatId } = useParams();
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [nomeGrupo, setNomeGrupo] = useState('');
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isGroupChat, setIsGroupChat] = useState(false);

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

    useEffect(() => {
        setIsGroupChat(selectedUsers.length > 1);
    }, [selectedUsers]);

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
                })
            } catch (error) {
                console.error('Erro ao buscar usuários:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchUsers();
    }, []);

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

    const filteredUsers = users
        .filter(user => user.id !== userId)
        .filter(user => user.nome.toLowerCase().includes(searchTerm.toLowerCase()));

    const handleUserSelect = (userId) => {
        setSelectedUsers(prevSelectedUsers =>
            prevSelectedUsers.includes(userId)
                ? prevSelectedUsers.filter(id => id !== userId)
                : [...prevSelectedUsers, userId]
        );
    };

    const handleSubmit = async () => {
        if (isGroupChat && nomeGrupo.trim() === '') {
            chatError('Dê um nome para o grupo!');
            return;
        }

        const chatRef = ref(database, "chats/");
        const payload = isGroupChat
            ? { nomeGrupo, idUsers: [userId, ...selectedUsers] }
            : { idUsers: [userId, selectedUsers[0]] };

        payload.keys = {};
        payload.timestamp = {};
        const keysChat = await fetchAESKey(payload.idUsers);
        let i = 0;

        for (const id of payload.idUsers) {
            payload.keys[id] = keysChat[i];
            i++;
        }

        try {
            // Se o chat for um chat entre dois usuários (não um grupo)
            if (!isGroupChat && selectedUsers.length === 1) {
                // Verifica se já existe um chat entre esses dois usuários
                const existingChat = await checkExistingChat([userId, selectedUsers[0]]);
                if (existingChat) {
                    chatError('Já existe um chat entre esses usuários.');
                    return;
                }
            }

            if (chatId) {
                await update(ref(database, `chats/${chatId}`), payload);
                await remove(ref(database, `chats/${chatId}/messages`));
                console.log('Chat atualizado:', payload);
            } else {

                const newChatRef = await push(chatRef, payload);
                console.log('ID do novo chat:', newChatRef.key);
            }
            navigate(`/${userId}`);
        } catch (error) {
            console.error('Erro ao criar/atualizar chat:', error);
        }
    };

    // Função para verificar se já existe um chat entre dois usuários
    const checkExistingChat = async (userIds) => {
        const chatsRef = ref(database, "chats/");
        const snapshot = await get(chatsRef);

        if (snapshot.exists()) {
            const chats = snapshot.val();
            // Itera por cada chat no banco de dados
            for (const chatId in chats) {
                const chat = chats[chatId];
                const chatUsers = chat.idUsers;

                // Verifica se os dois usuários estão no chat (sem se importar com a ordem)
                if (chatUsers.length === userIds.length && userIds.every(userId => chatUsers.includes(userId))) {
                    return true; // Já existe um chat entre esses usuários
                }
            }
        }
        return false; // Não existe um chat entre os usuários
    };

    const handleDeleteChat = async () => {
    if (!chatId) return;

    try {
        await remove(ref(database, `chats/${chatId}/`))
        console.log('Chat excluído com sucesso');
        navigate(`/${userId}`);
    } catch (error) {
        console.error('Erro ao fazer requisição de exclusão:', error);
    }
    };

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
                    {chatId ? 'Salvar alterações' : 'Criar chat '}
                </button>
                {chatId && (
                    <button className='button delete' onClick={handleDeleteChat}>
                        Excluir Chat
                    </button>
                )}
            </div>
            <ToastContainer />
        </div>
    );
};

export default AddChat;
