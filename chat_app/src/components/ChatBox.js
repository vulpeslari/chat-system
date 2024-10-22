import React, { useState, useRef, useEffect } from 'react';
import "./styles/ChatBox.css";
import { useParams } from 'react-router-dom';
import { IoSend } from "react-icons/io5";
import Message from "./Message";
import Dropdown from "./Dropdown";
import { LineWave } from 'react-loader-spinner';

const ChatBox = () => {
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([]);
    const [currentChat, setCurrentChat] = useState(null);
    const replyBarRef = useRef(null);
    const chatContentRef = useRef(null);
    const { userId, chatId } = useParams();
    const [users, setUsers] = useState([]);

    // FETCH USERS DATA
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await fetch('https://api-itjc4yhhoq-uc.a.run.app/getAllUsers');
                const usersData = await response.json();
                setUsers(usersData);
            } catch (error) {
                console.error('Erro ao buscar usuários:', error);
            }
        };

        fetchUsers();
    }, []);

    // FETCH CHAT AND MESSAGES
    useEffect(() => {
        const fetchChatAndMessages = async () => {
            if (!chatId) return;

            try {
                const chatsResponse = await fetch(`https://api-itjc4yhhoq-uc.a.run.app/getAllChats?idUser=${userId}`);
                const chatsData = await chatsResponse.json();
                const chat = chatsData.find(c => c.id === chatId);
                setCurrentChat(chat || null);

                const messagesResponse = await fetch(`https://api-itjc4yhhoq-uc.a.run.app/getAllMessages?idChat=${chatId}`);
                if (messagesResponse.ok) {
                    const messagesData = await messagesResponse.json();
                    setMessages(Array.isArray(messagesData) ? messagesData : []);
                } else {
                    setMessages([]);
                }
            } catch (error) {
                console.error('Erro ao buscar chats ou mensagens:', error);
            }
        };

        fetchChatAndMessages();
    }, [chatId, userId]);

    // GET USERNAMES FROM IDS
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
        try {
            const response = await fetch('https://api-itjc4yhhoq-uc.a.run.app/sendMessage', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newMessage),
            });

            if (!response.ok) {
                throw new Error('Erro ao enviar a mensagem');
            }

            return await response.text();
        } catch (error) {
            console.error('Erro ao enviar mensagem:', error);
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

            await sendMessageToAPI(newMessage);
            setMessages(prevMessages => [...prevMessages, { ...newMessage, status: 'unseen' }]);
            setMessage("");
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

        const currentUser = users.find(user => user.id === userId);
        const otherUserName = currentChat.idParticipants.find(name => {
            const user = users.find(u => u.nome === name);
            return user && user.nome !== currentUser?.nome;
        });

        return (
            <>
                <h1>{currentChat.idParticipants.length === 2 ? `@${otherUserName || 'Usuário desconhecido'}` : currentChat.nome}</h1>
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
            ) : currentChat ? (
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
                            {messages.length > 0 ? (
                                messages.map((msg) => {
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
