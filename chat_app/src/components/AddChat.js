import React, { useState, useEffect } from 'react';
import "./styles/AddUserAndChat.css";
import UserSelect from "./UserSelect";
import { Link, useParams, useNavigate } from 'react-router-dom';
import { IoSearch } from "react-icons/io5";
import { IoCloseSharp } from "react-icons/io5";
import { IoIosAdd } from "react-icons/io";
import { FaPen } from "react-icons/fa";

import contactsData from './../pseudobd/contacts.json';
import usersData from './../pseudobd/users.json';
import chatsData from './../pseudobd/chats.json';

const AddChat = () => {
    const { userId, chatId } = useParams(); 
    const navigate = useNavigate();
    const users = usersData;
    const [searchTerm, setSearchTerm] = useState('');
    const [chatName, setChatName] = useState('');
    const [selectedUsers, setSelectedUsers] = useState([]);

    useEffect(() => {
        if (chatId) {
            const chatToEdit = chatsData.find(chat => chat.id === chatId);
            if (chatToEdit) {
                setChatName(chatToEdit.chatName);
                setSelectedUsers(chatToEdit.chatUsers.filter(id => id !== userId));
            }
        }
    }, [chatId, userId]);

    const getUserOptions = () => {
        return contactsData.map(contact => {
            const user = users.find(user => user.userId === contact.contactId);
            return user ? { userId: user.userId, userName: user.username } : null;
        }).filter(option => option !== null);
    };

    const filteredUsers = getUserOptions().filter(option =>
        option.userName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleUserSelect = (userId) => {
        if (selectedUsers.includes(userId)) {
            setSelectedUsers(selectedUsers.filter(id => id !== userId));
        } else {
            setSelectedUsers([...selectedUsers, userId]);
        }
    };

    const generateRandomId = () => Math.random().toString(36).substr(2, 9);

    const createChat = () => {
        console.log('Chat Name:', chatName);
        console.log('Selected Users:', selectedUsers);

        if (chatName.trim() === '' || selectedUsers.length === 0) {
            alert('Por favor, preencha o nome do chat e selecione pelo menos um usuário.');
            return;
        }

        const newChat = {
            id: generateRandomId(),
            chatName,
            chatUsers: [userId, ...selectedUsers]
        };

        const updatedChats = [...chatsData, newChat];
        const updatedData = JSON.stringify(updatedChats, null, 2);
        const blob = new Blob([updatedData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = 'chats.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        console.log('Novo chat criado:', newChat);
        navigate(`/${userId}`);
    };

    const updateChat = () => {
        console.log('Updating Chat:', chatName);
        console.log('Selected Users:', selectedUsers);

        if (chatName.trim() === '' || selectedUsers.length === 0) {
            alert('Por favor, preencha o nome do chat e selecione pelo menos um usuário.');
            return;
        }

        const updatedChats = chatsData.map(chat =>
            chat.id === chatId
                ? { ...chat, chatName, chatUsers: [userId, ...selectedUsers] }
                : chat
        );

        const updatedData = JSON.stringify(updatedChats, null, 2);
        const blob = new Blob([updatedData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = 'chats.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        console.log('Chat atualizado:', chatId);
        navigate(`/${userId}`);
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
                    placeholder='Pesquisar contatos'
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <div className='add-container'>
                <div className='chat-info'>
                    <h2>Foto do Chat</h2>
                    <div className='chat-photo-container'>
                        <label htmlFor='chat-photo'>
                            <img className="chat-icon" src="/img/user-icon.jpg" alt="chat icon" />
                        </label>
                        <input id='chat-photo' type='file'></input>
                    </div>
                    <h2>Nome do Chat</h2>
                    <div className='chat-name-container'>
                        <input
                            id='chat-name'
                            type='text'
                            placeholder='Dê um nome ao grupo'
                            value={chatName}
                            onChange={(e) => setChatName(e.target.value)}
                        />
                        <label htmlFor='chat-name'>
                            <FaPen className='menu-icon' />
                        </label>
                    </div>
                </div>
                <div className='users-select'>
                    <h2>Membros do Chat</h2>
                    <div className='users-select-list'>
                        {filteredUsers.map((option, index) => (
                            <UserSelect
                                key={index}
                                contactName={option.userName}
                                contactStatus={"online"}
                                isSelected={selectedUsers.includes(option.userId)}
                                onSelect={() => handleUserSelect(option.userId)}
                            />
                        ))}
                    </div>
                </div>
            </div>
            <div className='footer'>
                <button className='button' onClick={chatId ? updateChat : createChat}>
                    {chatId ? 'Salvar alterações' : 'Criar chat'} <IoIosAdd className='button-icon' />
                </button>
            </div>
        </div>
    );
}

export default AddChat;
