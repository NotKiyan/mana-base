import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useSearchParams, Link } from 'react-router-dom';

interface CardData {
    edition_id: string;
    image_url_normal: string;
    Card: {
        name: string;
    }
}

const SearchResults: React.FC = () => {
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q');
    const [cards, setCards] = useState<CardData[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchResults = async () => {
            if (!query) return;
            setLoading(true);
            try {
                const res = await axios.get(`http://localhost:3000/api/cards/search?q=${query}`);
                setCards(res.data);
            } catch (err) {
                console.error('Search failed', err);
            }
            setLoading(false);
        };
        fetchResults();
    }, [query]);

    return (
        <div className="bg-[#050508] text-gray-200 font-sans min-h-screen flex flex-col antialiased selection:bg-[#FFD700] selection:text-black">
            {/* Header */}
            <header className="fixed top-0 w-full z-50 transition-all duration-300 border-b border-primary/20 bg-black/40 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-20">
                        <Link to="/dashboard" className="flex items-center gap-3 cursor-pointer group">
                            <div className="size-10 text-primary flex items-center justify-center border border-primary/40 rounded-full group-hover:bg-primary/10 transition-all">
                                <span className="material-symbols-outlined text-[28px]">playing_cards</span>
                            </div>
                            <span className="text-2xl font-display font-bold tracking-[0.2em] text-primary uppercase">Mana Nexus</span>
                        </Link>
                        <div className="hidden md:flex items-center gap-6">
                            <Link to="/advanced" className="text-xs font-display tracking-widest text-[#d4af35] hover:text-white transition-colors uppercase flex items-center gap-1">
                                <span className="material-symbols-outlined text-sm">auto_stories</span>
                                Advanced
                            </Link>
                            {localStorage.getItem('token') ? (
                                <Link to="/profile">
                                    <div className="size-10 rounded-full bg-primary/20 border border-primary/50 flex items-center justify-center text-primary">
                                        <span className="material-symbols-outlined">person</span>
                                    </div>
                                </Link>
                            ) : (
                                <Link to="/login" className="text-xs font-display tracking-widest text-gray-400 hover:text-white transition-colors uppercase">
                                    Log In
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            <main className="flex-grow pt-32 pb-24 px-4 max-w-[1600px] mx-auto w-full">
                <div className="flex items-center justify-between mb-8 border-b border-white/10 pb-4">
                    <h1 className="text-xl font-display font-bold text-[#d4af35]">Search Results: "{query}"</h1>
                    <div className="flex items-center gap-4 text-xs text-gray-500 uppercase tracking-widest">
                        <span>Sort by: Name</span>
                        <span>View: Grid</span>
                    </div>
                </div>

                {loading ? (
                    <p className="text-gray-400 text-center mt-20">Searching the archives...</p>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                        {cards.map((card) => (
                            <div key={card.edition_id} className="relative group rounded-[4.5%] overflow-hidden shadow-lg hover:shadow-[0_0_20px_rgba(212,175,53,0.3)] transition-all duration-200">
                                <img src={card.image_url_normal} alt={card.Card.name} className="w-full h-auto object-cover bg-[#101010]" loading="lazy" />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors"></div>
                            </div>
                        ))}
                    </div>
                )}
                {!loading && cards.length === 0 && (
                    <div className="text-center mt-20">
                        <span className="material-symbols-outlined text-6xl text-gray-700 mb-4">search_off</span>
                        <p className="text-gray-500 italic">No scrolls found matching your query.</p>
                    </div>
                )}
            </main>
        </div>
    );
};

export default SearchResults;
