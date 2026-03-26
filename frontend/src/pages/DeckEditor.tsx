import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import API_URL from '../config';

// Card type for deck entries
interface DeckCard {
    quantity: number;
    name: string;
    manaCost: string;
    card_id: string;
    column: 'main' | 'side';
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
        return iconMap[sym] ? `${API_URL}/icons/mana/${iconMap[sym]}` : null;
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

const calculateCMC = (manaCost: string): number => {
    const symbols = parseManaSymbols(manaCost);
    let cmc = 0;
    for (const sym of symbols) {
        const num = parseInt(sym);
        if (!isNaN(num)) cmc += num;
        else if (['W', 'U', 'B', 'R', 'G', 'C', 'S', 'X'].includes(sym.toUpperCase())) cmc += 1;
        // Handle hybrid/split
        else if (sym.includes('/')) cmc += 1;
    }
    return cmc;
};

const DeckEditor: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [deckName, setDeckName] = useState('New Deck');
    const [description, setDescription] = useState('');
    const [format, setFormat] = useState('Other');
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

    // Card state for both columns
    const [cardsColA, setCardsColA] = useState<DeckCard[]>([]);
    const [cardsColB, setCardsColB] = useState<DeckCard[]>([]);

    // Input state
    const [inputColA, setInputColA] = useState('');
    const [inputColB, setInputColB] = useState('');

