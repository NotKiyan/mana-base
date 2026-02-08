import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import ThemeToggle from '../components/ThemeToggle';

// Card type for deck entries
interface DeckCard {
    quantity: number;
    name: string;
    manaCost: string;
}

// Mana symbol component - renders mana cost symbols with actual icons
const ManaSymbol: React.FC<{ symbol: string }> = ({ symbol }) => {
    // Map mana symbols to icon file names
    const getIconUrl = (sym: string): string | null => {
        const iconMap: Record<string, string> = {
            'W': 'WhiteMana.png',
            'U': 'BlueMana.png',
            'B': 'BlackMana.png',
            'R': 'RedMana.png',
            'G': 'GreenMana.png',
            'C': 'ColourslessMana.png',
        };
        return iconMap[sym] ? `http://localhost:3000/icons/mana/${iconMap[sym]}` : null;
    };

    const iconUrl = getIconUrl(symbol);

    // If we have an icon, show the image
    if (iconUrl) {
        return (
            <img
                src={iconUrl}
                alt={symbol}
                className="w-5 h-5 rounded-full object-cover"
            />
        );
    }

    // For numeric (colorless mana) or unknown symbols, show a styled circle
    return (
        <span
            className="inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-200 border border-gray-400"
        >
            {symbol}
        </span>
    );
};

// Parse mana cost string like "{5}{R}" into array ["5", "R"]
const parseManaSymbols = (manaCost: string): string[] => {
    if (!manaCost) return [];
    const matches = manaCost.match(/\{([^}]+)\}/g);
    if (!matches) return [];
    return matches.map(m => m.replace(/[{}]/g, ''));
};

