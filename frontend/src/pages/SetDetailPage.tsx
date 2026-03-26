import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';

interface CardData {
    edition_id: string;
    rarity: string;
    artist: string;
    collector_number: string;
    image_url_normal: string;
    image_url_small: string;
    Card: {
        card_id: string;
        name: string;
        Card_Faces?: Array<{
            name: string;
            mana_cost: string;
            oracle_text: string;
        }>;
    };
}

interface SetData {
    set_code: string;
    set_name: string;
    release_date: string;
    set_type: string;
    card_count: number;
}

interface ApiResponse {
    set: SetData;
    cards: CardData[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

const SetDetailPage: React.FC = () => {
    const { code } = useParams<{ code: string }>();
    const [data, setData] = useState<ApiResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [sortBy, setSortBy] = useState<string>('collector_number');
    const [displayMode, setDisplayMode] = useState<'grid' | 'list'>('grid');

    useEffect(() => {
        if (code) {
            fetchSetData();
        }
    }, [code, page, sortBy]);

    const fetchSetData = async () => {
        try {
            setLoading(true);
            const response = await fetch(
                `http://localhost:3000/api/sets/${code}?page=${page}&limit=60&sort=${sortBy}`
            );
            if (!response.ok) throw new Error('Failed to fetch set data');
            const result = await response.json();
            setData(result);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateStr: string) => {
        if (!dateStr) return '—';
        return new Date(dateStr).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getRarityColor = (rarity: string) => {
        const colors: Record<string, string> = {
            'common': 'text-slate-400',
            'uncommon': 'text-slate-300',
            'rare': 'text-amber-400',
            'mythic': 'text-orange-500',
        };
        return colors[rarity?.toLowerCase()] || 'text-slate-400';
    };

    if (loading && !data) {
        return (
            <div className="bg-light-bg dark:bg-[#050505] min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin w-8 h-8 border-2 border-light-primary dark:border-[#D4AF37] border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-light-text/50 dark:text-slate-500">Loading set...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-light-bg dark:bg-[#050505] min-h-screen flex items-center justify-center">
                <div className="text-center text-red-500">
                    <p>Error: {error}</p>
                    <Link to="/sets" className="text-light-primary dark:text-[#D4AF37] hover:underline mt-4 inline-block">
                        ← Back to Sets
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-light-bg dark:bg-[#050505] text-light-text dark:text-slate-300 min-h-screen font-sans">
            {/* Navbar */}
            <Navbar />

            {/* Set Header */}
            <div className="bg-white/50 dark:bg-[#12121A] border-b border-light-primary/10 dark:border-white/5 pt-28">
                <div className="max-w-7xl mx-auto px-4 py-6">
                    <div className="flex items-center gap-4 mb-4">
                        <Link to="/sets" className="text-light-primary dark:text-slate-500 hover:text-light-secondary dark:hover:text-[#D4AF37] transition-colors">
                            ← Sets
                        </Link>
                    </div>
                    <div className="flex items-center gap-4">
                        <i className={`ss ss-${code?.toLowerCase()} ss-4x text-light-primary dark:text-slate-300`}></i>
                        <div>
                            <h1 className="text-2xl font-display text-light-text dark:text-white">
                                {data?.set.set_name}
                                <span className="ml-2 text-sm text-light-text/40 dark:text-slate-500 uppercase">({data?.set.set_code})</span>
                            </h1>
                            <p className="text-light-text/60 dark:text-slate-500">
                                {data?.set.card_count} cards • Released {formatDate(data?.set.release_date || '')}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Controls */}
                <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4 border-t border-light-primary/5 dark:border-white/5">
                    <select
                        value={displayMode}
                        onChange={(e) => setDisplayMode(e.target.value as 'grid' | 'list')}
                        className="bg-white dark:bg-[#050505] border border-light-primary/20 dark:border-white/10 px-3 py-1.5 rounded text-sm text-light-text dark:text-white"
                    >
                        <option value="grid">Images</option>
                        <option value="list">List</option>
                    </select>
                    <span className="text-light-text/50 dark:text-slate-400 text-sm">sorted by</span>
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="bg-white dark:bg-[#050505] border border-light-primary/20 dark:border-white/10 px-3 py-1.5 rounded text-sm text-light-text dark:text-white"
                    >
                        <option value="collector_number">Set/Number</option>
                        <option value="rarity">Rarity</option>
                    </select>
                </div>
            </div>

            {/* Cards Grid */}
            <div className="max-w-7xl mx-auto px-4 pt-28 pb-8">
                {data?.cards && data.cards.length > 0 ? (
                    <>
                        <div className="text-center text-light-text/50 dark:text-slate-500 mb-6">
                            CARDS • {data.pagination.total} CARDS
                        </div>

                        <div className={`${displayMode === 'grid'
                            ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4'
                            : 'space-y-2'
                            }`}>
                            {data.cards.map((card) => (
                                displayMode === 'grid' ? (
                                    <div
                                        key={card.edition_id}
                                        className="group cursor-pointer"
                                    >
                                        {card.image_url_normal || card.image_url_small ? (
                                            <img
                                                src={card.image_url_small || card.image_url_normal}
                                                alt={card.Card?.name}
                                                className="w-full rounded-lg shadow-md group-hover:shadow-xl group-hover:scale-105 transition-all duration-200"
                                                loading="lazy"
                                            />
                                        ) : (
                                            <div className="aspect-[2.5/3.5] bg-light-primary/5 dark:bg-[#1A1A24] rounded-lg flex items-center justify-center">
                                                <span className="text-light-text/50 dark:text-slate-500 text-xs text-center px-2">
                                                    {card.Card?.name || 'No Image'}
                                                </span>
                                            </div>
                                        )}
                                        <p className="mt-2 text-xs text-light-text/70 dark:text-slate-400 truncate">
                                            {card.Card?.name}
                                        </p>
                                    </div>
                                ) : (
                                    <div
                                        key={card.edition_id}
                                        className="flex items-center gap-4 p-3 bg-white/50 dark:bg-[#12121A] rounded border border-light-primary/10 dark:border-white/10 hover:border-light-primary/50 dark:hover:border-[#D4AF37]/50 transition-colors cursor-pointer"
                                    >
                                        <span className="text-light-text/50 dark:text-slate-500 text-sm w-12">{card.collector_number}</span>
                                        <span className="flex-grow text-light-text dark:text-white">{card.Card?.name}</span>
                                        <span className={`text-sm ${getRarityColor(card.rarity)}`}>
                                            {card.rarity}
                                        </span>
                                        <span className="text-light-text/50 dark:text-slate-500 text-sm">{card.artist}</span>
                                    </div>
                                )
                            ))}
                        </div>

                        {/* Pagination */}
                        {data.pagination.totalPages > 1 && (
                            <div className="flex justify-center gap-2 mt-8">
                                <button
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="px-4 py-2 bg-white/50 dark:bg-[#12121A] border border-light-primary/20 dark:border-white/10 rounded disabled:opacity-50 hover:border-light-primary dark:hover:border-[#D4AF37] transition-colors"
                                >
                                    ← Previous
                                </button>
                                <span className="px-4 py-2 text-light-text/70 dark:text-slate-400">
                                    Page {page} of {data.pagination.totalPages}
                                </span>
                                <button
                                    onClick={() => setPage(p => Math.min(data.pagination.totalPages, p + 1))}
                                    disabled={page === data.pagination.totalPages}
                                    className="px-4 py-2 bg-white/50 dark:bg-[#12121A] border border-light-primary/20 dark:border-white/10 rounded disabled:opacity-50 hover:border-light-primary dark:hover:border-[#D4AF37] transition-colors"
                                >
                                    Next →
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="text-center py-20 text-light-text/50 dark:text-slate-500">
                        No cards found in this set.
                    </div>
                )}
            </div>
        </div>
    );
};

export default SetDetailPage;
