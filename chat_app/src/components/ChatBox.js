import React, { useState, useRef, useEffect } from 'react';
import "./styles/ChatBox.css";
import { useParams } from 'react-router-dom';
import { IoSend } from "react-icons/io5";
import Message from "./Message";
import Dropdown from "./Dropdown";
import { LineWave } from 'react-loader-spinner';
import{ getDatabase} from 'firebase/database'
import { initializeApp } from 'firebase/app';
import { ref, set, onValue , update, get, push} from "firebase/database";
import { database } from "C:/Users/pluto/Downloads/my-app/src/services/firebaseConfig.js";




// Inicializar o Realtime Database


const ChatBox = () => {
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([]);
    const [currentChat, setCurrentChat] = useState(null);
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const { userId, chatId } = useParams();
    const replyBarRef = useRef(null);
    const chatContentRef = useRef(null);

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
                        });
                    }
                    setIsLoading(false);  // Marcar como carregado após carregar os dados
                });

                const messagesRef = ref(database, `/chats/${chatId}/messages/`);
                onValue(messagesRef, (snapshot) => {
                    const messagesData = snapshot.val();
                    if (messagesData) {
                        const messagesArray = Object.keys(messagesData).map(key => ({
                            idUser: messagesData[key].idUser,
                            message: messagesData[key].message,
                            timestamp: messagesData[key].timestamp
                        }));
                        setMessages(messagesArray);
                    }
                });
            } catch (error) {
                console.error('Erro ao buscar chats ou mensagens:', error);
            }
        };

        fetchUsers();
        fetchChatAndMessages();
    }, [chatId, userId]);

    // GET USERNAMES FROM IDS
    const getUsernamesFromIds = (chatUserIds) => {
        console.log(users)
        const currentUser = users.find(u => u.id === userId);
        console.log(currentUser)
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

    const checkForDuplicateMessage = async (newMessage) => {
        const messagesRef = ref(database, `/chat/${newMessage.idChat}/messages/`);
        const snapshot = await get(messagesRef);
        
        const existingMessages = snapshot.val() || {}; // Captura como objeto

        // Converte o objeto em array
        const messagesArray = Object.values(existingMessages);
        
        // Verificar se a mensagem já existe
        const isDuplicate = messagesArray.some(msg => 
            msg.message === newMessage.message && 
            msg.idUser === newMessage.idUser &&
            msg.timestamp === newMessage.timestamp // ou outra lógica para determinar duplicação
        );
    
        return isDuplicate;
    };

    const sendMessageToAPI = async (newMessage) => {
        

    
        const messagesRef = ref(database, `/chats/${newMessage.idChat}/messages/`);
    
        try {
            await push(messagesRef, newMessage);
            console.log('Mensagem enviada com sucesso');
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
            };
    
            // Envia a mensagem ao Firebase sem atualizar o estado `messages` localmente
            await sendMessageToAPI(newMessage);
            setMessage("");  // Limpa a área de entrada
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
        console.log(currentChat.idParticipants)
        const otherUserName = currentChat.idParticipants.find(name => {
            const user = users.find(u => u.nome === name);
            return user && user.nome !== currentUser?.nome;
        });

        return (
            <>
                <h1>{currentChat.idParticipants.length === 2 ? `@${otherUserName || 'Usuário desconhecido'}` :currentChat.nome}</h1>
                <h2>{currentChat.idParticipants.length === 2 ? 'ㅤ' : getUsernamesFromIds(currentChat.idParticipants)}</h2>
            </>
        );
    };

    return (
        <div className='chatbox'>
            {!chatId ? (
                <div className='no-messages'>
                    <h2>Nenhuma conversa aberta.</h2>
                    <p>Selecione uma conversa ao lado ou crie uma nova para começar a conversar.</p>
                </div>
            ) : currentChat && messages.length > 0 && message !== null ? ( // Condição extra para garantir que não sejam nulos ou vazios
                <div className='with-messages'>
                    <div className='top-bar'>
                        <div className='chat-info'>
                            <img className="user-icon" src="/img/user-icon.jpg" alt="User Icon" />
                            {renderChatHeader()}
                        </div>
                        <Dropdown className='chatbox-dropdown' options={[
                            { label: 'Excluir Grupo', route: `/${userId}/delete-chat/${chatId}` },
                            { label: 'Editar Grupo', route: `/${userId}/edit-chat/${chatId}` }
                        ]} />
                    </div>
    
                    <div className='backup-msg'>
                        <h4>As mensagens enviadas e recebidas são salvas automaticamente a cada 30 dias.</h4>
                    </div>
                    <div className='chat-content' ref={chatContentRef}>
                        <div className='messages'>
                            {messages.map((msg) => {
                                const user = users.find(u => u.id === msg.idUser);
                                return (
                                    <Message
                                        key={msg.timestamp}
                                        type={msg.idUser === userId ? 'reply' : 'received'}
                                        content={msg.message}
                                        timestamp={(msg.timestamp).toLocaleString()}
                                        status={msg.status}
                                        username={user ? (msg.idUser === userId ? 'you' : user.nome) : 'Usuário desconhecido'}
                                    />
                                );
                            })}
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
