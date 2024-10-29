import React, { useState, useEffect } from 'react';
import './styles/ChatMenu.css';
import { Link, useParams, useLocation } from 'react-router-dom';
import { BiSolidMessageAdd } from "react-icons/bi";
import { IoSearch } from "react-icons/io5";
import Chat from "./Chat";
import { LineWave } from 'react-loader-spinner';
import { ref, set, onValue, update, get } from "firebase/database";
import { database } from '../services/firebaseConfig';

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
            const dataRefUser = ref(database, "/user/");

            onValue(dataRefUser, (snapshot) => {
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

            const dataRefChat = ref(database, "/chats/"); // Referência à tabela de chats
            onValue(dataRefChat, async (snapshot) => {
                const chatsData = snapshot.val();
                if (chatsData) {
                    const chats = await Promise.all(Object.keys(chatsData).map(async (chatId) => {
                        const chat = chatsData[chatId];

                        // Verifica se o userId está na lista de idUsers do chat
                        if (chat.idUsers.includes(userId)) {
                            // Buscar nomes dos usuários em idUsers
                            const participantNames = await Promise.all(chat.idUsers.map(async (participantId) => {
                                const userRef = ref(database, `/user/${participantId}`);
                                const userSnapshot = await get(userRef);
                                const userData = userSnapshot.val();
                                return userData ? userData.nome : 'Usuário desconhecido';
                            }));

                            // Determina o nome do chat
                            const chatName = chat.nomeGrupo
                                ? chat.nomeGrupo
                                : participantNames.find(name => name !== users.find(user => user.id === userId)?.nome);

                                const dataRefMessages = ref(database, `/chats/${chatId}/messages`);
                                let mensagensSemUsuario = 0;
                                onValue(dataRefMessages, (snapshot) => {
                                    const messagesData = snapshot.val();
                                    if (messagesData) {
                                        Object.keys(messagesData).forEach((messageId) => {
                                            const mensagem = messagesData[messageId];

                                            // Verifica se o `userId` não está no array `ids`
                                            if (!mensagem.idUserRead.includes(userId)) {
                                                mensagensSemUsuario++;
                                            }
                                        });

                                        console.log(`Quantidade de mensagens do chat ${chatId} sem o usuário ${userId}:`, mensagensSemUsuario);
                                    }
                                });
                            // Estrutura do objeto de retorno
                            return {
                                id: chatId,
                                nome: chatName,
                                idParticipants: participantNames ,// Nomes dos participantes
                                messagesNotRead: mensagensSemUsuario,
                            };
                        }
                        return null; // Retorna null se o userId não estiver no chat
                    }));

                    // Filtrar chats nulos (ou seja, chats que não têm o userId)
                    const filteredData = chats.filter(chat => chat != null);

                    setChats(filteredData);
                } else {
                    console.log("Nenhum dado encontrado.");
                }
            });

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
            // Converta `users` para um array, se necessário
            const usersArray = Array.isArray(users) ? users : Object.values(users);
            // Encontre o usuário atual
            const currentUser = usersArray.find(u => u.id === userId);
            if (currentUser && currentUser.nome === name) return 'you';

            const user = usersArray.find(u => u.nome === name);
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
                            <Chat chatName={getGroupName(chat)} chatUsers={formatUsernames(chat.idParticipants)} status={chat.messagesNotRead > 0 ? true : false} />
                        </Link>
                    ))
                )}
            </div>
        </div>
    );
};

export default ChatMenu;
