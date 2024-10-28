import React from "react";
import { Navigate } from "react-router-dom";
import { useParams } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
    const { userId } = useParams();

    const token = localStorage.getItem(userId);

    return token ? children : <Navigate to="/" />;
};

export default PrivateRoute;
