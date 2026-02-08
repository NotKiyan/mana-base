import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

interface CardData {
    edition_id: string;
    image_url_normal: string;
    Card: {
        name: string;
    }
}

import ThemeToggle from '../components/ThemeToggle';

const Dashboard: React.FC = () => {
    const [cards, setCards] = useState<CardData[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();

    const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            navigate(`/search?q=${searchQuery}`);
        }
    };

    useEffect(() => {
        const fetchCards = async () => {
            try {
                const res = await axios.get('http://localhost:3000/api/cards/random?limit=5');
                setCards(res.data);
            } catch (err) {
                console.error('Failed to fetch cards', err);
            }
        };
        fetchCards();
    }, []);

    return (
        <div className="bg-light-bg dark:bg-[#050508] text-light-text dark:text-gray-200 font-sans min-h-screen flex flex-col antialiased selection:bg-light-primary dark:selection:bg-[#FFD700] selection:text-white dark:selection:text-black">
            {/* Background Canvas */}
            <div className="fixed inset-0 -z-10 overflow-hidden flex items-center justify-center bg-light-bg dark:bg-[#050508]">
                {/* Dynamic cards in background - only show in dark mode for visual effect */}
                <div className="hidden dark:block">
                    {cards.length >= 3 && (
                        <>
                            <div className="absolute w-[40vw] h-[56vw] max-w-[450px] max-h-[630px] bg-cover bg-center transition-all duration-1000 opacity-60 blur-[40px] brightness-50 contrast-125"
                                style={{ backgroundImage: `url('${cards[0].image_url_normal}')`, transform: 'rotate(-15deg) translate(-20%, -10%)' }}></div>
                            <div className="absolute w-[40vw] h-[56vw] max-w-[450px] max-h-[630px] bg-cover bg-center transition-all duration-1000 opacity-60 blur-[40px] brightness-50 contrast-125"
                                style={{ backgroundImage: `url('${cards[1].image_url_normal}')`, transform: 'rotate(10deg) translate(25%, 5%)' }}></div>
                            <div className="absolute w-[40vw] h-[56vw] max-w-[450px] max-h-[630px] bg-cover bg-center transition-all duration-1000 opacity-60 blur-[40px] brightness-50 contrast-125"
                                style={{ backgroundImage: `url('${cards[2].image_url_normal}')`, transform: 'rotate(-5deg) translate(5%, -20%)' }}></div>
                        </>
                    )}
                </div>
                {/* Arcana Gradient Overlay - dark mode only */}
                <div className="absolute inset-0 hidden dark:block bg-[radial-gradient(circle_at_center,rgba(75,0,130,0.2)_0%,rgba(15,82,186,0.1)_50%,transparent_100%)]"></div>
                {/* Light mode decorative elements */}
                <div className="absolute inset-0 dark:hidden bg-[radial-gradient(circle_at_center,rgba(90,4,150,0.05)_0%,rgba(176,35,181,0.03)_50%,transparent_100%)]"></div>
            </div>

            {/* Header */}
            <header className="fixed top-0 w-full z-50 transition-all duration-300 border-b border-light-primary/20 dark:border-primary/20 bg-light-bg/80 dark:bg-black/40 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-20">
                        <div className="flex items-center gap-3 cursor-pointer group">
                            <div className="size-10 text-light-primary dark:text-primary flex items-center justify-center border border-light-primary/40 dark:border-primary/40 rounded-full group-hover:bg-light-primary/10 dark:group-hover:bg-primary/10 transition-all">
                                <span className="material-symbols-outlined text-[28px]">playing_cards</span>
                            </div>
                            <span className="text-2xl font-display font-bold tracking-[0.2em] text-light-text dark:text-primary uppercase">Mana Nexus</span>
                        </div>
                        <nav className="hidden md:flex items-center gap-8">
                            <ThemeToggle />
                            <Link to="/advanced" className="text-sm font-display tracking-widest text-light-primary dark:text-gray-300 hover:text-light-secondary dark:hover:text-primary transition-colors uppercase">Advanced</Link>
                            {localStorage.getItem('userRole') === 'admin' && (
                                <Link to="/admin" className="text-sm font-display tracking-widest text-light-primary dark:text-primary hover:text-light-secondary dark:hover:brightness-125 transition-colors uppercase font-bold">Admin</Link>
                            )}
                            <a href="#" className="text-sm font-display tracking-widest text-light-primary dark:text-gray-300 hover:text-light-secondary dark:hover:text-primary transition-colors uppercase">Sets</a>
                            <Link to="/deck/new" className="text-sm font-display tracking-widest text-light-primary dark:text-gray-300 hover:text-light-secondary dark:hover:text-primary transition-colors uppercase">Deckbuilder</Link>
                        </nav>
                        <div className="hidden md:flex items-center gap-6">
                            {localStorage.getItem('token') ? (
                                <div className="flex items-center gap-4">
                                    <button onClick={() => { localStorage.removeItem('token'); window.location.reload(); }} className="text-xs font-display tracking-widest text-light-text dark:text-gray-400 hover:text-light-secondary dark:hover:text-white transition-colors uppercase">
                                        Log Out
                                    </button>
                                    <Link to="/profile">
                                        <div className="size-10 rounded-full bg-light-primary/10 dark:bg-primary/20 border border-light-primary/50 dark:border-primary/50 flex items-center justify-center text-light-primary dark:text-primary">
                                            <span className="material-symbols-outlined">person</span>
                                        </div>
                                    </Link>
                                </div>
                            ) : (
                                <>
                                    <Link to="/login" className="text-xs font-display tracking-widest text-light-text dark:text-gray-400 hover:text-light-secondary dark:hover:text-white transition-colors uppercase">
                                        Log In
                                    </Link>
                                    <Link to="/signup">
                                        <button className="border border-transparent bg-gradient-to-r from-light-primary to-light-secondary dark:from-primary dark:to-[#FFD700] bg-clip-text text-transparent border-light-primary/20 dark:border-primary/50 text-xs font-display tracking-[0.2em] px-6 py-2.5 uppercase transition-all hover:brightness-125 hover:scale-105">
                                            Sign Up
                                        </button>
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-grow flex flex-col items-center justify-center relative pt-32 pb-24 px-4">
                <div className="w-full max-w-5xl flex flex-col items-center gap-12 z-10">
                    <div className="text-center space-y-6">
                        <h1 className="text-5xl sm:text-7xl lg:text-8xl font-display font-black tracking-tight text-light-text dark:text-white drop-shadow-2xl">
                            Explore the <span className="italic font-serif text-light-primary dark:text-white">Multiverse</span>
                        </h1>
                        <p className="text-xl font-serif text-light-text/80 dark:text-gray-300 max-w-2xl mx-auto italic">
                            The world's most advanced card search engine. Fast, precise, and beautiful.
                        </p>
                    </div>

                    {/* Search Bar */}
                    <div className="w-full max-w-3xl space-y-8">
                        <div className="bg-white/40 dark:bg-[rgba(15,20,40,0.4)] backdrop-blur-[20px] backdrop-saturate-[180%] border border-light-primary/20 dark:border-[rgba(212,175,55,0.2)] shadow-[0_8px_32px_0_rgba(31,38,135,0.15)] dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.8)] p-1 rounded-2xl">
                            <div className="relative flex items-center w-full bg-white/60 dark:bg-black/40 rounded-xl overflow-hidden group">
                                <div className="pl-6 flex items-center justify-center text-light-primary dark:text-primary/60">
                                    <span className="material-symbols-outlined text-[32px]">auto_awesome</span>
                                </div>
                                <input
                                    type="text"
                                    autoFocus
                                    className="w-full bg-transparent border-0 focus:ring-0 text-light-text dark:text-white placeholder-light-text/50 dark:placeholder-gray-500 h-20 px-6 text-xl font-serif italic focus:outline-none"
                                    placeholder="Whisper your search for cards or lore..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyDown={handleSearch}
                                />
                                <div className="pr-6 flex items-center gap-2">
                                    <kbd className="hidden sm:inline-flex items-center h-8 px-3 text-[10px] font-display tracking-widest text-light-primary dark:text-primary/60 bg-light-primary/5 dark:bg-white/5 rounded border border-light-primary/20 dark:border-primary/20">ENTER</kbd>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center justify-center gap-6">
                            <Link to="/advanced">
                                <button className="group relative px-8 py-3 bg-light-bg dark:bg-[#050508] border border-light-primary/30 dark:border-[#D4AF37]/30 rounded-full overflow-hidden hover:border-light-primary dark:hover:border-[#D4AF37] transition-all duration-300">
                                    <div className="absolute inset-0 bg-light-primary/5 dark:bg-[#D4AF37]/5 group-hover:bg-light-primary/10 dark:group-hover:bg-[#D4AF37]/10 transition-colors"></div>
                                    <div className="flex items-center gap-3 relative z-10">
                                        <span className="material-symbols-outlined text-light-primary dark:text-[#D4AF37] text-sm">manage_search</span>
                                        <span className="text-xs font-display tracking-[0.2em] text-light-primary dark:text-[#D4AF37] uppercase font-bold">Advanced Search</span>
                                    </div>
                                </button>
                            </Link>
                            <button className="group relative px-8 py-3 bg-light-bg dark:bg-[#050508] border border-light-primary/30 dark:border-[#D4AF37]/30 rounded-full overflow-hidden hover:border-light-primary dark:hover:border-[#D4AF37] transition-all duration-300">
                                <div className="absolute inset-0 bg-light-primary/5 dark:bg-[#D4AF37]/5 group-hover:bg-light-primary/10 dark:group-hover:bg-[#D4AF37]/10 transition-colors"></div>
                                <div className="flex items-center gap-3 relative z-10">
                                    <span className="material-symbols-outlined text-light-primary dark:text-[#D4AF37] text-sm">casino</span>
                                    <span className="text-xs font-display tracking-[0.2em] text-light-primary dark:text-[#D4AF37] uppercase font-bold">Random Card</span>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Card Fan (Dynamic) */}
                <div className="mt-24 w-full max-w-6xl mx-auto h-[350px] flex justify-center items-end perspective-1000 group px-4 pb-4">
                    {cards.length >= 5 && (
                        <>
                            {/* Card 1 */}
                            <div className="transition-all duration-500 hover:translate-y-[-20px] w-40 sm:w-52 aspect-[2.5/3.5] rounded-xl shadow-[0_0_30px_rgba(0,0,0,0.5)] overflow-hidden relative -mr-16 transform -rotate-12 translate-y-12 z-0 border border-white/10">
                                <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url('${cards[0].image_url_normal}')` }}></div>
                                <div className="absolute inset-0 bg-black/40 hover:bg-transparent transition-colors"></div>
                            </div>
                            {/* Card 2 */}
                            <div className="transition-all duration-500 hover:translate-y-[-30px] w-44 sm:w-56 aspect-[2.5/3.5] rounded-xl shadow-[0_0_40px_rgba(0,0,0,0.6)] overflow-hidden relative -mr-16 transform -rotate-6 translate-y-6 z-10 border border-white/10">
                                <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url('${cards[1].image_url_normal}')` }}></div>
                                <div className="absolute inset-0 bg-black/30 hover:bg-transparent transition-colors"></div>
                            </div>
                            {/* Card 3 (Center) */}
                            <div className="transition-all duration-500 hover:translate-y-[-40px] w-52 sm:w-64 aspect-[2.5/3.5] rounded-xl shadow-[0_0_50px_rgba(212,175,55,0.3)] overflow-hidden relative z-30 border-2 border-primary/40 ring-4 ring-black/50 scale-110">
                                <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url('${cards[2].image_url_normal}')` }}></div>
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-white/5 pointer-events-none"></div>
                            </div>
                            {/* Card 4 */}
                            <div className="transition-all duration-500 hover:translate-y-[-30px] w-44 sm:w-56 aspect-[2.5/3.5] rounded-xl shadow-[0_0_40px_rgba(0,0,0,0.6)] overflow-hidden relative -ml-16 transform rotate-6 translate-y-6 z-10 border border-white/10">
                                <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url('${cards[3].image_url_normal}')` }}></div>
                                <div className="absolute inset-0 bg-black/30 hover:bg-transparent transition-colors"></div>
                            </div>
                            {/* Card 5 */}
                            <div className="transition-all duration-500 hover:translate-y-[-20px] w-40 sm:w-52 aspect-[2.5/3.5] rounded-xl shadow-[0_0_30px_rgba(0,0,0,0.5)] overflow-hidden relative -mr-16 transform rotate-12 translate-y-12 z-0 border border-white/10">
                                <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url('${cards[4].image_url_normal}')` }}></div>
                                <div className="absolute inset-0 bg-black/40 hover:bg-transparent transition-colors"></div>
                            </div>
                        </>
                    )}
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-light-bg dark:bg-black/90 text-light-text/70 dark:text-gray-500 py-16 border-t border-light-primary/10 dark:border-white/5 relative z-10">
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12 text-xs">
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 cursor-pointer group">
                            <div className="size-8 text-primary flex items-center justify-center border border-primary/40 rounded-full group-hover:bg-primary/10 transition-all">
                                <span className="material-symbols-outlined text-[20px]">playing_cards</span>
                            </div>
                            <span className="text-lg font-display font-bold tracking-[0.2em] text-primary uppercase">Mana Nexus</span>
                        </div>
                        <p className="leading-relaxed opacity-70">
                            The ultimate database for card game enthusiasts. Powerful search, community tools, and real-time pricing.
                        </p>
                        <div className="flex gap-4">
                            <span className="material-symbols-outlined cursor-pointer hover:text-[#D4AF37] transition-colors">public</span>
                            <span className="material-symbols-outlined cursor-pointer hover:text-[#D4AF37] transition-colors">rss_feed</span>
                            <span className="material-symbols-outlined cursor-pointer hover:text-[#D4AF37] transition-colors">forum</span>
                        </div>
                    </div>
                    <div>
                        <h4 className="font-display font-bold text-[#D4AF37] tracking-[0.2em] uppercase mb-6">Card Data</h4>
                        <ul className="space-y-3 font-medium tracking-wide">
                            <li className="hover:text-white cursor-pointer transition-colors">Advanced Search</li>
                            <li className="hover:text-white cursor-pointer transition-colors">Syntax Guide</li>
                            <li className="hover:text-white cursor-pointer transition-colors">All Sets</li>
                            <li className="hover:text-white cursor-pointer transition-colors">API Documentation</li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-display font-bold text-[#D4AF37] tracking-[0.2em] uppercase mb-6">Tools</h4>
                        <ul className="space-y-3 font-medium tracking-wide">
                            <li className="hover:text-white cursor-pointer transition-colors">Deckbuilder</li>
                            <li className="hover:text-white cursor-pointer transition-colors">Collection Manager</li>
                            <li className="hover:text-white cursor-pointer transition-colors">Price Trends</li>
                            <li className="hover:text-white cursor-pointer transition-colors">Top Cards</li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-display font-bold text-[#D4AF37] tracking-[0.2em] uppercase mb-6">Legal</h4>
                        <ul className="space-y-3 font-medium tracking-wide">
                            <li className="hover:text-white cursor-pointer transition-colors">Terms of Service</li>
                            <li className="hover:text-white cursor-pointer transition-colors">Privacy Policy</li>
                            <li className="hover:text-white cursor-pointer transition-colors">Cookie Policy</li>
                            <li className="hover:text-white cursor-pointer transition-colors">DMCA</li>
                        </ul>
                    </div>
                </div>
                <div className="max-w-7xl mx-auto px-6 mt-16 pt-8 border-t border-white/5 text-center text-[10px] tracking-[0.1em] uppercase opacity-50">
                    <p>© 2023 Mana Nexus LLC. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};

export default Dashboard;
