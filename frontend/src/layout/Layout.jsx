import React from 'react';
import Sidebar from '../components/Sidebar';
import { Outlet } from 'react-router-dom';

const Layout = () => {
    return (
        <div className="min-h-screen bg-background text-white">
            <Sidebar />
            <div className="ml-64 p-8">
                <Outlet />
            </div>
        </div>
    );
};

export default Layout;
