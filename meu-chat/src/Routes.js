import React from "react";
import { Route, BrowserRouter, Routes as RouterRoutes } from "react-router-dom";

import RotBar from "./components/RotBar";
import ChatMenu from "./components/ChatMenu";
import ChatBox from "./components/ChatBox";
import AddChat from "./components/AddChat"
import AddUser from "./components/AddUser"

const Routes = () => {
    return (
        <BrowserRouter>
            <RouterRoutes>
                <Route path="/" element={<>
                    <div className="home-container">
                        <RotBar  />
                        <ChatMenu />
                        <ChatBox />
                    </div>
                </>
                } />
                <Route path="/add-chat" element={<>
                    <div className="home-container">
                        <AddChat />
                        <RotBar  />
                        <ChatMenu />
                        <ChatBox />
                    </div>
                </>
                } />
                <Route path="/add-user" element={<>
                    <div className="home-container">
                        <AddUser />
                        <RotBar  />
                        <ChatMenu />
                        <ChatBox />
                    </div>
                </>
                } />
            </RouterRoutes>
        </BrowserRouter>
    );
};

export default Routes;
