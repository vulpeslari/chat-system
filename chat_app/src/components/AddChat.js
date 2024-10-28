import React, { useState, useEffect } from 'react';
import './styles/AddUserAndChat.css';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { IoCloseSharp, IoSearch } from "react-icons/io5";
import { FaPen } from "react-icons/fa";
import UserSelect from './UserSelect';
import { LineWave } from 'react-loader-spinner';
import { ref, set, onValue, update, push, get } from "firebase/database"; // Adicione get para buscar dados
import { database } from '../services/firebaseConfig';

const AddChat = () => {
    const { userId, chatId } = useParams();
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [nomeGrupo, setNomeGrupo] = useState('');
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isGroupChat, setIsGroupChat] = useState(false);

    useEffect(() => {
        setIsGroupChat(selectedUsers.length > 1);
    }, [selectedUsers]);

    // Busca os usuários disponíveis
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

    // Busca os dados do chat se chatId estiver presente
    useEffect(() => {
        const fetchChatData = async () => {
            if (chatId) {
                const chatRef = ref(database, `chats/${chatId}`);
                const snapshot = await get(chatRef);
                if (snapshot.exists()) {
                    const chatData = snapshot.val();
                    setNomeGrupo(chatData.nomeGrupo || '');
                    setSelectedUsers(chatData.idUsers.filter(id => id !== userId)); // Filtra o userId do dono do chat
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
            alert('Por favor, preencha o nome do grupo.');
            return;
        }

        const chatRef = ref(database, "chats/");
        const payload = isGroupChat
            ? { nomeGrupo, idUsers: [userId, ...selectedUsers] }
            : { idUsers: [userId, selectedUsers[0]] };

        payload.keys = {};
        const keysChat = await fetchAESKey(payload.idUsers);
        let i = 0;
        for (const id of payload.idUsers) {
            payload.keys[id] = keysChat[i];
            i++;
        }

        try {
            if (chatId) {
                await update(ref(database, `chats/${chatId}`), payload);
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

    // Função para excluir o chat
    const handleDeleteChat = async () => {
        if (!chatId) return;

        try {
            const response = await fetch(`https://api-itjc4yhhoq-uc.a.run.app/deleteChat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ chatId }), // Envia o chatId no corpo da requisição
            });

            if (response.ok) {
                console.log('Chat excluído com sucesso');
                navigate(`/${userId}`); // Redireciona para a rota do usuário após a exclusão
            } else {
                console.error('Erro ao excluir o chat:', await response.json());
            }
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
                                <h2>Foto do Chat</h2>
                                <div className='chat-photo-container'>
                                    <label htmlFor='chat-photo'>
                                        <img className="chat-icon" src="/img/user-icon.jpg" alt="chat icon" />
                                    </label>
                                    <input id='chat-photo' type='file' />
                                </div>
                                <h2>Nome do Grupo</h2>
                                <div className='chat-name-container'>
                                    <input
                                        id='chat-name'
                                        type='text'
                                        placeholder='Dê um nome ao grupo'
                                        value={nomeGrupo}
                                        onChange={(e) => setNomeGrupo(e.target.value)}
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
                                        contactStatus="online"
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
        </div>
    );
};

export default AddChat;
