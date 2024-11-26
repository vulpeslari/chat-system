import React, { useState, useEffect } from "react";
import { Route, BrowserRouter, Routes as RouterRoutes } from "react-router-dom";

import RotBar from "./components/RotBar";
import ChatMenu from "./components/ChatMenu";
import ChatBox from "./components/ChatBox";
import AddChat from "./components/AddChat";
import CreateUser from "./components/CreateUser";
import Login from "./components/Login";
import User from "./components/User";

import PrivateRoute from "./services/PrivateRoute"; // ROTAS PRIVADAS APENAS PODEM SER ACESSADAS ENQUANTO O TOKEN ESTIVER ATIVO
import NotFound from "./components/NotFound";

const Routes = () => {
    return (
        <BrowserRouter>
            <RouterRoutes>
                {/* HOME */}
                <Route path={`/:userId`} element={<>
                    <PrivateRoute>
                        <div className="home-container">
                            <RotBar />
                            <ChatMenu />
                            <ChatBox />
                        </div>
                    </PrivateRoute>
                </>} />

                {/* REGISTER */}
                <Route path={`/create-user`} element={<>
                    <div className="home-container">
                        <CreateUser />
                    </div>
                </>} />

                {/* LOGIN */}
                <Route path={`/`} element={<>
                    <div className="home-container">
                        <Login />
                    </div>
                </>} />

                {/* CHAT */}
                <Route path={`/:userId/chat/:chatId`} element={<>
                    <PrivateRoute>
                        <div className="home-container">
                            <RotBar />
                            <ChatMenu />
                            <ChatBox />
                        </div>
                    </PrivateRoute>
                </>} />

                {/* ADD CHAT */}
                <Route path={`/:userId/add-chat`} element={<>
                    <PrivateRoute>
                        <div className="home-container">
                            <AddChat />
                            <RotBar />
                            <ChatMenu />
                            <ChatBox />
                        </div>
                    </PrivateRoute>
                </>} />

                {/* EDIT CHAT */}
                <Route path={`/:userId/edit-chat/:chatId`} element={<>
                <PrivateRoute>
                    <div className="home-container">
                        <AddChat />
                        <RotBar />
                        <ChatMenu />
                        <ChatBox />
                    </div>
                </PrivateRoute>
            </>} />

                {/* USER INFO */}
                <Route path={`/:userId/user`} element={<>
                    <PrivateRoute>
                        <div className="home-container">
                            <RotBar />
                            <User />
                        </div>
                    </PrivateRoute>
                </>} />

                {/* NOT FOUND */}
                <Route path="/:userId/*" element={
                    <PrivateRoute>
                        <NotFound />
                    </PrivateRoute>
                } />

            </RouterRoutes>
        </BrowserRouter>
    );
};

export default Routes;


