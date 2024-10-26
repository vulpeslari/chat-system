import React, { useState, useRef, useEffect } from 'react';
import "./styles/ChatBox.css";
import { IoSend } from "react-icons/io5";
import Message from "./Message";
import Dropdown from "./Dropdown";

const ChatBox = () => {
    const [message, setMessage] = useState("");
    const replyBarRef = useRef(null);
    const chatContentRef = useRef(null);

    const handleInputChange = (e) => {
        const textarea = e.target;
        setMessage(textarea.value);

        // AJUSTE DE ALTURA DO TEXTAREA DA REPLY
        textarea.style.height = 'auto'; 
        textarea.style.height = `${textarea.scrollHeight}px`; 

        // AJUSTE DA DIV REPLY-BAR CONFORME O TEXTAREA DA REPLY AUMENTA
        if (replyBarRef.current) {
            replyBarRef.current.style.height = `${textarea.scrollHeight}px`;
        }  
    };

    const options = [
        { label: 'Excluir Grupo', route: '/delete-chat' },
        { label: 'Editar Grupo', route: '/edit-chat' },
    ];

    return (
        <div className='chatbox'>
            <div className='with-messages'>
                <div className='top-bar'>
                    <div className='chat-info'>
                        <img className="user-icon" src="/img/user-icon.jpg" />
                        <h1>group name</h1>
                        <h2>group people</h2>
                    </div>
                    <Dropdown options={options} className='chatbox-dropdown'/>
                </div>
                <div className='chat-content' ref={chatContentRef}>
                    <div className='backup-msg'>
                        <h4>O backup automático está ativado. Suas mensagens serão salvas a cada 30 dias. Para desativar o backup automático, clique <a>aqui</a>.
                        </h4>
                    </div>
                    <div className='messages'>
                        <Message type="message"/>
                        <Message type="message"/>
                        <Message type="reply"/>
                        <Message type="message"/>
                    </div>
                </div>
                <div className='foot-bar'>
                    <div className='reply-bar' ref={replyBarRef}>
                        <textarea 
                          value={message} 
                          onChange={handleInputChange}
                          placeholder='Escreva aqui sua mensagem.' 
                          rows={1}
                        />
                    </div>
                    <IoSend className='menu-icon send' />
                </div>
            </div>
        </div>
    );
};

export default ChatBox;
