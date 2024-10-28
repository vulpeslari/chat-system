import React from 'react';
import "./styles/NotFound.css";
import { useNavigate, useParams } from "react-router-dom";

const NotFound = () => {
    const navigate = useNavigate();
    const { userId } = useParams();

    console.log(userId);

    const voltar = () => {
        navigate(`/${userId}`);
    };

    return (
        <div className='not-found'>
            <h1>404!</h1>
            <p>A página procurada pode ter sido editada, deletada ou não existe.</p>
            <button onClick={voltar}>Voltar para Home</button>
        </div>
    );
}

export default NotFound;
