import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

import ThemeToggle from '../components/ThemeToggle'; // Import

const UserProfile: React.FC = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'profile' | 'decks'>('profile');
    const [userRole, setUserRole] = useState<string | null>(null);
    const [username, setUsername] = useState<string>('Planeswalker');
    const [displayName, setDisplayName] = useState<string>('');
    const [loading, setLoading] = useState(false);

    React.useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) return;

                const res = await axios.get('http://localhost:3000/api/auth/profile', {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (res.data) {
                    setUsername(res.data.username);
                    setDisplayName(res.data.displayName || '');
                    setUserRole(res.data.role);

                    // Update localStorage to keep it in sync
                    localStorage.setItem('username', res.data.username);
                    localStorage.setItem('displayName', res.data.displayName || '');
                    localStorage.setItem('userRole', res.data.role);
                }
            } catch (error) {
                console.error('Failed to fetch profile:', error);
            }
        };

        fetchProfile();
    }, []);

    const handleUpdateProfile = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.put('http://localhost:3000/api/auth/profile',
                { displayName },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            localStorage.setItem('displayName', res.data.displayName);
            alert('Profile updated successfully!');
        } catch (err: any) {
            alert(err.response?.data?.message || 'Update failed');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        localStorage.removeItem('username');
        navigate('/');
        window.location.reload();
    };

    return (
        <div className="bg-light-bg dark:bg-[#050508] text-light-text dark:text-gray-200 font-sans min-h-screen flex flex-col antialiased selection:bg-light-secondary dark:selection:bg-[#FFD700] selection:text-white dark:selection:text-black">
            {/* Header */}
            <header className="fixed top-0 w-full z-50 transition-all duration-300 border-b border-light-primary/10 dark:border-white/5 bg-light-bg/80 dark:bg-[#050508]/80 backdrop-blur-md">
                <div className="max-w-[1800px] mx-auto px-6 h-16 flex items-center justify-between">
                    <Link to="/dashboard" className="flex items-center gap-3 cursor-pointer group">
                        <div className="size-8 text-light-primary dark:text-[#D4AF37] flex items-center justify-center border border-light-primary/40 dark:border-[#D4AF37]/40 rounded-full group-hover:bg-light-primary/10 dark:group-hover:bg-[#D4AF37]/10 transition-all">
                            <span className="material-symbols-outlined text-[20px]">playing_cards</span>
                        </div>
                        <span className="text-lg font-display font-bold tracking-[0.2em] text-light-primary dark:text-[#D4AF37] uppercase">Mana Nexus</span>
                    </Link>

                    <div className="flex-1 max-w-xl mx-8 relative hidden md:block">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">search</span>
                        <input className="w-full bg-white dark:bg-zinc-900 border-transparent dark:border-zinc-800 pl-10 pr-4 py-2 rounded-md focus:ring-1 focus:ring-light-primary dark:focus:ring-[#D4AF37] focus:border-light-primary dark:focus:border-[#D4AF37] text-sm transition-all focus:shadow-[0_0_8px_rgba(90,4,150,0.4)] dark:focus:shadow-[0_0_8px_rgba(212,175,55,0.4)] outline-none text-light-text dark:text-gray-200" placeholder="Search for Magic cards..." type="text" />
                    </div>
                    <nav className="ml-auto flex items-center gap-6 text-sm font-medium">
                        <ThemeToggle />
                        <Link className="hover:text-light-secondary dark:hover:text-[#D4AF37] transition-colors flex items-center gap-1 uppercase tracking-tighter" to="/advanced"><span className="material-symbols-outlined text-sm">settings_input_component</span> Advanced</Link>
                        <a className="hover:text-light-secondary dark:hover:text-[#D4AF37] transition-colors flex items-center gap-1 uppercase tracking-tighter" href="#"><span className="material-symbols-outlined text-sm">style</span> Sets</a>
                        <a className="hover:text-light-secondary dark:hover:text-[#D4AF37] transition-colors flex items-center gap-1 uppercase tracking-tighter" href="#"><span className="material-symbols-outlined text-sm">casino</span> Random</a>
                        <div className="h-4 w-[1px] bg-zinc-800 mx-2"></div>
                        <button className="hover:text-light-secondary dark:hover:text-[#D4AF37] transition-colors"><span className="material-symbols-outlined">shopping_bag</span></button>
                        <div className="w-8 h-8 rounded-full bg-light-primary/20 dark:bg-[#D4AF37]/20 border border-light-primary dark:border-[#D4AF37] flex items-center justify-center text-light-primary dark:text-[#D4AF37]">
                            <span className="material-symbols-outlined text-sm">person</span>
                        </div>
                    </nav>
                </div>
            </header>

            <div className="flex flex-grow pt-16">
                {/* Sidebar */}
                <aside className="w-64 border-r border-light-primary/10 dark:border-white/5 bg-white dark:bg-[#08080A] hidden lg:block fixed h-[calc(100vh-64px)] overflow-y-auto">
                    <div className="p-8">
                        <div className="flex flex-col gap-1 mb-12">
                            <h2 className="font-display font-bold text-light-primary dark:text-[#D4AF37] text-xl tracking-[0.1em] uppercase">@{username}</h2>
                            <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold font-sans">Planeswalker</span>
                        </div>

                        <div className="space-y-8">
                            <div>
                                <h3 className="text-[10px] text-gray-500 uppercase tracking-[0.2em] font-bold mb-4 pl-3">Decks</h3>
                                <div className="space-y-1">
                                    <button
                                        onClick={() => setActiveTab('decks')}
                                        className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium transition-all rounded-md group ${activeTab === 'decks' ? 'text-[#D4AF37] bg-[#D4AF37]/10' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                                    >
                                        <span className={`material-symbols-outlined text-[18px] ${activeTab === 'decks' ? 'text-[#D4AF37]' : 'text-gray-500 group-hover:text-white'}`}>style</span>
                                        Your Decks
                                        {activeTab === 'decks' && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#D4AF37] shadow-[0_0_8px_#D4AF37]"></div>}
                                    </button>
                                    <button className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-all rounded-md group">
                                        <span className="material-symbols-outlined text-[18px] text-gray-500 group-hover:text-white">delete</span>
                                        Trash
                                    </button>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-[10px] text-gray-500 uppercase tracking-[0.2em] font-bold mb-4 pl-3">Your Account</h3>
                                <div className="space-y-1">
                                    <button className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-all rounded-md group">
                                        <span className="material-symbols-outlined text-[18px] text-gray-500 group-hover:text-white">search</span>
                                        Search Preferences
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('profile')}
                                        className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium transition-all rounded-md group ${activeTab === 'profile' ? 'text-[#D4AF37] bg-[#D4AF37]/10' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                                    >
                                        <span className={`material-symbols-outlined text-[18px] ${activeTab === 'profile' ? 'text-[#D4AF37]' : 'text-gray-500 group-hover:text-white'}`}>account_circle</span>
                                        Your Profile
                                        {activeTab === 'profile' && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#D4AF37] shadow-[0_0_8px_#D4AF37]"></div>}
                                    </button>
                                    {userRole === 'admin' && (
                                        <Link to="/admin" className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-400 hover:text-[#D4AF37] hover:bg-[#D4AF37]/10 transition-all rounded-md group">
                                            <span className="material-symbols-outlined text-[18px] text-gray-500 group-hover:text-[#D4AF37]">admin_panel_settings</span>
                                            Admin Panel
                                        </Link>
                                    )}
                                    <button className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-all rounded-md group">
                                        <span className="material-symbols-outlined text-[18px] text-gray-500 group-hover:text-white">lock</span>
                                        Email & Security
                                    </button>
                                    <button className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-all rounded-md group">
                                        <span className="material-symbols-outlined text-[18px] text-gray-500 group-hover:text-white">security</span>
                                        Safety Zone
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="mt-12 pt-8 border-t border-white/5">
                            <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-red-500 hover:text-red-400 hover:bg-red-500/10 transition-all rounded-md w-full">
                                <span className="material-symbols-outlined text-[18px]">logout</span>
                                Sign Out
                            </button>
                        </div>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-grow lg:pl-64">
                    <div className="max-w-5xl mx-auto p-12">
                        {activeTab === 'profile' ? (
                            <div className="animate-in fade-in duration-500">
                                <h1 className="font-display text-4xl text-light-primary dark:text-[#D4AF37] mb-2">Your Profile</h1>
                                <p className="text-gray-500 mb-12">Manage your public presence within the Mana Nexus realm.</p>

                                <div className="space-y-8 max-w-2xl">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-light-text dark:text-gray-300">Name</label>
                                        <input
                                            className="w-full bg-white dark:bg-[#0F0F12] border border-light-primary/20 dark:border-white/10 rounded-md px-4 py-3 focus:outline-none focus:border-light-primary dark:focus:border-[#D4AF37] focus:ring-1 focus:ring-light-primary dark:focus:ring-[#D4AF37] transition-all text-light-text dark:text-gray-200 placeholder:text-gray-400 dark:placeholder:text-gray-600"
                                            placeholder="Enter your full name"
                                            type="text"
                                            value={displayName}
                                            onChange={(e) => setDisplayName(e.target.value)}
                                        />
                                        <p className="text-xs text-gray-600 italic">Your display name will be shown publicly on your profile page.</p>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-light-text dark:text-gray-300">Mana Nexus Username</label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#D4AF37]">@</span>
                                            <input className="w-full bg-white dark:bg-[#0F0F12] border border-light-primary/20 dark:border-white/10 rounded-md pl-8 pr-4 py-3 focus:outline-none border-transparent text-light-text/50 dark:text-gray-400 cursor-not-allowed" value={`Planeswalker_${username}`} readOnly type="text" />
                                        </div>
                                        <p className="text-xs text-gray-600 italic">Your profile will be reachable at <span className="text-[#D4AF37]">https://mananexus.com/@{username}</span></p>
                                    </div>

                                    <div className="pt-8 flex justify-end">
                                        <button
                                            onClick={handleUpdateProfile}
                                            disabled={loading}
                                            className="px-8 py-3 bg-transparent border border-[#D4AF37] hover:bg-[#D4AF37]/10 text-[#D4AF37] rounded-md font-display font-bold tracking-widest text-xs uppercase transition-all flex items-center gap-2 disabled:opacity-50 min-w-[180px] justify-center"
                                        >
                                            {loading ? 'Updating...' : 'Update Profile'}
                                            {!loading && <span className="material-symbols-outlined text-sm">chevron_right</span>}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="animate-in fade-in duration-500">
                                <div className="flex items-center justify-between mb-12">
                                    <div>
                                        <div className="flex items-center gap-3">
                                            <span className="material-symbols-outlined text-[#D4AF37] text-3xl">style</span>
                                            <h1 className="font-display text-4xl text-[#D4AF37]">{username}'s Decks</h1>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center border border-light-primary/20 dark:border-white/10 rounded-md bg-white dark:bg-[#0F0F12]">
                                            <button className="px-4 py-2 text-[10px] font-bold tracking-widest text-light-primary dark:text-[#D4AF37] border-r border-light-primary/20 dark:border-white/10 hover:bg-light-primary/5 dark:hover:bg-white/5 transition-colors uppercase flex items-center gap-2">
                                                <span className="material-symbols-outlined text-sm">chevron_left</span> Previous
                                            </button>
                                            <button className="px-4 py-2 text-[10px] font-bold tracking-widest text-light-primary dark:text-[#D4AF37] hover:bg-light-primary/5 dark:hover:bg-white/5 transition-colors uppercase flex items-center gap-2">
                                                Next 80 <span className="material-symbols-outlined text-sm">chevron_right</span>
                                            </button>
                                        </div>
                                        <button className="px-6 py-2 bg-transparent border border-[#D4AF37] hover:bg-[#D4AF37]/10 text-[#D4AF37] rounded-md font-display font-bold tracking-widest text-xs uppercase transition-all flex items-center gap-2">
                                            <span className="material-symbols-outlined text-lg">add</span>
                                            New Deck
                                        </button>
                                    </div>
                                </div>

                                <div className="border border-light-primary/20 dark:border-white/10 rounded-lg overflow-hidden bg-white dark:bg-[#0F0F12]">
                                    <div className="grid grid-cols-12 gap-4 p-4 border-b border-light-primary/20 dark:border-white/10 text-[10px] uppercase tracking-widest font-bold text-gray-500">
                                        <div className="col-span-5">Deck</div>
                                        <div className="col-span-2 text-center">Colors</div>
                                        <div className="col-span-1 text-center">Owner</div>
                                        <div className="col-span-2 text-right">Last Updated</div>
                                        <div className="col-span-2 text-right">Actions</div>
                                    </div>

                                    {/* Deck Row 1 */}
                                    <div className="grid grid-cols-12 gap-4 p-4 items-center border-b border-light-primary/10 dark:border-white/5 hover:bg-light-primary/5 dark:hover:bg-white/[0.02] transition-colors group">
                                        <div className="col-span-5 font-bold text-lg text-light-text dark:text-white group-hover:text-light-primary dark:group-hover:text-[#D4AF37] transition-colors">Cream Pancake Aggro 3A</div>
                                        <div className="col-span-2 flex justify-center gap-1">
                                            <div className="size-4 rounded-full bg-slate-800 border border-slate-600 flex items-center justify-center text-[8px]">B</div>
                                            <div className="size-4 rounded-full bg-green-800 border border-green-600 flex items-center justify-center text-[8px]">G</div>
                                            <div className="size-4 rounded-full bg-red-800 border border-red-600 flex items-center justify-center text-[8px]">R</div>
                                            <div className="size-4 rounded-full bg-blue-800 border border-blue-600 flex items-center justify-center text-[8px]">U</div>
                                        </div>
                                        <div className="col-span-1 text-center text-gray-400">You</div>
                                        <div className="col-span-2 text-right text-gray-400">23 minutes ago</div>
                                        <div className="col-span-2 flex justify-end gap-2">
                                            <Link to="/deck/1">
                                                <button className="px-3 py-1 border border-[#D4AF37]/50 text-[#D4AF37] text-[10px] tracking-widest uppercase rounded hover:bg-[#D4AF37]/10 flex items-center gap-1">
                                                    <span className="material-symbols-outlined text-xs">edit</span> Edit Deck
                                                </button>
                                            </Link>
                                            <button className="px-3 py-1 border border-light-primary/20 dark:border-white/10 text-light-text/60 dark:text-gray-400 text-[10px] tracking-widest uppercase rounded hover:bg-light-primary/5 dark:hover:bg-white/5">More</button>
                                        </div>
                                    </div>

                                    {/* Deck Row 2 */}
                                    <div className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-light-primary/5 dark:hover:bg-white/[0.02] transition-colors group">
                                        <div className="col-span-5 font-bold text-lg text-light-text dark:text-white group-hover:text-light-primary dark:group-hover:text-[#D4AF37] transition-colors">Cream Breakfast Midrange 08</div>
                                        <div className="col-span-2 flex justify-center gap-1">
                                            <div className="size-4 rounded-full bg-green-800 border border-green-600 flex items-center justify-center text-[8px]">G</div>
                                            <div className="size-4 rounded-full bg-slate-800 border border-slate-600 flex items-center justify-center text-[8px]">B</div>
                                        </div>
                                        <div className="col-span-1 text-center text-gray-400">You</div>
                                        <div className="col-span-2 text-right text-gray-400">22 hours ago</div>
                                        <div className="col-span-2 flex justify-end gap-2">
                                            <Link to="/deck/2">
                                                <button className="px-3 py-1 border border-[#D4AF37]/50 text-[#D4AF37] text-[10px] tracking-widest uppercase rounded hover:bg-[#D4AF37]/10 flex items-center gap-1">
                                                    <span className="material-symbols-outlined text-xs">edit</span> Edit Deck
                                                </button>
                                            </Link>
                                            <button className="px-3 py-1 border border-light-primary/20 dark:border-white/10 text-light-text/60 dark:text-gray-400 text-[10px] tracking-widest uppercase rounded hover:bg-light-primary/5 dark:hover:bg-white/5">More</button>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-32 flex flex-col items-center justify-center opacity-30 text-[#D4AF37] gap-4">
                                    <span className="material-symbols-outlined text-6xl">filter_none</span>
                                    <span className="font-display uppercase tracking-[0.3em] font-bold">Forge More Legends</span>
                                </div>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default UserProfile;
