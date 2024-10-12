import React from 'react';
import "./styles/ChatBox.css"
import { IoSend } from "react-icons/io5";
import { SlOptionsVertical } from "react-icons/sl";

import Message from "./Message"

const ChatBox = () => {
    return (
        <div className='chatbox'>
            {/*<div className='no-messages'>
                <h2>
                    Você ainda não tem conversas.
                </h2>
                <h3>
                    Adicione um contato e crie um chat para começar a conversar.
                </h3>
            </div>*/}
            <div className='with-messages'>
                <div className='top-bar'>
                    <div className='chat-info'>
                        <img className="user-icon" src="/img/user-icon.jpg" />
                        <h1>group name</h1>
                        <h2>group people</h2>
                    </div>
                    <SlOptionsVertical className='bar-icon user-options' />
                </div>
                <div className='chat-content'>
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
                    <div className='reply-bar'>
                        <input type='text' placeholder='Escreva aqui sua mensagem'>
                        </input>
                    </div>
                    <IoSend className='menu-icon send' />
                </div>
            </div>
        </div>
    )
}

export default ChatBox