    // Loading/error state
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Load deck from backend on mount (if id is a real Mongo ObjectId, not 'new')
    useEffect(() => {
        const isExisting = id && id !== 'new';
        if (!isExisting) return;

        const fetchDeck = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get(`${API_URL}/api/decks/${id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const deck = res.data;
                setDeckName(deck.name || 'New Deck');
                setDescription(deck.description || '');
                setFormat(deck.format || 'Other');

                // Rebuild card columns from saved cards
                const main: DeckCard[] = [];
                const side: DeckCard[] = [];
                for (const c of deck.cards) {
                    const cardObj: DeckCard = {
                        card_id: c.card_id,
                        name: c.name,
                        quantity: c.quantity,
                        manaCost: c.mana_cost || (c as any).manaCost || '',
                        column: c.column,
                    };
                    if (c.column === 'side') side.push(cardObj);
                    else main.push(cardObj);
                }
                console.log('Loaded deck cards:', main);
                setCardsColA(main);
                setCardsColB(side);
            } catch (err) {
                console.error('Failed to load deck:', err);
            }
        };
        fetchDeck();
    }, [id]);

    // Save deck to backend
    const handleSaveDeck = async () => {
        setSaveStatus('saving');
        try {
            const token = localStorage.getItem('token');
            const payload = {
                name: deckName,
                description,
                format,
                cards: [
                    ...cardsColA.map(c => {
                        const mCost = c.manaCost || (c as any).mana_cost || '';
                        return {
                            card_id: c.card_id,
                            name: c.name,
                            quantity: c.quantity,
                            column: 'main',
                            mana_cost: mCost,
                            cmc: calculateCMC(mCost)
                        };
                    }),
                    ...cardsColB.map(c => {
                        const mCost = c.manaCost || (c as any).mana_cost || '';
                        return {
                            card_id: c.card_id,
                            name: c.name,
                            quantity: c.quantity,
                            column: 'side',
                            mana_cost: mCost,
                            cmc: calculateCMC(mCost)
                        };
                    }),
                ],
            };

            console.log('Saving deck payload:', payload);

            const isExisting = id && id !== 'new';
            if (isExisting) {
                await axios.put(`${API_URL}/api/decks/${id}`, payload, {
                    headers: { Authorization: `Bearer ${token}` },
                });
            } else {
                const res = await axios.post(`${API_URL}/api/decks`, payload, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                // Navigate to the persisted deck URL
                navigate(`/deck/${res.data._id}`, { replace: true });
            }
            setSaveStatus('saved');
            setTimeout(() => setSaveStatus('idle'), 2500);
        } catch (err: any) {
            console.error('Failed to save deck:', err);
            const serverMsg = err?.response?.data?.message || 'Failed to save deck. Please try again.';
            setError(serverMsg);
            setSaveStatus('error');
            setTimeout(() => setSaveStatus('idle'), 3000);
        }
    };

    // Handle adding a card to a column
    const handleAddCard = async (column: 'main' | 'side', cardName: string) => {
        if (!cardName.trim()) return;

        setLoading(true);
        setError(null);

        try {
            const response = await axios.get(`${API_URL}/api/cards/search?q=${encodeURIComponent(cardName.trim())}`);

            if (response.data && response.data.length > 0) {
                const edition = response.data[0];
                const card = edition.Card;
                const cardFaces = card?.CardFaces || card?.card_faces || [];

                // Get mana cost from the first card face or directly from card
                let manaCost = '';
                if (cardFaces.length > 0) {
                    manaCost = cardFaces[0].mana_cost || cardFaces[0].manaCost || '';
                } else {
                    manaCost = card?.mana_cost || card?.manaCost || '';
                }

                const newCard: DeckCard = {
                    quantity: 1,
                    name: card?.name || cardName,
                    manaCost: manaCost,
                    card_id: card?.card_id || edition?.card_id || '',
                    column,
                };

                console.log('Adding new card to state:', newCard);

                if (column === 'main') {
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
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, column: 'main' | 'side') => {
        if (e.key === 'Enter') {
            const value = column === 'main' ? inputColA : inputColB;
            handleAddCard(column, value);
        }
    };

    // Calculate total cards
    const totalCardsColA = cardsColA.reduce((sum, c) => sum + c.quantity, 0);
    const totalCardsColB = cardsColB.reduce((sum, c) => sum + c.quantity, 0);

    // Calculate Mana Curve (from Main Deck only)
    const curveCounts = [0, 1, 2, 3, 4, 5, 6, 7].map(cmc => {
        return cardsColA.reduce((sum, card) => {
            const cardCMC = calculateCMC(card.manaCost);
            if (cmc === 7) return cardCMC >= 7 ? sum + card.quantity : sum;
            return cardCMC === cmc ? sum + card.quantity : sum;
        }, 0);
    });
    const maxCount = Math.max(...curveCounts, 1);

    return (
        <div className="bg-light-bg dark:bg-[#050508] text-light-text dark:text-gray-200 font-sans min-h-screen flex flex-col antialiased selection:bg-light-primary dark:selection:bg-purple-500 selection:text-white">
            {/* Navbar */}
            <Navbar />

            {/* Header Section */}
            <div className="bg-light-bg border-b border-light-primary/10 dark:bg-[#08080A] dark:border-white/5 pt-28 pb-6 px-8">
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
                            {/* Format Selector */}
                            <select
                                value={format}
                                onChange={(e) => setFormat(e.target.value)}
                                className="px-4 py-2 bg-white/50 border border-light-primary/20 dark:bg-[#12121A] dark:border-white/10 rounded-md text-sm font-medium text-light-text dark:text-gray-200 focus:outline-none focus:border-light-primary dark:focus:border-purple-500/50 transition-colors"
                            >
                                {['Standard', 'Pioneer', 'Modern', 'Legacy', 'Vintage', 'Commander', 'Pauper', 'Draft', 'Sealed', 'Other'].map(f => (
                                    <option key={f} value={f}>{f}</option>
                                ))}
                            </select>
                        </div>

                        <div className="flex items-center gap-4">
                            {/* Save Deck Button */}
                            <button
                                onClick={handleSaveDeck}
                                disabled={saveStatus === 'saving'}
                                className={`flex items-center gap-2 px-6 py-2 rounded-md text-sm font-bold tracking-wide transition-all ${saveStatus === 'saved' ? 'bg-green-600 text-white' :
                                    saveStatus === 'error' ? 'bg-red-600 text-white' :
                                        'bg-light-primary dark:bg-[#7C3AED] hover:bg-light-secondary dark:hover:bg-[#6D28D9] text-white shadow-[0_0_15px_rgba(124,58,237,0.3)]'
                                    }`}
                            >
                                <span className="material-symbols-outlined text-sm">
                                    {saveStatus === 'saving' ? 'progress_activity' : saveStatus === 'saved' ? 'check_circle' : saveStatus === 'error' ? 'error' : 'save'}
                                </span>
                                {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? 'Saved!' : saveStatus === 'error' ? 'Error' : 'Save Deck'}
                            </button>
                            {/* Done Editing Button */}
                            <Link to="/profile">
                                <button className="flex items-center gap-2 px-6 py-2 bg-white/50 border border-light-primary/20 dark:bg-[#12121A] dark:border-white/10 hover:border-light-primary/50 dark:hover:border-purple-500/50 text-light-text dark:text-gray-200 rounded-md text-sm font-bold tracking-wide transition-all">
                                    <span className="material-symbols-outlined text-sm">check</span>
                                    Done
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
            </div>


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
                                    onKeyDown={(e) => handleKeyDown(e, 'main')}
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
                                    onKeyDown={(e) => handleKeyDown(e, 'side')}
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
                        {/* Histogram - Dynamic Calculation */}
                        {[0, 1, 2, 3, 4, 5, 6, 7].map((cmc) => {
                            const count = curveCounts[cmc] || 0;
                            const percentage = (count / maxCount) * 100;
                            return (
                                <div key={cmc} className="flex items-center gap-3 h-8 group/row">
                                    <span className="text-[10px] text-gray-600 font-mono w-8 text-right group-hover/row:text-light-primary dark:group-hover/row:text-purple-400 transition-colors">
                                        CMC {cmc === 7 ? '7+' : cmc}
                                    </span>
                                    <div className="flex-1 h-full bg-light-primary/5 dark:bg-white/5 rounded-sm relative group overflow-hidden border border-transparent hover:border-light-primary/20 dark:hover:border-purple-500/20 transition-all">
                                        <div
                                            className="absolute inset-y-0 left-0 bg-gradient-to-r from-light-primary/40 to-light-secondary/60 dark:from-purple-600/40 dark:to-purple-500/60 transition-all duration-500 ease-out"
                                            style={{ width: count > 0 ? `${percentage}%` : '0%' }}
                                        />
                                        {count > 0 && (
                                            <span className="absolute inset-y-0 left-2 flex items-center text-[10px] font-bold text-gray-500 dark:text-gray-400 opacity-0 group-hover/row:opacity-100 transition-opacity">
                                                {count} {count === 1 ? 'Card' : 'Cards'}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </aside>
            </main>
        </div>
    );
};

export default DeckEditor;

