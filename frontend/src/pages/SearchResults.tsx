import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

interface CardData {
    edition_id: string;
    image_url_normal: string;
    Card: {
        card_id: string;
        name: string;
    }
}

const SearchResults: React.FC = () => {
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q');
    const [cards, setCards] = useState<CardData[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState(query || '');
    const navigate = useNavigate();

    const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            navigate(`/search?q=${searchQuery}`);
        }
    };

    useEffect(() => {
        const fetchResults = async () => {
            setLoading(true);
            try {
                let url = '';
                if (query) {
                    // Basic search
                    url = `http://localhost:3000/api/cards/search?q=${encodeURIComponent(query)}`;
                } else {
                    // Advanced search - pass all search params
                    const queryString = searchParams.toString();
                    if (!queryString) {
                        setLoading(false);
                        return;
                    }
                    url = `http://localhost:3000/api/cards/advanced?${queryString}`;
                }

                const res = await axios.get(url);
                setCards(res.data);
            } catch (err) {
                console.error('Search failed', err);
                setCards([]);
            }
            setLoading(false);
        };
        fetchResults();
    }, [searchParams, query]);

    return (
        <div className="bg-[#050508] text-gray-200 font-sans min-h-screen flex flex-col antialiased selection:bg-[#FFD700] selection:text-black">
            {/* Navbar */}
            <Navbar
                showSearch={true}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onSearchKeyDown={handleSearch}
            />

            <main className="flex-grow pt-44 pb-24 px-4 max-w-[1600px] mx-auto w-full">
                <div className="flex items-center justify-between mb-8 border-b border-white/10 pb-4">
                    <h1 className="text-xl font-display font-bold text-[#d4af35]">
                        {query ? `Search Results: "${query}"` : "Advanced Search Results"}
                    </h1>
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
                            <Link key={card.edition_id} to={`/card/${card.Card.card_id}`} className="relative group rounded-[4.5%] overflow-hidden shadow-lg hover:shadow-[0_0_20px_rgba(212,175,53,0.3)] transition-all duration-200">
                                <img src={card.image_url_normal} alt={card.Card.name} className="w-full h-auto object-cover bg-[#101010]" loading="lazy" />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors"></div>
                            </Link>
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
