import React, { useState, useEffect } from 'react';
import './styles/AddUserAndChat.css';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { IoCloseSharp, IoSearch } from "react-icons/io5";
import { FaPen } from "react-icons/fa";
import { IoIosAdd } from "react-icons/io";
import UserSelect from './UserSelect';
import { LineWave } from 'react-loader-spinner';

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

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await fetch('https://api-itjc4yhhoq-uc.a.run.app/getAllUsers');
                const data = await response.json();
                setUsers(data);
            } catch (error) {
                console.error('Erro ao buscar usuários:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchUsers();
    }, []);

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
        const url = chatId 
            ? 'https://api-itjc4yhhoq-uc.a.run.app/updateChat' // DEPOIS TEM QUE ADAPTAR QUANDO TIVER A ROTA COMPLETA
            : isGroupChat
                ? 'https://api-itjc4yhhoq-uc.a.run.app/createChatGroup'
                : 'https://api-itjc4yhhoq-uc.a.run.app/createChat';
        
        if (isGroupChat && nomeGrupo.trim() === '') {
            alert('Por favor, preencha o nome do grupo.');
            return;
        }

        const payload = isGroupChat
            ? { nomeGrupo, idUsers: [userId, ...selectedUsers] }
            : { idUsers: [userId, selectedUsers[0]] };

        try {
            const response = await fetch(url, {
                method: chatId ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await response.json();
            console.log(chatId ? 'Chat atualizado:' : isGroupChat ? 'Chat em grupo criado:' : 'Chat individual criado:', data);
            navigate(`/${userId}`);
        } catch (error) {
            console.error('Erro ao criar/atualizar chat:', error);
        }
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
                    {chatId ? 'Salvar alterações' : 'Criar chat'} <IoIosAdd className='button-icon' />
                </button>
            </div>
        </div>
    );
};

export default AddChat;
