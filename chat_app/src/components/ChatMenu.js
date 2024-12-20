import React, { useState, useEffect } from 'react';
import './styles/ChatMenu.css';
import { Link, useParams, useLocation } from 'react-router-dom';
import { BiSolidMessageAdd } from "react-icons/bi";
import { IoSearch } from "react-icons/io5";
import Chat from "./Chat";
import { LineWave } from 'react-loader-spinner';
import { ref, set, onValue, update, get } from "firebase/database";
import { database } from '../services/firebaseConfig';

import DOMPurify from 'dompurify';

const ChatMenu = () => {
    const { userId } = useParams();
    const location = useLocation();
    const [searchTerm, setSearchTerm] = useState("");
    const [chats, setChats] = useState([]);
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Função para sanitizar os inputs
    const sanitizeInput = (input) => {
        return DOMPurify.sanitize(input);
    };

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
                    const chats = await Promise.all(
                        Object.keys(chatsData).map(async (chatId) => {
                            const chat = chatsData[chatId];

                            // Verifica se o userId está na lista de idUsers do chat
                            if (chat.idUsers.includes(userId)) {
                                // Buscar nomes dos usuários em idUsers
                                const participantNames = await Promise.all(
                                    chat.idUsers.map(async (participantId) => {
                                        const userRef = ref(database, `/user/${participantId}`);
                                        const userSnapshot = await get(userRef);
                                        const userData = userSnapshot.val();
                                        return userData ? userData.nome : "Usuário desconhecido";
                                    })
                                );

                                // Determina o nome do chat
                                const chatName = chat.nomeGrupo
                                    ? chat.nomeGrupo
                                    : participantNames.find(
                                        (name) => name !== users.find((user) => user.id === userId)?.nome
                                    );

                                // Referência ao nó de mensagens
                                const dataRefMessages = ref(database, `/chats/${chatId}/messages`);
                                let mensagensSemUsuario = 0;

                                // Obtenha mensagens não lidas associadas ao chatId atual
                                const messagesSnapshot = await get(dataRefMessages);
                                const messagesData = messagesSnapshot.val();

                                if (messagesData) {
                                    for (const messageId of Object.keys(messagesData)) {
                                        const mensagem = messagesData[messageId];
                                        let messageIsToUser = true; // Presume-se que a mensagem seja para o usuário até que se prove o contrário.

                                        console.log("Mensagem:", mensagem);

                                        // Obtenha a chave principal
                                        const dataRef = ref(database, `sdk/${chatId}/key`);
                                        const snapshot = await get(dataRef);

                                        if (snapshot.exists()) {
                                            const key = snapshot.val();
                                            console.log(
                                                "Key da mensagem:",
                                                mensagem.keyVersion,
                                                "Key principal:",
                                                key.version
                                            );

                                            if (mensagem.keyVersion !== key.version) {
                                                // Se a versão da mensagem não for igual à versão da chave principal, busque a versão correspondente.
                                                const versionRef = ref(
                                                    database,
                                                    `sdk/${chatId}/versions/${mensagem.keyVersion}`
                                                );
                                                const versionSnapshot = await get(versionRef);

                                                if (versionSnapshot.exists()) {
                                                    const keyVersion = versionSnapshot.val();
                                                    // console.log("KeyVersion:", keyVersion);

                                                    // Verifica se o `userId` está relacionado a essa chave
                                                    messageIsToUser = Object.keys(keyVersion).some(
                                                        (idUser) =>
                                                            idUser !== "expirationTimestamp" &&
                                                            idUser !== "version" &&
                                                            idUser !== "used" &&
                                                            idUser === userId
                                                    );
                                                    console.log(keyVersion)
                                                    console.log(
                                                        "messageIsToUser após checagem:",
                                                        messageIsToUser
                                                    );
                                                } else {
                                                    console.warn(
                                                        `Versão da chave não encontrada: ${mensagem.keyVersion}`
                                                    );
                                                }
                                            } else {
                                                console.log(
                                                    "Versão da chave é igual, mensagem marcada como não para o usuário."
                                                );
                                                messageIsToUser = true;
                                            }
                                        } else {
                                            console.warn(`Chave não encontrada para chatId: ${chatId}`);
                                        }


                                        // Sempre avalia a inclusão do `userId` na mensagem
                                        if (
                                            !mensagem.idUserRead.includes(userId) &&
                                            messageIsToUser
                                        ) {
                                            mensagensSemUsuario++;
                                            console.log(
                                                `Mensagens não lidas no chat ${chatId}:`,
                                                mensagensSemUsuario
                                            );
                                        }
                                        console.log(chatId, mensagensSemUsuario)
                                    }
                                }

                                // Estrutura do objeto de retorno
                                return {
                                    id: chatId,
                                    nome: chatName,
                                    idParticipants: participantNames, // Nomes dos participantes
                                    messagesNotRead: mensagensSemUsuario,
                                };
                            }
                            return null; // Retorna null se o userId não estiver no chat
                        })
                    );

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
            const usersArray = Array.isArray(users) ? users : Object.values(users);
            const currentUser = usersArray.find(u => u.id === userId);
            if (currentUser && currentUser.nome === name) return 'you';

            const user = usersArray.find(u => u.nome === name);
            return user ? sanitizeInput(user.nome) : "Usuário desconhecido"; // Sanitizando nome
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
            return otherUser ? `@${sanitizeInput(otherUser.nome)}` : "Usuário desconhecido"; // Sanitizando nome
        }

        return sanitizeInput(chat.nome || "Usuário desconhecido"); // Sanitizando nome
    };

    // Filtro de conversas baseado no termo de busca
    const filteredChats = chats.filter(chat => {
        const usernamesInChat = chat.idParticipants.map(name => {
            const user = users.find(u => u.nome === name);
            return user ? user.nome.toLowerCase() : '';
        });

        const sanitizedName = DOMPurify.sanitize(searchTerm);

        return usernamesInChat.some(nome => nome.includes(sanitizedName.toLowerCase()));
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
                            <Chat chatName={getGroupName(chat)}
                                chatUsers={formatUsernames(chat.idParticipants)}
                                status={chat.messagesNotRead > 0 ? true : false}
                                number={chat.messagesNotRead} />
                        </Link>
                    ))
                )}
            </div>
        </div>
    );
};

export default ChatMenu;
