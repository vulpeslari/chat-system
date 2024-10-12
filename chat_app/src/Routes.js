import React from "react";
import { Route, BrowserRouter, Routes as RouterRoutes } from "react-router-dom";

import RotBar from "./components/RotBar";
import ChatMenu from "./components/ChatMenu";
import ChatBox from "./components/ChatBox";

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
            </RouterRoutes>
        </BrowserRouter>
    );
};

export default Routes;