const DeckEditor: React.FC = () => {
    const { id: _id } = useParams(); // Will be used when fetching real deck data
    const [deckName, setDeckName] = useState('New Deck');
    const [description, setDescription] = useState('');

    // Card state for both columns
    const [cardsColA, setCardsColA] = useState<DeckCard[]>([]);
    const [cardsColB, setCardsColB] = useState<DeckCard[]>([]);

    // Input state
    const [inputColA, setInputColA] = useState('');
    const [inputColB, setInputColB] = useState('');

    // Loading/error state
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Handle adding a card to a column
    const handleAddCard = async (column: 'A' | 'B', cardName: string) => {
        if (!cardName.trim()) return;

        setLoading(true);
        setError(null);

        try {
            const response = await axios.get(`http://localhost:3000/api/cards/search?q=${encodeURIComponent(cardName.trim())}`);

            if (response.data && response.data.length > 0) {
                const edition = response.data[0];
                const card = edition.Card;
                const cardFaces = card?.CardFaces || [];

                // Get mana cost from the first card face
                const manaCost = cardFaces.length > 0 ? cardFaces[0].mana_cost || '' : '';

                const newCard: DeckCard = {
                    quantity: 1,
                    name: card?.name || cardName,
                    manaCost: manaCost
                };

                if (column === 'A') {
                    // Check if card already exists, increment quantity
                    const existingIndex = cardsColA.findIndex(c => c.name.toLowerCase() === newCard.name.toLowerCase());
                    if (existingIndex >= 0) {
                        const updated = [...cardsColA];
                        updated[existingIndex].quantity += 1;
                        setCardsColA(updated);
                    } else {
                        setCardsColA([...cardsColA, newCard]);
                    }
                    setInputColA('');
                } else {
                    const existingIndex = cardsColB.findIndex(c => c.name.toLowerCase() === newCard.name.toLowerCase());
                    if (existingIndex >= 0) {
                        const updated = [...cardsColB];
                        updated[existingIndex].quantity += 1;
                        setCardsColB(updated);
                    } else {
                        setCardsColB([...cardsColB, newCard]);
                    }
                    setInputColB('');
                }
            } else {
                setError(`Card "${cardName}" not found`);
            }
        } catch (err) {
            console.error('Failed to search card:', err);
            setError('Failed to search for card');
        } finally {
            setLoading(false);
        }
    };

    // Handle Enter key press
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, column: 'A' | 'B') => {
        if (e.key === 'Enter') {
            const value = column === 'A' ? inputColA : inputColB;
            handleAddCard(column, value);
        }
    };

    // Calculate total cards
    const totalCardsColA = cardsColA.reduce((sum, c) => sum + c.quantity, 0);
    const totalCardsColB = cardsColB.reduce((sum, c) => sum + c.quantity, 0);

    return (
        <div className="bg-light-bg dark:bg-[#050508] text-light-text dark:text-gray-200 font-sans min-h-screen flex flex-col antialiased selection:bg-light-primary dark:selection:bg-purple-500 selection:text-white">
            {/* Header Section */}
            <header className="bg-light-bg border-b border-light-primary/10 dark:bg-[#08080A] dark:border-white/5 pt-8 pb-6 px-8">
                <div className="max-w-[1600px] mx-auto">
                    <div className="flex flex-col gap-4 mb-8">
                        {/* Editable Title */}
                        <input
                            type="text"
                            value={deckName}
                            onChange={(e) => setDeckName(e.target.value)}
                            className="bg-transparent border-none text-5xl font-display font-bold text-light-primary dark:text-[#7C3AED] focus:ring-0 placeholder-light-primary/50 dark:placeholder-purple-900/50 p-0 w-full"
                            placeholder="Untitled Deck"
                        />
                        {/* Description Input */}
                        <input
                            type="text"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="bg-transparent border-none text-gray-500 text-sm focus:ring-0 p-0 w-full"
                            placeholder="Enter a deck description..."
                        />
                    </div>

                    {/* Toolbar */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            {/* File/Deck Dropdown */}
                            <div className="relative group">
                                <button className="flex items-center gap-2 px-4 py-2 bg-white/50 border border-light-primary/20 dark:bg-[#12121A] dark:border-white/10 rounded-md text-sm font-medium hover:border-light-primary/50 dark:hover:border-purple-500/50 transition-colors text-light-text dark:text-gray-200">
                                    File/Deck
                                    <span className="material-symbols-outlined text-sm">expand_more</span>
                                </button>
                            </div>
                            {/* Export Dropdown */}
                            <div className="relative group">
                                <button className="flex items-center gap-2 px-4 py-2 bg-white/50 border border-light-primary/20 dark:bg-[#12121A] dark:border-white/10 rounded-md text-sm font-medium hover:border-light-primary/50 dark:hover:border-purple-500/50 transition-colors text-light-text dark:text-gray-200">
                                    Export
                                    <span className="material-symbols-outlined text-sm">expand_more</span>
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <ThemeToggle />
                            {/* Clean Up Button */}
                            <button className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-light-text dark:hover:text-white transition-colors text-sm font-medium">
                                <span className="material-symbols-outlined text-sm">cleaning_services</span>
                                Clean Up
                            </button>
                            {/* Done Editing Button */}
                            <Link to="/profile">
                                <button className="flex items-center gap-2 px-6 py-2 bg-light-primary dark:bg-[#7C3AED] hover:bg-light-secondary dark:hover:bg-[#6D28D9] text-white rounded-md text-sm font-bold tracking-wide transition-all shadow-[0_0_15px_rgba(90,4,150,0.3)] dark:shadow-[0_0_15px_rgba(124,58,237,0.3)]">
                                    <span className="material-symbols-outlined text-sm">check</span>
                                    Done Editing
                                </button>
                            </Link>
                        </div>
                    </div>

                    {/* Error message */}
                    {error && (
                        <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-md text-red-500 text-sm">
                            {error}
                        </div>
                    )}
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-grow flex overflow-hidden h-[calc(100vh-200px)]">
                <div className="flex-1 overflow-y-auto p-8">
                    <div className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">

                        {/* Column A */}
                        <div className="flex flex-col h-full bg-white/50 border border-light-primary/10 dark:bg-[#0F0F12] dark:border-white/5 rounded-lg overflow-hidden">
                            <div className="bg-light-primary/5 dark:bg-[#12121A] px-4 py-3 border-b border-light-primary/10 dark:border-white/5 flex items-center justify-between">
                                <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Column A</span>
                                <span className="text-xs font-bold text-light-primary dark:text-purple-500 uppercase tracking-widest">{totalCardsColA}/60 Cards</span>
                            </div>
                            <div className="flex-1 overflow-y-auto p-2 space-y-1">
                                {cardsColA.map((card, idx) => (
                                    <div key={idx} className="group flex items-center gap-3 px-3 py-2 hover:bg-light-primary/5 dark:hover:bg-white/5 rounded-md cursor-pointer transition-colors border border-transparent hover:border-light-primary/10 dark:hover:border-white/5">
                                        <span className="text-gray-400 font-mono font-bold w-6 text-right">{card.quantity}</span>
                                        <span className="text-light-text dark:text-gray-200 font-medium flex-1">{card.name}</span>
                                        <div className="flex items-center gap-1">
                                            {parseManaSymbols(card.manaCost).map((symbol, i) => (
                                                <ManaSymbol key={i} symbol={symbol} />
                                            ))}
                                        </div>
                                        <button className="opacity-0 group-hover:opacity-100 p-1 hover:text-light-text dark:hover:text-white text-gray-500 transition-opacity">
                                            <span className="material-symbols-outlined text-base">more_horiz</span>
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <div className="p-3 border-t border-light-primary/10 dark:border-white/5 bg-light-primary/5 dark:bg-[#12121A]">
                                <input
                                    className="w-full bg-white dark:bg-[#08080A] border border-light-primary/20 dark:border-white/10 rounded px-3 py-2 text-sm text-light-text dark:text-gray-300 placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:border-light-primary dark:focus:border-purple-500/50 focus:ring-1 focus:ring-light-primary dark:focus:ring-purple-500/50 transition-all"
                                    placeholder={loading ? 'Searching...' : 'Type a card name and press Enter...'}
                                    value={inputColA}
                                    onChange={(e) => setInputColA(e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(e, 'A')}
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        {/* Column B */}
                        <div className="flex flex-col h-full bg-white/50 border border-light-primary/10 dark:bg-[#0F0F12] dark:border-white/5 rounded-lg overflow-hidden">
                            <div className="bg-light-primary/5 dark:bg-[#12121A] px-4 py-3 border-b border-light-primary/10 dark:border-white/5 flex items-center justify-between">
                                <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Column B</span>
                                <span className="text-xs font-bold text-light-primary dark:text-purple-500 uppercase tracking-widest">{totalCardsColB}/60 Cards</span>
                            </div>
                            <div className="flex-1 overflow-y-auto p-2 space-y-1">
                                {cardsColB.map((card, idx) => (
                                    <div key={idx} className="group flex items-center gap-3 px-3 py-2 hover:bg-light-primary/5 dark:hover:bg-white/5 rounded-md cursor-pointer transition-colors border border-transparent hover:border-light-primary/10 dark:hover:border-white/5">
                                        <span className="text-gray-400 font-mono font-bold w-6 text-right">{card.quantity}</span>
                                        <span className="text-light-text dark:text-gray-200 font-medium flex-1">{card.name}</span>
                                        <div className="flex items-center gap-1">
                                            {parseManaSymbols(card.manaCost).map((symbol, i) => (
                                                <ManaSymbol key={i} symbol={symbol} />
                                            ))}
                                        </div>
                                        <button className="opacity-0 group-hover:opacity-100 p-1 hover:text-light-text dark:hover:text-white text-gray-500 transition-opacity">
                                            <span className="material-symbols-outlined text-base">more_horiz</span>
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <div className="p-3 border-t border-light-primary/10 dark:border-white/5 bg-light-primary/5 dark:bg-[#12121A]">
                                <input
                                    className="w-full bg-white dark:bg-[#08080A] border border-light-primary/20 dark:border-white/10 rounded px-3 py-2 text-sm text-light-text dark:text-gray-300 placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:border-light-primary dark:focus:border-purple-500/50 focus:ring-1 focus:ring-light-primary dark:focus:ring-purple-500/50 transition-all"
                                    placeholder={loading ? 'Searching...' : 'Type a card name and press Enter...'}
                                    value={inputColB}
                                    onChange={(e) => setInputColB(e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(e, 'B')}
                                    disabled={loading}
                                />
                            </div>
                        </div>

                    </div>
                </div>

                {/* Sidebar (Curve) */}
                <aside className="w-80 bg-light-bg border-l border-light-primary/10 dark:bg-[#08080A] dark:border-white/5 p-8 flex flex-col hidden xl:flex">
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-8">Curve</h3>

                    <div className="flex-1 flex flex-col gap-2">
                        {/* Histogram - will be dynamic in future */}
                        {[0, 1, 2, 3, 4, 5, 6, 7].map((cmc) => (
                            <div key={cmc} className="flex items-center gap-3 h-8">
                                <span className="text-[10px] text-gray-600 font-mono w-8 text-right">CMC {cmc === 7 ? '7+' : cmc}</span>
                                <div className="flex-1 h-full bg-light-primary/5 dark:bg-[#12121A] rounded-sm relative group overflow-hidden">
                                    {/* Placeholder bars */}
                                </div>
                            </div>
                        ))}
                    </div>
                </aside>
            </main>
        </div>
    );
};

export default DeckEditor;

