import React from "react";
import { Navigate } from "react-router-dom";
import { useParams } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
    const { userId } = useParams();

    const storedData = JSON.parse(localStorage.getItem(userId));

    // Verifica se o token existe e se não expirou
    if (storedData && storedData.token && storedData.expiration > Date.now()) {
        return children;
    }

    // Se o token não existe ou expirou, redireciona para o login
    return <Navigate to="/" />;
};

export default PrivateRoute;
