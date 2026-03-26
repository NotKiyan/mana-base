import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../config';

import Navbar from '../components/Navbar';

interface DeckEntry {
    _id: string | number;
    name: string;
    description?: string;
    format?: string;
    cards: { card_id: string; quantity: number }[];
    isPublic: boolean;
    updatedAt?: string;
}

const UserProfile: React.FC = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'profile' | 'decks' | 'prefs' | 'search-prefs' | 'security'>('profile');
    const [userRole, setUserRole] = useState<string | null>(null);
    const [username, setUsername] = useState<string>('Planeswalker');
    const [decks, setDecks] = useState<DeckEntry[]>([]);
    const [decksLoading, setDecksLoading] = useState(false);
    const [decksError, setDecksError] = useState<string | null>(null);
    const [displayName, setDisplayName] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [recentlyViewed, setRecentlyViewed] = useState<any[]>([]);
    const [preferences, setPreferences] = useState({ theme: 'system', defaultFormat: 'Standard', cardDisplayMode: 'grid' });
    const [prefsSaved, setPrefsSaved] = useState(false);
    const [searchPrefs, setSearchPrefs] = useState({ defaultColors: [] as string[], defaultRarity: '', resultsPerPage: 20, showFoilOnly: false, preferredLanguage: 'en' });
    const [searchPrefsSaved, setSearchPrefsSaved] = useState(false);
    const [securityEmail, setSecurityEmail] = useState('');
    const [securityEmailPassword, setSecurityEmailPassword] = useState('');
    const [securityEmailMsg, setSecurityEmailMsg] = useState<{ ok: boolean; text: string } | null>(null);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [securityPwMsg, setSecurityPwMsg] = useState<{ ok: boolean; text: string } | null>(null);

    const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            navigate(`/search?q=${searchQuery}`);
        }
    };

    React.useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) return;

                const res = await axios.get(`${API_URL}/api/auth/profile`, {
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
        // Fetch recently viewed
        const token = localStorage.getItem('token');
        if (token) {
            axios.get(`${API_URL}/api/user/viewed`, { headers: { Authorization: `Bearer ${token}` } })
                .then(r => setRecentlyViewed(r.data)).catch(() => { });
            axios.get(`${API_URL}/api/user/preferences`, { headers: { Authorization: `Bearer ${token}` } })
                .then(r => {
                    if (r.data) {
                        setPreferences({ theme: r.data.theme || 'system', defaultFormat: r.data.defaultFormat || 'Standard', cardDisplayMode: r.data.cardDisplayMode || 'grid' });
                        if (r.data.searchPreferences) setSearchPrefs(sp => ({ ...sp, ...r.data.searchPreferences }));
                    }
                }).catch(() => { });
        }
    }, []);

    // Fetch user decks whenever the decks tab is opened
    useEffect(() => {
        if (activeTab !== 'decks') return;
        const fetchDecks = async () => {
            setDecksLoading(true);
            setDecksError(null);
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get(`${API_URL}/api/decks`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setDecks(res.data);
            } catch (err: any) {
                setDecksError(err.response?.data?.message || 'Failed to load decks');
            } finally {
                setDecksLoading(false);
            }
        };
        fetchDecks();
    }, [activeTab]);

    const handleCreateDeck = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(
                `${API_URL}/api/decks`,
                { name: 'New Deck', format: 'Other' },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            navigate(`/deck/${res.data._id}`);
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to create deck');
        }
    };

    const handleDeleteDeck = async (deckId: string, deckName: string) => {
        if (!window.confirm(`Delete "${deckName}"? This cannot be undone.`)) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_URL}/api/decks/${deckId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setDecks((prev) => prev.filter((d) => d._id !== deckId));
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to delete deck');
        }
    };

    const formatRelativeTime = (dateStr: string) => {
        const diff = Date.now() - new Date(dateStr).getTime();
        const minutes = Math.floor(diff / 60000);
        if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
        const days = Math.floor(hours / 24);
        return `${days} day${days !== 1 ? 's' : ''} ago`;
    };

    const handleUpdateProfile = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.put(`${API_URL}/api/auth/profile`,
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
            {/* Navbar */}
            <Navbar
                showSearch={true}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onSearchKeyDown={handleSearch}
            />

            <div className="flex flex-grow pt-28">
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
                                    <button
                                        onClick={() => setActiveTab('prefs')}
                                        className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium transition-all rounded-md group ${activeTab === 'prefs' ? 'text-[#D4AF37] bg-[#D4AF37]/10' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                                    >
                                        <span className={`material-symbols-outlined text-[18px] ${activeTab === 'prefs' ? 'text-[#D4AF37]' : 'text-gray-500 group-hover:text-white'}`}>tune</span>
                                        Preferences
                                        {activeTab === 'prefs' && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#D4AF37] shadow-[0_0_8px_#D4AF37]"></div>}
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
                                    <button
                                        onClick={() => setActiveTab('search-prefs')}
                                        className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium transition-all rounded-md group ${activeTab === 'search-prefs' ? 'text-[#D4AF37] bg-[#D4AF37]/10' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                                    >
                                        <span className={`material-symbols-outlined text-[18px] ${activeTab === 'search-prefs' ? 'text-[#D4AF37]' : 'text-gray-500 group-hover:text-white'}`}>search</span>
                                        Search Preferences
                                        {activeTab === 'search-prefs' && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#D4AF37] shadow-[0_0_8px_#D4AF37]"></div>}
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
                                    <button
                                        onClick={() => setActiveTab('security')}
                                        className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium transition-all rounded-md group ${activeTab === 'security' ? 'text-[#D4AF37] bg-[#D4AF37]/10' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                                    >
                                        <span className={`material-symbols-outlined text-[18px] ${activeTab === 'security' ? 'text-[#D4AF37]' : 'text-gray-500 group-hover:text-white'}`}>lock</span>
                                        Email &amp; Security
                                        {activeTab === 'security' && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#D4AF37] shadow-[0_0_8px_#D4AF37]"></div>}
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
                        ) : activeTab === 'prefs' ? (
                            <div className="animate-in fade-in duration-500">
                                <h1 className="font-display text-4xl text-light-primary dark:text-[#D4AF37] mb-2">Preferences</h1>
                                <p className="text-gray-500 mb-12">Customize your Mana Nexus experience.</p>

                                <div className="space-y-8 max-w-2xl">
                                    {/* Theme */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-light-text dark:text-gray-300">Theme</label>
                                        <select value={preferences.theme} onChange={e => setPreferences(p => ({ ...p, theme: e.target.value }))}
                                            className="w-full bg-white dark:bg-[#0F0F12] border border-light-primary/20 dark:border-white/10 rounded-md px-4 py-3 text-light-text dark:text-gray-200 focus:outline-none focus:border-[#D4AF37]">
                                            <option value="system">System Default</option>
                                            <option value="dark">Dark</option>
                                            <option value="light">Light</option>
                                        </select>
                                    </div>

                                    {/* Default Format */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-light-text dark:text-gray-300">Default Format</label>
                                        <select value={preferences.defaultFormat} onChange={e => setPreferences(p => ({ ...p, defaultFormat: e.target.value }))}
                                            className="w-full bg-white dark:bg-[#0F0F12] border border-light-primary/20 dark:border-white/10 rounded-md px-4 py-3 text-light-text dark:text-gray-200 focus:outline-none focus:border-[#D4AF37]">
                                            {['Standard', 'Pioneer', 'Modern', 'Legacy', 'Vintage', 'Commander', 'Pauper', 'Draft', 'Other'].map(f => (
                                                <option key={f} value={f}>{f}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Card Display */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-light-text dark:text-gray-300">Card Display Mode</label>
                                        <div className="flex gap-3">
                                            {['grid', 'list'].map(mode => (
                                                <button key={mode} onClick={() => setPreferences(p => ({ ...p, cardDisplayMode: mode }))}
                                                    className={`flex-1 py-3 rounded-md border capitalize text-sm font-medium transition-all ${preferences.cardDisplayMode === mode ? 'border-[#D4AF37] text-[#D4AF37] bg-[#D4AF37]/10' : 'border-white/10 text-gray-400 hover:border-white/20'}`}>
                                                    {mode}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="pt-4 flex justify-end">
                                        <button
                                            onClick={async () => {
                                                try {
                                                    const token = localStorage.getItem('token');
                                                    await axios.put(`${API_URL}/api/user/preferences`, preferences, { headers: { Authorization: `Bearer ${token}` } });
                                                    setPrefsSaved(true);
                                                    setTimeout(() => setPrefsSaved(false), 2000);
                                                } catch (err: any) {
                                                    console.error('Failed to save preferences:', err);
                                                    alert(err.response?.data?.message || 'Failed to save preferences. Check console.');
                                                }
                                            }}
                                            className="px-8 py-3 bg-transparent border border-[#D4AF37] hover:bg-[#D4AF37]/10 text-[#D4AF37] rounded-md font-display font-bold tracking-widest text-xs uppercase transition-all"
                                        >
                                            {prefsSaved ? '✓ Saved!' : 'Save Preferences'}
                                        </button>
                                    </div>

                                    {/* Recently Viewed */}
                                    {recentlyViewed.length > 0 && (
                                        <div className="pt-8 border-t border-white/5">
                                            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">Recently Viewed</h2>
                                            <div className="space-y-2">
                                                {recentlyViewed.slice(0, 10).map((c: any) => (
                                                    <a key={c.card_id} href={`/card/${c.card_id}`}
                                                        className="flex items-center justify-between px-3 py-2 rounded-md border border-transparent hover:border-white/10 hover:bg-white/5 transition-all group">
                                                        <span className="text-sm text-light-text dark:text-gray-300 group-hover:text-[#D4AF37] transition-colors">{c.name}</span>
                                                        <span className="text-[10px] text-gray-600">{new Date(c.viewedAt).toLocaleDateString()}</span>
                                                    </a>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : activeTab === 'search-prefs' ? (
                            <div className="animate-in fade-in duration-500">
                                <h1 className="font-display text-4xl text-light-primary dark:text-[#D4AF37] mb-2">Search Preferences</h1>
                                <p className="text-gray-500 mb-12">Set default filters applied when you search for cards.</p>

                                <div className="space-y-8 max-w-2xl">
                                    {/* Default Colors */}
                                    <div className="space-y-3">
                                        <label className="text-sm font-bold text-light-text dark:text-gray-300">Default Colors</label>
                                        <p className="text-xs text-gray-500">Pre-select these color filters on the search page.</p>
                                        <div className="flex gap-3">
                                            {[
                                                { code: 'W', label: 'White', icon: 'WhiteMana.png' },
                                                { code: 'U', label: 'Blue', icon: 'BlueMana.png' },
                                                { code: 'B', label: 'Black', icon: 'BlackMana.png' },
                                                { code: 'R', label: 'Red', icon: 'RedMana.png' },
                                                { code: 'G', label: 'Green', icon: 'GreenMana.png' },
                                            ].map(c => {
                                                const active = searchPrefs.defaultColors.includes(c.code);
                                                return (
                                                    <button
                                                        key={c.code}
                                                        title={c.label}
                                                        onClick={() => setSearchPrefs(p => ({
                                                            ...p,
                                                            defaultColors: active ? p.defaultColors.filter(x => x !== c.code) : [...p.defaultColors, c.code]
                                                        }))}
                                                        className={`w-10 h-10 rounded-full border-2 transition-all ${active ? 'border-[#D4AF37] scale-110 shadow-[0_0_12px_rgba(212,175,55,0.4)]' : 'border-white/10 opacity-50 hover:opacity-80'}`}
                                                    >
                                                        <img src={`${API_URL}/icons/mana/${c.icon}`} alt={c.label} className="w-full h-full rounded-full" />
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Default Rarity */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-light-text dark:text-gray-300">Default Rarity</label>
                                        <select value={searchPrefs.defaultRarity} onChange={e => setSearchPrefs(p => ({ ...p, defaultRarity: e.target.value }))}
                                            className="w-full bg-white dark:bg-[#0F0F12] border border-light-primary/20 dark:border-white/10 rounded-md px-4 py-3 text-light-text dark:text-gray-200 focus:outline-none focus:border-[#D4AF37]">
                                            <option value="">Any Rarity</option>
                                            <option value="common">Common</option>
                                            <option value="uncommon">Uncommon</option>
                                            <option value="rare">Rare</option>
                                            <option value="mythic">Mythic Rare</option>
                                        </select>
                                    </div>

                                    {/* Results Per Page */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-light-text dark:text-gray-300">Results Per Page</label>
                                        <select value={searchPrefs.resultsPerPage} onChange={e => setSearchPrefs(p => ({ ...p, resultsPerPage: Number(e.target.value) }))}
                                            className="w-full bg-white dark:bg-[#0F0F12] border border-light-primary/20 dark:border-white/10 rounded-md px-4 py-3 text-light-text dark:text-gray-200 focus:outline-none focus:border-[#D4AF37]">
                                            {[10, 20, 40, 60, 100].map(n => <option key={n} value={n}>{n} cards</option>)}
                                        </select>
                                    </div>

                                    {/* Foil Only */}
                                    <div className="flex items-center justify-between py-4 border-t border-b border-light-primary/10 dark:border-white/5">
                                        <div>
                                            <p className="text-sm font-bold text-light-text dark:text-gray-300">Foil printings only</p>
                                            <p className="text-xs text-gray-500 mt-1">Filter search results to foil editions by default.</p>
                                        </div>
                                        <button
                                            onClick={() => setSearchPrefs(p => ({ ...p, showFoilOnly: !p.showFoilOnly }))}
                                            className={`relative w-11 h-6 rounded-full transition-colors ${searchPrefs.showFoilOnly ? 'bg-[#D4AF37]' : 'bg-white/10'}`}
                                        >
                                            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${searchPrefs.showFoilOnly ? 'left-6' : 'left-1'}`} />
                                        </button>
                                    </div>

                                    {/* Language */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-light-text dark:text-gray-300">Preferred Language</label>
                                        <select value={searchPrefs.preferredLanguage} onChange={e => setSearchPrefs(p => ({ ...p, preferredLanguage: e.target.value }))}
                                            className="w-full bg-white dark:bg-[#0F0F12] border border-light-primary/20 dark:border-white/10 rounded-md px-4 py-3 text-light-text dark:text-gray-200 focus:outline-none focus:border-[#D4AF37]">
                                            <option value="en">English</option>
                                            <option value="de">German</option>
                                            <option value="fr">French</option>
                                            <option value="es">Spanish</option>
                                            <option value="it">Italian</option>
                                            <option value="pt">Portuguese</option>
                                            <option value="ja">Japanese</option>
                                            <option value="ko">Korean</option>
                                            <option value="ru">Russian</option>
                                            <option value="zhs">Chinese (Simplified)</option>
                                        </select>
                                    </div>

                                    <div className="pt-4 flex justify-end">
                                        <button
                                            onClick={async () => {
                                                try {
                                                    const token = localStorage.getItem('token');
                                                    await axios.put(`${API_URL}/api/user/search-preferences`, searchPrefs, { headers: { Authorization: `Bearer ${token}` } });
                                                    setSearchPrefsSaved(true);
                                                    setTimeout(() => setSearchPrefsSaved(false), 2000);
                                                } catch (err: any) {
                                                    console.error('Failed to save search preferences:', err);
                                                    alert(err.response?.data?.message || 'Failed to save search preferences. Check console.');
                                                }
                                            }}
                                            className="px-8 py-3 bg-transparent border border-[#D4AF37] hover:bg-[#D4AF37]/10 text-[#D4AF37] rounded-md font-display font-bold tracking-widest text-xs uppercase transition-all"
                                        >
                                            {searchPrefsSaved ? '✓ Saved!' : 'Save Search Preferences'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : activeTab === 'security' ? (
                            <div className="animate-in fade-in duration-500">
                                <h1 className="font-display text-4xl text-light-primary dark:text-[#D4AF37] mb-2">Email &amp; Security</h1>
                                <p className="text-gray-500 mb-12">Manage your login credentials and account security.</p>

                                <div className="space-y-10 max-w-2xl">
                                    {/* Change Email */}
                                    <div className="bg-white/50 dark:bg-[#0F0F12] border border-light-primary/10 dark:border-white/10 rounded-xl p-6 space-y-4">
                                        <h2 className="font-bold text-light-text dark:text-gray-200 flex items-center gap-2">
                                            <span className="material-symbols-outlined text-[18px] text-[#D4AF37]">mail</span>
                                            Change Email Address
                                        </h2>
                                        <div className="space-y-3">
                                            <input
                                                type="email"
                                                placeholder="New email address"
                                                value={securityEmail}
                                                onChange={e => setSecurityEmail(e.target.value)}
                                                className="w-full bg-white dark:bg-[#080810] border border-light-primary/20 dark:border-white/10 rounded-md px-4 py-3 text-light-text dark:text-gray-200 placeholder:text-gray-500 focus:outline-none focus:border-[#D4AF37] transition-all"
                                            />
                                            <input
                                                type="password"
                                                placeholder="Confirm with your current password"
                                                value={securityEmailPassword}
                                                onChange={e => setSecurityEmailPassword(e.target.value)}
                                                className="w-full bg-white dark:bg-[#080810] border border-light-primary/20 dark:border-white/10 rounded-md px-4 py-3 text-light-text dark:text-gray-200 placeholder:text-gray-500 focus:outline-none focus:border-[#D4AF37] transition-all"
                                            />
                                        </div>
                                        {securityEmailMsg && (
                                            <p className={`text-sm ${securityEmailMsg.ok ? 'text-emerald-400' : 'text-red-400'}`}>{securityEmailMsg.text}</p>
                                        )}
                                        <div className="flex justify-end">
                                            <button
                                                onClick={async () => {
                                                    setSecurityEmailMsg(null);
                                                    try {
                                                        const token = localStorage.getItem('token');
                                                        await axios.put(`${API_URL}/api/user/email`, { newEmail: securityEmail, password: securityEmailPassword }, { headers: { Authorization: `Bearer ${token}` } });
                                                        setSecurityEmailMsg({ ok: true, text: 'Email updated successfully.' });
                                                        setSecurityEmail('');
                                                        setSecurityEmailPassword('');
                                                    } catch (err: any) {
                                                        setSecurityEmailMsg({ ok: false, text: err?.response?.data?.message || 'Failed to update email.' });
                                                    }
                                                }}
                                                className="px-6 py-2.5 bg-transparent border border-[#D4AF37] hover:bg-[#D4AF37]/10 text-[#D4AF37] rounded-md font-display font-bold tracking-widest text-xs uppercase transition-all"
                                            >
                                                Update Email
                                            </button>
                                        </div>
                                    </div>

                                    {/* Change Password */}
                                    <div className="bg-white/50 dark:bg-[#0F0F12] border border-light-primary/10 dark:border-white/10 rounded-xl p-6 space-y-4">
                                        <h2 className="font-bold text-light-text dark:text-gray-200 flex items-center gap-2">
                                            <span className="material-symbols-outlined text-[18px] text-[#D4AF37]">lock</span>
                                            Change Password
                                        </h2>
                                        <div className="space-y-3">
                                            <input
                                                type="password"
                                                placeholder="Current password"
                                                value={currentPassword}
                                                onChange={e => setCurrentPassword(e.target.value)}
                                                className="w-full bg-white dark:bg-[#080810] border border-light-primary/20 dark:border-white/10 rounded-md px-4 py-3 text-light-text dark:text-gray-200 placeholder:text-gray-500 focus:outline-none focus:border-[#D4AF37] transition-all"
                                            />
                                            <input
                                                type="password"
                                                placeholder="New password (min 6 characters)"
                                                value={newPassword}
                                                onChange={e => setNewPassword(e.target.value)}
                                                className="w-full bg-white dark:bg-[#080810] border border-light-primary/20 dark:border-white/10 rounded-md px-4 py-3 text-light-text dark:text-gray-200 placeholder:text-gray-500 focus:outline-none focus:border-[#D4AF37] transition-all"
                                            />
                                            <input
                                                type="password"
                                                placeholder="Confirm new password"
                                                value={confirmPassword}
                                                onChange={e => setConfirmPassword(e.target.value)}
                                                className={`w-full bg-white dark:bg-[#080810] border rounded-md px-4 py-3 text-light-text dark:text-gray-200 placeholder:text-gray-500 focus:outline-none transition-all ${confirmPassword && confirmPassword !== newPassword ? 'border-red-500/50 focus:border-red-500' : 'border-light-primary/20 dark:border-white/10 focus:border-[#D4AF37]'}`}
                                            />
                                            {confirmPassword && confirmPassword !== newPassword && (
                                                <p className="text-xs text-red-400">Passwords don't match</p>
                                            )}
                                        </div>
                                        {securityPwMsg && (
                                            <p className={`text-sm ${securityPwMsg.ok ? 'text-emerald-400' : 'text-red-400'}`}>{securityPwMsg.text}</p>
                                        )}
                                        <div className="flex justify-end">
                                            <button
                                                disabled={!!(confirmPassword && confirmPassword !== newPassword)}
                                                onClick={async () => {
                                                    setSecurityPwMsg(null);
                                                    if (newPassword !== confirmPassword) { setSecurityPwMsg({ ok: false, text: "Passwords don't match." }); return; }
                                                    try {
                                                        const token = localStorage.getItem('token');
                                                        await axios.put(`${API_URL}/api/user/password`, { currentPassword, newPassword }, { headers: { Authorization: `Bearer ${token}` } });
                                                        setSecurityPwMsg({ ok: true, text: 'Password changed successfully.' });
                                                        setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
                                                    } catch (err: any) {
                                                        setSecurityPwMsg({ ok: false, text: err?.response?.data?.message || 'Failed to change password.' });
                                                    }
                                                }}
                                                className="px-6 py-2.5 bg-transparent border border-[#D4AF37] hover:bg-[#D4AF37]/10 text-[#D4AF37] rounded-md font-display font-bold tracking-widest text-xs uppercase transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                                            >
                                                Change Password
                                            </button>
                                        </div>
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
                                        <button
                                            onClick={handleCreateDeck}
                                            className="px-6 py-2 bg-transparent border border-[#D4AF37] hover:bg-[#D4AF37]/10 text-[#D4AF37] rounded-md font-display font-bold tracking-widest text-xs uppercase transition-all flex items-center gap-2"
                                        >
                                            <span className="material-symbols-outlined text-lg">add</span>
                                            New Deck
                                        </button>
                                    </div>
                                </div>

                                {decksLoading && (
                                    <div className="flex items-center justify-center py-24 text-gray-500">
                                        <span className="material-symbols-outlined animate-spin mr-2">progress_activity</span> Loading decks...
                                    </div>
                                )}
                                {decksError && (
                                    <div className="p-6 text-red-400 text-sm">{decksError}</div>
                                )}

                                {!decksLoading && !decksError && (
                                    <div className="border border-light-primary/20 dark:border-white/10 rounded-lg overflow-hidden bg-white dark:bg-[#0F0F12]">
                                        <div className="grid grid-cols-12 gap-4 p-4 border-b border-light-primary/20 dark:border-white/10 text-[10px] uppercase tracking-widest font-bold text-gray-500">
                                            <div className="col-span-5">Deck</div>
                                            <div className="col-span-2 text-center">Format</div>
                                            <div className="col-span-1 text-center">Cards</div>
                                            <div className="col-span-2 text-right">Last Updated</div>
                                            <div className="col-span-2 text-right">Actions</div>
                                        </div>

                                        {decks.length === 0 ? (
                                            <div className="flex flex-col items-center justify-center py-24 opacity-40 text-[#D4AF37] gap-4">
                                                <span className="material-symbols-outlined text-6xl">filter_none</span>
                                                <span className="font-display uppercase tracking-[0.3em] font-bold">No Decks Yet — Forge a Legend</span>
                                            </div>
                                        ) : (
                                            decks.map((deck) => (
                                                <div key={deck._id} className="grid grid-cols-12 gap-4 p-4 items-center border-b border-light-primary/10 dark:border-white/5 hover:bg-light-primary/5 dark:hover:bg-white/[0.02] transition-colors group last:border-b-0">
                                                    <div className="col-span-5 font-bold text-lg text-light-text dark:text-white group-hover:text-light-primary dark:group-hover:text-[#D4AF37] transition-colors truncate">
                                                        {deck.name}
                                                        {deck.description && <p className="text-xs text-gray-500 font-normal truncate">{deck.description}</p>}
                                                    </div>
                                                    <div className="col-span-2 text-center">
                                                        <span className="text-xs px-2 py-0.5 rounded-full border border-[#D4AF37]/30 text-[#D4AF37]/80">{deck.format}</span>
                                                    </div>
                                                    <div className="col-span-1 text-center text-gray-400 text-sm">
                                                        {deck.cards.reduce((sum, c) => sum + c.quantity, 0)}
                                                    </div>
                                                    <div className="col-span-2 text-right text-gray-400 text-sm">{deck.updatedAt ? formatRelativeTime(deck.updatedAt) : '—'}</div>
                                                    <div className="col-span-2 flex justify-end gap-2">
                                                        <Link to={`/deck/${deck._id}`}>
                                                            <button className="px-3 py-1 border border-[#D4AF37]/50 text-[#D4AF37] text-[10px] tracking-widest uppercase rounded hover:bg-[#D4AF37]/10 flex items-center gap-1">
                                                                <span className="material-symbols-outlined text-xs">edit</span> Edit
                                                            </button>
                                                        </Link>
                                                        <button
                                                            onClick={() => handleDeleteDeck(String(deck._id), deck.name)}
                                                            className="px-3 py-1 border border-red-500/30 text-red-400 text-[10px] tracking-widest uppercase rounded hover:bg-red-500/10 flex items-center gap-1"
                                                        >
                                                            <span className="material-symbols-outlined text-xs">delete</span>
                                                        </button>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default UserProfile;
