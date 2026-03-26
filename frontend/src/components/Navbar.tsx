import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import ThemeToggle from './ThemeToggle';
import API_URL from '../config';

interface NavbarProps {
    showSearch?: boolean;
    searchQuery?: string;
    onSearchChange?: (val: string) => void;
    onSearchKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

const Navbar: React.FC<NavbarProps> = ({
    showSearch = false,
    searchQuery = '',
    onSearchChange,
    onSearchKeyDown
}) => {
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('userRole');
    const [unreadCount, setUnreadCount] = useState(0);
    const [notifications, setNotifications] = useState<any[]>([]);
    const [notifOpen, setNotifOpen] = useState(false);
    const notifRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!token) return;
        axios.get(`${API_URL}/api/user/notifications`, {
            headers: { Authorization: `Bearer ${token}` }
        }).then(res => {
            setUnreadCount(res.data.unreadCount);
            setNotifications(res.data.notifications.slice(0, 5));
        }).catch(() => { });
    }, [token]);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
                setNotifOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const handleMarkAllRead = async () => {
        await axios.put(`${API_URL}/api/user/notifications/read-all`, {}, {
            headers: { Authorization: `Bearer ${token}` }
        }).catch(() => { });
        setUnreadCount(0);
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        localStorage.removeItem('username');
        localStorage.removeItem('displayName');
        window.location.reload();
    };

    return (
        <>
            <style>
                {`
                    :root { --logo-filter: invert(11%) sepia(95%) saturate(5411%) hue-rotate(272deg) brightness(88%) contrast(119%); }
                    .dark { --logo-filter: invert(74%) sepia(41%) saturate(579%) hue-rotate(5deg) brightness(91%) contrast(88%); }
                `}
            </style>
            <header className="fixed top-0 w-full z-50 transition-all duration-300 border-b border-light-primary/20 dark:border-primary/20 bg-light-bg/80 dark:bg-black/40 backdrop-blur-xl">
                <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16 sm:h-20">

                        <Link to="/dashboard" className="flex items-center gap-3 cursor-pointer group shrink-0">
                            <div className="size-8 sm:size-10 flex items-center justify-center border border-light-primary/40 dark:border-primary/40 rounded-full group-hover:bg-light-primary/10 dark:group-hover:bg-primary/10 transition-all">
                                <img src="/assets/MTG%20icons/icons8-magic-the-gathering-arena-64.png" className="w-5 h-5 sm:w-6 sm:h-6 object-contain" style={{ filter: 'var(--logo-filter)' }} alt="Mana Nexus Logo" />
                            </div>
                            <span className="text-base sm:text-2xl font-display font-bold tracking-[0.2em] text-light-text dark:text-primary uppercase hidden xs:block">Mana Nexus</span>
                        </Link>

                        {showSearch && (
                            <div className="flex-1 max-w-xl mx-4 sm:mx-8 relative hidden md:block">
                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">search</span>
                                <input
                                    className="w-full bg-white/50 dark:bg-zinc-900/50 border border-light-primary/10 dark:border-zinc-800 pl-10 pr-4 py-2 rounded-md focus:ring-1 focus:ring-light-primary dark:focus:ring-primary text-sm transition-all outline-none text-light-text dark:text-gray-200"
                                    placeholder="Search for Magic cards..."
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => onSearchChange?.(e.target.value)}
                                    onKeyDown={onSearchKeyDown}
                                />
                            </div>
                        )}

                        <div className="flex items-center gap-4 sm:gap-8">
                            <nav className="hidden lg:flex items-center gap-6 sm:gap-8">
                                <ThemeToggle />
                                <Link to="/advanced" className="text-xs sm:text-sm font-display tracking-widest text-light-primary dark:text-gray-300 hover:text-light-secondary dark:hover:text-primary transition-colors uppercase">Advanced</Link>
                                {userRole === 'admin' && (
                                    <Link to="/admin" className="text-xs sm:text-sm font-display tracking-widest text-light-primary dark:text-primary hover:text-light-secondary dark:hover:brightness-125 transition-colors uppercase font-bold">Admin</Link>
                                )}
                                <Link to="/sets" className="text-xs sm:text-sm font-display tracking-widest text-light-primary dark:text-gray-300 hover:text-light-secondary dark:hover:text-primary transition-colors uppercase">Sets</Link>
                                <Link to="/deck/new" className="text-xs sm:text-sm font-display tracking-widest text-light-primary dark:text-gray-300 hover:text-light-secondary dark:hover:text-primary transition-colors uppercase">Deckbuilder</Link>
                            </nav>

                            <div className="flex items-center gap-3 sm:gap-6">
                                <div className="lg:hidden"><ThemeToggle /></div>

                                {token ? (
                                    <div className="flex items-center gap-3 sm:gap-4">

                                        {/* Notification Bell */}
                                        <div className="relative" ref={notifRef}>
                                            <button
                                                onClick={() => setNotifOpen(o => !o)}
                                                className="relative size-8 sm:size-10 rounded-full bg-light-primary/5 dark:bg-white/5 border border-light-primary/20 dark:border-white/10 flex items-center justify-center text-light-primary dark:text-gray-400 hover:text-light-secondary dark:hover:text-white transition-colors"
                                            >
                                                <span className="material-symbols-outlined text-lg">notifications</span>
                                                {unreadCount > 0 && (
                                                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 text-[10px] font-bold bg-red-500 text-white rounded-full flex items-center justify-center">
                                                        {unreadCount > 9 ? '9+' : unreadCount}
                                                    </span>
                                                )}
                                            </button>

                                            {notifOpen && (
                                                <div className="absolute right-0 top-12 w-80 bg-white dark:bg-[#0F0F12] border border-light-primary/20 dark:border-white/10 rounded-lg shadow-2xl shadow-black/50 z-50 overflow-hidden">
                                                    <div className="flex items-center justify-between px-4 py-3 border-b border-light-primary/10 dark:border-white/5">
                                                        <span className="text-xs font-bold uppercase tracking-widest text-light-text dark:text-gray-300">Notifications</span>
                                                        {unreadCount > 0 && (
                                                            <button onClick={handleMarkAllRead} className="text-[10px] text-light-primary dark:text-purple-400 hover:underline">Mark all read</button>
                                                        )}
                                                    </div>
                                                    <div className="max-h-72 overflow-y-auto">
                                                        {notifications.length === 0 ? (
                                                            <div className="p-6 text-center text-gray-500 text-sm">No notifications yet</div>
                                                        ) : (
                                                            notifications.map((n: any) => (
                                                                <div key={n._id} className={`px-4 py-3 border-b border-light-primary/5 dark:border-white/5 last:border-b-0 ${!n.isRead ? 'bg-light-primary/5 dark:bg-purple-500/5' : ''}`}>
                                                                    <p className="text-sm text-light-text dark:text-gray-200">{n.message}</p>
                                                                    <p className="text-[10px] text-gray-500 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
                                                                </div>
                                                            ))
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <button onClick={handleLogout} className="text-[10px] sm:text-xs font-display tracking-widest text-light-text dark:text-gray-400 hover:text-light-secondary dark:hover:text-white transition-colors uppercase">Log Out</button>
                                        <Link to="/profile">
                                            <div className="size-8 sm:size-10 rounded-full bg-light-primary/10 dark:bg-primary/20 border border-light-primary/50 dark:border-primary/50 flex items-center justify-center text-light-primary dark:text-primary">
                                                <span className="material-symbols-outlined text-lg sm:text-xl">person</span>
                                            </div>
                                        </Link>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-4 sm:gap-6">
                                        <Link to="/login" className="text-[10px] sm:text-xs font-display tracking-widest text-light-text dark:text-gray-400 hover:text-light-secondary dark:hover:text-white transition-colors uppercase">Log In</Link>
                                        <Link to="/signup" className="hidden xs:block">
                                            <button className="border border-light-primary/20 dark:border-primary/50 bg-gradient-to-r from-light-primary to-light-secondary dark:from-primary dark:to-primary-dark bg-clip-text text-transparent text-[10px] sm:text-xs font-display tracking-[0.2em] px-4 sm:px-6 py-2 uppercase transition-all hover:brightness-125">
                                                Sign Up
                                            </button>
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </header>
        </>
    );
};

export default Navbar;
