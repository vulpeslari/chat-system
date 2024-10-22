import React, { useState, useEffect } from "react";
import { Route, BrowserRouter, Routes as RouterRoutes } from "react-router-dom";

import RotBar from "./components/RotBar";
import ChatMenu from "./components/ChatMenu";
import ChatBox from "./components/ChatBox";
import AddChat from "./components/AddChat";

const Routes = () => {
    return (
        <BrowserRouter>
            <RouterRoutes>
                {/* CREATE USER */}
                <Route path={"/create-user"} element={<>
                    <div className="home-container">
                        <CreateUser />
                    </div>
                </>} />

                {/* HOME */}
                <Route path={`/:userId`} element={<>
                    <div className="home-container">
                        <RotBar />
                        <ChatMenu />
                        <ChatBox />
                    </div>
                </>} />

                {/* CHAT */}
                <Route path={`/:userId/chat/:chatId`} element={<>
                    <div className="home-container">
                        <RotBar />
                        <ChatMenu />
                        <ChatBox />
                    </div>
                </>} />

                {/* ADD CHAT */}
                <Route path={`/:userId/add-chat`} element={<>
                    <div className="home-container">
                        <AddChat />
                        <RotBar />
                        <ChatMenu />
                        <ChatBox />
                    </div>
                </>} />

                {/* EDIT CHAT */}
                <Route path={`/:userId/edit-chat/:chatId`} element={<>
                    <div className="home-container">
                        <AddChat />
                        <RotBar />
                        <ChatMenu />
                        <ChatBox />
                    </div>
                </>} />

            </RouterRoutes>
        </BrowserRouter>
    );
};

export default Routes;


