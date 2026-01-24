import React from 'react';
import { NavLink } from 'react-router-dom';
import {
    Squares2X2Icon,
    PlusCircleIcon,
    BriefcaseIcon,
    EnvelopeIcon,
    Cog6ToothIcon
} from '@heroicons/react/24/outline'; // v2 imports

const navigation = [
    { name: 'Dashboard', href: '/', icon: Squares2X2Icon },
    { name: 'Add Job', href: '/add', icon: PlusCircleIcon },
    { name: 'My Jobs', href: '/jobs', icon: BriefcaseIcon },
    { name: 'Email Sync', href: '/email-sync', icon: EnvelopeIcon },
    { name: 'Settings', href: '/settings', icon: Cog6ToothIcon },
];

const Sidebar = () => {
    return (
        <div className="w-64 h-screen bg-surface backdrop-blur-xl border-r border-surfaceHighlight fixed left-0 top-0 flex flex-col">
            <div className="p-6">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    JobTrackr
                </h1>
            </div>

            <nav className="flex-1 px-4 space-y-2">
                {navigation.map((item) => (
                    <NavLink
                        key={item.name}
                        to={item.href}
                        className={({ isActive }) => `
                            flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
                            ${isActive
                                ? 'bg-primary/20 text-white border border-primary/20'
                                : 'text-gray-400 hover:bg-white/5 hover:text-white'}
                        `}
                    >
                        <item.icon className="w-6 h-6" />
                        <span className="font-medium">{item.name}</span>
                    </NavLink>
                ))}
            </nav>

            <div className="p-6 border-t border-surfaceHighlight">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-accent p-[2px]">
                        <div className="w-full h-full rounded-full bg-background flex items-center justify-center">
                            <span className="font-bold text-sm">US</span>
                        </div>
                    </div>
                    <div>
                        <p className="font-medium text-white">User Name</p>
                        <p className="text-xs text-gray-500">user@example.com</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
