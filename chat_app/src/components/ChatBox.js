import React, { useState, useRef, useEffect } from 'react';
import "./styles/ChatBox.css";
import { useParams } from 'react-router-dom';
import { IoSend } from "react-icons/io5";
import Message from "./Message";
import Dropdown from "./Dropdown";
import { LineWave } from 'react-loader-spinner';
import { getDatabase } from 'firebase/database'
import { initializeApp } from 'firebase/app';
import { ref, set, onValue, update, get, push } from "firebase/database";
import { database } from "../services/firebaseConfig";
import { decryptAES, encryptAES } from '../services/cryptograph';

// Inicializar o Realtime Database
const ChatBox = () => {
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([]);
    const [currentChat, setCurrentChat] = useState(null);
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const { userId, chatId } = useParams();
    const replyBarRef = useRef(null);
    const messagesRef = useRef(null);
    const [userStatus, setUserStatus] = useState({});

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
                    }
                });
            } catch (error) {
                console.error('Erro ao buscar usuários:', error);
            }
        };

        const fetchChatAndMessages = async () => {
            if (!chatId) return;

            try {
                const dataRefChat = ref(database, `/chats/${chatId}`);
                const qtde = (await get(ref(database, `/chats/${chatId}`))).val()?.idUsers?.length || 0;
                onValue(dataRefChat, async (snapshot) => {
                    const chatData = snapshot.val();
                    if (chatData) {
                        const participantNames = await Promise.all(
                            chatData.idUsers.map(async (participantId) => {
                                const userRef = ref(database, `/user/${participantId}`);
                                const userSnapshot = await get(userRef);
                                return userSnapshot.exists() ? userSnapshot.val().nome : 'Usuário desconhecido';
                            })
                        );

                        const chatName = chatData.nomeGrupo || participantNames.find(name => name !== users.find(user => user.id === userId)?.nome);


                        setCurrentChat({
                            id: chatId,
                            nome: chatName,
                            idParticipants: participantNames,
                            ownerId: chatData.idUsers[0], // Define o dono como o primeiro usuário
                        });
                    }
                    setIsLoading(false);  // Marcar como carregado após carregar os dados
                });

                const messagesRef = ref(database, `/chats/${chatId}/messages/`);

                const keyAES = await fetchDescrypted()

                onValue(messagesRef, (snapshot) => {
                    const messagesData = snapshot.val();

                    if (messagesData) {
                        const messagesArray = Object.keys(messagesData).map(key => {
                            const message = messagesData[key];
                            const { idUser, idUserRead = [] } = message;

                            // Verifique se `message.message` está definido antes de continuar
                            if (message.message === undefined) {
                                console.warn(`Mensagem ausente para a chave: ${key}`);
                                return null; // Ignora esta mensagem caso esteja indefinida
                            }

                            // Define o status da mensagem
                            const status = idUserRead.length === qtde ? "seen" : "noseen";

                            return {
                                id: key,
                                idUser,
                                message: decryptAES(message.message, keyAES),
                                timestamp: message.timestamp,
                                status: status,
                            };
                        }).filter(Boolean); // Remove valores nulos

                        setMessages(messagesArray);
                    } else {
                        setMessages([]);
                    }

                    setIsLoading(false); // Marcar como carregado após carregar os dados
                });

            } catch (error) {
                console.error('Erro ao buscar chats ou mensagens:', error);
            }
        };

        fetchUsers();
        fetchChatAndMessages();

    }, [chatId, userId]);

    useEffect(() => {
        const fetchUserStatus = (userUid) => {
            const userRef = ref(database, `/user/${userUid}`);
            onValue(userRef, (snapshot) => {
                if (snapshot.exists()) {
                    setUserStatus((prevStatus) => ({
                        ...prevStatus,
                        [userUid]: snapshot.val().status
                    }));
                } else {
                    console.log("Status não encontrado.");
                }
            });
        };

        if (currentChat?.idParticipants) {
            currentChat.idParticipants.forEach((username) => {
                // Encontre o userUid com base no username
                const userUid = users.find(user => user.nome === username)?.id;

                if (userUid) {
                    fetchUserStatus(userUid);

                } else {
                    console.log(`ID não encontrado para o usuário: ${username}`);
                }
            });
        }
    }, [currentChat, users]);

    // GET USERNAMES FROM IDS
    // Função manual para adicionar o userId ao array idUserRead
    const markMessageAsRead = async (messageId) => {
        const messageRef = ref(database, `/chats/${chatId}/messages/${messageId}`);

        // Obtém o snapshot atual da mensagem e atualiza manualmente
        onValue(messageRef, (snapshot) => {
            const messageData = snapshot.val();
            const idUserRead = messageData?.idUserRead || [];

            if (!idUserRead.includes(userId)) {
                update(messageRef, { idUserRead: [...idUserRead, userId] });
            }
        }, { onlyOnce: true }); // Faz a leitura uma vez para evitar loops
    };

    const getUsernamesFromIds = (chatUserIds) => {
        const currentUser = users.find(u => u.id === userId);
        const usernames = chatUserIds.map(name => (name === currentUser.nome ? 'you' : `@${name}`));

        if (usernames.length > 1) {
            return `${usernames.slice(0, -1).join(', ')} e ${usernames[usernames.length - 1]}`;
        }

        return usernames[0] || 'Usuário desconhecido';
    };

    // MESSAGE HANDLERS
    const handleInputChange = (e) => {
        const textarea = e.target;
        setMessage(textarea.value);

        textarea.style.height = 'auto';
        textarea.style.height = `${textarea.scrollHeight}px`;

        if (replyBarRef.current) {
            replyBarRef.current.style.height = `${textarea.scrollHeight}px`;
        }
    };

    const sendMessageToAPI = async (newMessage) => {
        const messagesRef = ref(database, `/chats/${newMessage.idChat}/messages/`);
        newMessage.message = encryptAES(newMessage.message, await fetchDescrypted());
        try {
            await push(messagesRef, newMessage);
            //console.log('Mensagem enviada com sucesso');
        } catch (error) {
            console.error('Erro ao enviar a mensagem:', error);
        }
    };

    const handleSendMessage = async () => {
        if (message.trim()) {
            const newMessage = {
                idChat: chatId,
                idUser: userId,
                message,
                timestamp: new Date().toISOString(),
                idUserRead: [userId],
            };

            // Verifique se todos os campos estão preenchidos corretamente
            if (newMessage.idChat && newMessage.idUser && newMessage.message && newMessage.timestamp) {
                await sendMessageToAPI(newMessage);
                setMessage("");  // Limpa a área de entrada
            } else {
                console.warn("Alguns campos estão indefinidos:", newMessage);
            }
        }


    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && e.ctrlKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const renderChatHeader = () => {
        if (!currentChat) return null;

        const usersArray = Array.isArray(users) ? users : Object.values(users);
        const currentUser = usersArray.find(user => user.id === userId);
        const otherUserName = currentChat.idParticipants.find(name => {
            const user = users.find(u => u.nome === name);
            return user && user.nome !== currentUser?.nome;
        });

        const isOwner = currentUser && currentUser.id === currentChat.ownerId; // Verifica se o usuário atual é o dono do chat

        return (
            <>
                <h1>{currentChat.idParticipants.length === 2 ? `@${otherUserName || 'Usuário desconhecido'}` : currentChat.nome}</h1>
                <h2>
                    {currentChat.idParticipants.length === 2
                        ? 'ㅤ'
                        : getUsernamesFromIds(currentChat.idParticipants)}
                </h2>
            </>
        );
    };

    const fetchDescrypted = async () => {
        const chatRef = ref(database, `/chats/${chatId}/keys/${userId}`);
        try {
            const snapshot = await get(chatRef);

            if (snapshot.exists()) {
                const userKey = snapshot.val(); // Isso obterá o valor diretamente, como "n7DJL"
                const response = await fetch('https://api-itjc4yhhoq-uc.a.run.app/descryptedKeyChat', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ keyId: userId, ciphertext: userKey }), // Passando o ID do usuário
                });

                if (!response.ok) {
                    throw new Error('Erro ao obter a chave AES');
                }

                const data = await response.json();
                console.log("Chave AES descriptografada: ", data.plaintext);
                return data.plaintext;
            } else {
                console.log("Nenhuma chave encontrada para o usuário especificado.");
                return null;
            }
        } catch (error) {
            console.error("Erro ao buscar chave do usuário:", error);
            return null;
        }

    }

    // USADO PARA SEMPRE QUE UMA MENSAGEM FOR ENVIADA, LEVAR O SCROLL PARA BAIXO
    useEffect(() => {
        if (messagesRef.current) {
            messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
        }
    }, [messages]);

    return (
        <div className='chatbox'>
            {!chatId ? (
                <div className='no-messages'>
                    <h2>Nenhuma conversa aberta.</h2>
                    <p>Selecione uma conversa ao lado ou crie uma nova para começar a conversar.</p>
                </div>
            ) : currentChat && messages.length >= 0 && message !== null ? (
                <div className='with-messages'>
                    <div className='top-bar'>
                        <div className='chat-info'>
                            <img className="user-icon" src="/img/user-icon.jpg" alt="User Icon" />
                            {renderChatHeader()}
                        </div>
                        {/* O DONO DO CHAT É O ÚNICO QUE PODE EDITAR A CONVERSA*/}
                        {currentChat.ownerId === userId && (
                            <Dropdown className='chatbox-dropdown' options={[
                                { label: 'Editar Conversa', route: `/${userId}/edit-chat/${chatId}` }
                            ]} />
                        )}
                    </div>

                    <div className='backup-msg'>
                        <h4>As mensagens enviadas e recebidas são salvas automaticamente a cada 30 dias.</h4>
                    </div>
                    <div className='chat-content'>
                        <div className='messages' ref={messagesRef}>
                            {messages.length > 0 ? (
                                messages.map((msg) => {
                                    markMessageAsRead(msg.id)
                                    const user = users.find(u => u.id === msg.idUser);
                                    return (
                                        <Message
                                            key={msg.timestamp}
                                            type={msg.idUser === userId ? 'reply' : 'received'}
                                            content={msg.message}
                                            timestamp={(msg.timestamp).toLocaleString()}
                                            status={msg.status}
                                            username={user ? (msg.idUser === userId ? 'you' : user.nome) : 'Usuário desconhecido'}
                                            status_user={userStatus[msg.idUser] === "online" ? "var(--orange)" : "gray"}
                                        />
                                    );
                                })
                            ) : (
                                <div className='no-messages'>
                                    <p></p>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className='foot-bar'>
                        <div className='reply-bar' ref={replyBarRef}>
                            <textarea
                                value={message}
                                onChange={handleInputChange}
                                onKeyDown={handleKeyDown}
                                placeholder='Escreva aqui sua mensagem.'
                                rows={1}
                            />
                        </div>
                        <IoSend className='menu-icon send' onClick={handleSendMessage} />
                    </div>
                </div>
            ) : (
                <div className='loading'>
                    <LineWave
                        visible={true}
                        height="130"
                        width="130"
                        color="var(--orange)"
                        ariaLabel="line-wave-loading"
                    />
                </div>
            )}
        </div>
    );

};

export default ChatBox;

