import React, { useState, useEffect } from 'react';
import './styles/ChatMenu.css';
import { Link, useParams, useLocation } from 'react-router-dom';
import { BiSolidMessageAdd } from "react-icons/bi";
import { IoSearch } from "react-icons/io5";
import Chat from "./Chat";
import { LineWave } from 'react-loader-spinner';

const ChatMenu = () => {
    const { userId } = useParams();
    const location = useLocation();
    const [searchTerm, setSearchTerm] = useState("");
    const [chats, setChats] = useState([]);
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Função para buscar usuários e conversas
    const fetchUsersAndChats = async () => {
        try {
            const [usersResponse, chatsResponse] = await Promise.all([
                fetch('https://api-itjc4yhhoq-uc.a.run.app/getAllUsers'),
                fetch(`https://api-itjc4yhhoq-uc.a.run.app/getAllChats?idUser=${userId}`)
            ]);

            const usersData = await usersResponse.json();
            const chatsData = await chatsResponse.json();

            setUsers(usersData);
            setChats(chatsData);
        } catch (error) {
            console.error('Erro ao buscar usuários e conversas:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUsersAndChats();
    }, [userId]);

    // Função para mapear IDs para nomes de usuários
    const getUserNamesFromIds = (idParticipants) => {
        return idParticipants.map(name => {
            const currentUser = users.find(u => u.id === userId);
            if (currentUser.nome === name) return 'you';
            const user = users.find(u => u.nome === name);
            return user ? user.nome : "Usuário desconhecido";
        });
    };

    // Função para formatar os nomes dos participantes de um grupo
    const formatUsernames = (idParticipants) => {
        const usernames = getUserNamesFromIds(idParticipants);

        if (usernames.length === 2) return "";
        const lastUser = usernames.pop();
        return `${usernames.join(', @')} e @${lastUser}`;
    };

    // Função para obter o nome do chat (grupo ou privado)
    const getGroupName = (chat) => {
        const ids = chat.idParticipants.map(name => {
            const user = users.find(u => u.nome === name);
            return user ? user.id : null;
        }).filter(Boolean);

        if (ids.length === 2) {
            const otherUserId = ids.find(id => id !== userId);
            const otherUser = users.find(u => u.id === otherUserId);
            return otherUser ? `@${otherUser.nome}` : "Usuário desconhecido";
        }

        return chat.nome || "Usuário desconhecido";
    };

    // Filtro de conversas baseado no termo de busca
    const filteredChats = chats.filter(chat => {
        const usernamesInChat = chat.idParticipants.map(name => {
            const user = users.find(u => u.nome === name);
            return user ? user.nome.toLowerCase() : '';
        });
        return usernamesInChat.some(nome => nome.includes(searchTerm.toLowerCase()));
    });

    return (
        <div className='chatmenu'>
            <div className='top-bar'>
                <h1>Chats</h1>
                <Link to={`/${userId}/add-chat`}>
                    <BiSolidMessageAdd className={`menu-icon add ${location.pathname === `/${userId}/add-chat` ? 'active' : ''}`} />
                </Link>
            </div>
            <div className='search-bar'>
                <label htmlFor='search'>
                    <IoSearch className='menu-icon search' />
                </label>
                <input
                    type='text'
                    id='search'
                    placeholder='Pesquisar conversas por usuários'
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <div className='user-list'>
                {isLoading ? (
                    <div className='loading'>
                        <LineWave
                            visible={true}
                            height="130"
                            width="130"
                            color="var(--orange)"
                            ariaLabel="line-wave-loading"
                        />
                    </div>
                ) : (
                    filteredChats.map(chat => (
                        <Link key={chat.id} to={`/${userId}/chat/${chat.id}`}>
                            <Chat chatName={getGroupName(chat)} chatUsers={formatUsernames(chat.idParticipants)} />
                        </Link>
                    ))
                )}
            </div>
        </div>
    );
};

export default ChatMenu;
