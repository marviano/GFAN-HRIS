'use client';

import { useRouter } from 'next/navigation';
import { logout, getUser } from '@/lib/auth';
import { AiFillAppstore, AiFillCarryOut } from 'react-icons/ai';
import { BiSolidUserAccount, BiSolidUserBadge } from 'react-icons/bi';
import { MdCheckCircle, MdExitToApp } from 'react-icons/md';
import { useEffect, useState } from 'react';

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
    const router = useRouter();
    const [userEmail, setUserEmail] = useState('');

    useEffect(() => {
        const user = getUser();
        if (user) {
            setUserEmail(user.email);
        }
    }, []);

    const handleLogout = () => {
        logout();
    };

    const menuItems = [
        { name: 'Dashboard', icon: AiFillAppstore, path: '/' },
        { name: 'Users', icon: BiSolidUserBadge, path: '/users' },
        { name: 'Employees', icon: BiSolidUserAccount, path: '/employees' },
        { name: 'Attendance', icon: AiFillCarryOut, path: '/attendance' },
        { name: 'Approvals', icon: MdCheckCircle, path: '/approvals' },
    ];

    return (
        <>
            {/* Overlay for mobile */}
            {isOpen && (
                <div
                    className="sidebar-overlay"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
                <div className="sidebar-header">
                    <div className="sidebar-user-email">{userEmail}</div>
                    <button className="sidebar-close" onClick={onClose}>
                        ✕
                    </button>
                </div>

                <nav className="sidebar-nav">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        return (
                            <button
                                key={item.path}
                                className="sidebar-item"
                                onClick={() => {
                                    router.push(item.path);
                                    if (window.innerWidth < 768) {
                                        onClose();
                                    }
                                }}
                            >
                                <Icon className="sidebar-icon" />
                                <span className="sidebar-text">{item.name}</span>
                            </button>
                        );
                    })}
                </nav>

                <div className="sidebar-footer">
                    <button className="sidebar-logout" onClick={handleLogout}>
                        <MdExitToApp className="sidebar-icon" />
                        <span className="sidebar-text">Logout</span>
                    </button>
                </div>
            </aside>
        </>
    );
}
