import React, { useState } from 'react';
import "./styles/AddUserAndChat.css";
import UserOption from "./UserOption";
import { Link, useParams } from 'react-router-dom';
import { IoSearch } from "react-icons/io5";
import { IoCloseSharp } from "react-icons/io5";

import usersData from './../pseudobd/users.json';
import contactsData from './../pseudobd/contacts.json';

const AddUser = () => {
    const { userId } = useParams();
    const [users, setUsers] = useState(usersData);
    const [contacts, setContacts] = useState(contactsData);
    const [searchTerm, setSearchTerm] = useState("");

    {/* GET USER OPTIONS */ }
    const getUserOptions = () => {
        return users
            .filter(user => user.userId !== userId)
            .filter(user => user.username.toLowerCase().includes(searchTerm.toLowerCase()))
            .map(user => {
                const isContact = contacts.some(contact => contact.contactId === user.userId);
                return { userId: user.userId, userName: user.username, initialStatus: isContact };
            });
    };

    const updateContactStatus = (contactUserId, status) => {
        const newContacts = status
            ? [...contacts, { contactId: contactUserId, userId: userId }]
            : contacts.filter(contact => contact.contactId !== contactUserId);

        setContacts(newContacts);

        {/* UPDATE JSON */ }
        const updatedData = JSON.stringify(newContacts, null, 2);
        const blob = new Blob([updatedData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        {/* DOWNLOAD JSON */ }
        {/* eh apenas de exemplo pra eu poder ver as alteracoes, o react n consegue baixar e substituir a droga do .json sozinho
            aparentemente. quando tiver a api, eu readapto pras rotas certinho. pra teste, vai servir por enquanto. */}
        const a = document.createElement('a');
        a.href = url;
        a.download = 'contacts.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        console.log("Novo JSON de contatos:", updatedData);
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    return (
        <div className='pop-up'>
            <div className='top-bar'>
                <h1>Adicionar Contato</h1>
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
                    placeholder='Pesquisar usuários'
                    value={searchTerm}
                    onChange={handleSearchChange}
                />
            </div>
            <div className='users-options'>
                <div className='users-options-list'>
                    {getUserOptions().map((option, index) => (
                        <UserOption
                            key={index}
                            userName={option.userName}
                            initialStatus={option.initialStatus}
                            onChangeStatus={(status) => updateContactStatus(option.userId, status)}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AddUser;
