'use client';

import { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import { getUser } from '@/lib/auth';

interface DashboardLayoutProps {
    children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        // Set sidebar state based on screen size
        const handleResize = () => {
            if (window.innerWidth < 768) {
                setSidebarOpen(false);
            } else {
                setSidebarOpen(true);
            }
        };

        // Initial check
        handleResize();

        // Get user info
        setUser(getUser());

        // Add resize listener
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <div className="dashboard-container">
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <div className={`dashboard-main ${sidebarOpen ? 'sidebar-open' : ''}`}>
                {/* Header with burger menu */}
                <header className="dashboard-header">
                    <button
                        className="burger-menu"
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        aria-label="Toggle menu"
                    >
                        <span></span>
                        <span></span>
                        <span></span>
                    </button>

                    <div className="dashboard-user">
                        <span className="user-name">{user?.name || user?.email}</span>
                    </div>
                </header>

                {/* Main content */}
                <main className="dashboard-content">
                    {children}
                </main>
            </div>
        </div>
    );
}
