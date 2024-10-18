import React, { useState, useRef, useEffect } from 'react';
import "./styles/ChatBox.css";
import { useParams } from 'react-router-dom';
import { IoSend } from "react-icons/io5";
import Message from "./Message";
import Dropdown from "./Dropdown";
import { LineWave } from 'react-loader-spinner';

import chatsData from './../pseudobd/chats.json';
import usersData from './../pseudobd/users.json';
import messagesData from './../pseudobd/messages.json';

const ChatBox = () => {
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([]);
    const [currentChat, setCurrentChat] = useState(null);
    const replyBarRef = useRef(null);
    const chatContentRef = useRef(null);
    const { userId, chatId } = useParams();
    const [users, setUsers] = useState(usersData);

    {/* CHAT FETCH */ }
    useEffect(() => {
        if (chatId) {
            const chat = chatsData.find(c => c.id === chatId);
            setCurrentChat(chat);
        }
    }, [chatId]);

    {/* MESSAGES FETCH */ }
    useEffect(() => {
        if (chatId) {
            const chatMessages = messagesData.filter(msg => msg.chatId === chatId);
            setMessages(chatMessages);
        }
    }, [chatId]);

    {/* USERS FETCH */ }
    const getUsernamesFromIds = (chatUserIds) => {
        const usernames = chatUserIds.map(id => {
            if (id === userId) {
                return 'you';
            }
            const user = users.find(u => u.userId === id);
            return user ? " @" + user.username : id;
        });

        if (usernames.length > 1) {
            return `${usernames.slice(0, -1).join(', ')} e ${usernames[usernames.length - 1]}`;
        }

        return usernames[0];
    };

    {/* MESSAGE HANDLERS */ }
    const handleInputChange = (e) => {
        const textarea = e.target;
        setMessage(textarea.value);

        textarea.style.height = 'auto';
        textarea.style.height = `${textarea.scrollHeight}px`;

        if (replyBarRef.current) {
            replyBarRef.current.style.height = `${textarea.scrollHeight}px`;
        }
    };

    {/* SEND MESSAGE */ }
    const handleSendMessage = () => {
        if (message.trim() !== "") {
            const newMessage = {
                messageId: Math.random().toString(36).substr(2, 9),
                chatId,
                userId: userId,
                content: message,
                timestamp: new Date().toISOString(),
                status: 'unseen' // TODA MENSAGEM COMEÇA SEM SER VISTA 
            }; 

            const updatedMessages = [...messagesData, newMessage];
            const updatedData = JSON.stringify(updatedMessages, null, 2);
            const blob = new Blob([updatedData], { type: 'application/json' });
            const url = URL.createObjectURL(blob);

            const a = document.createElement('a');
            a.href = url;
            a.download = 'messages.json';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);

            setMessages([...messages, newMessage]);
            setMessage("");
        }
    };

    {/* SEND MESSAGE WITH CTRL + ENTER */ }
    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && e.ctrlKey) {
            e.preventDefault();
            handleSendMessage();
        }
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
                            <h1>{currentChat.chatName}</h1>
                            <h2>{getUsernamesFromIds(currentChat.chatUsers)}</h2>
                        </div>
                        <Dropdown className='chatbox-dropdown' options={[
                            { label: 'Excluir Grupo', route: `/${userId}/delete-chat/${chatId}` },
                            { label: 'Editar Grupo', route: `/${userId}/edit-chat/${chatId}` }
                        ]} />
                    </div>
                    <div className='chat-content' ref={chatContentRef}>
                        <div className='messages'>
                            {messages.map((msg, index) => {
                                const user = users.find(u => u.userId === msg.userId);
                                return (
                                    <Message
                                        key={msg.messageId}
                                        type={msg.userId === userId ? 'reply' : 'received'}
                                        content={msg.content}
                                        timestamp={msg.timestamp}
                                        status={msg.status}
                                        username={user.username}
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
                        wrapperStyle={{}}
                        wrapperClass=""
                        firstLineColor=""
                        middleLineColor=""
                        lastLineColor=""
                    />
                </div>
            )}
        </div>
    );
};

export default ChatBox;
