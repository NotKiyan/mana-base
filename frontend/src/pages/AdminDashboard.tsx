import React, { useState } from 'react';
import axios from 'axios';
import ThemeToggle from '../components/ThemeToggle';
import API_URL from '../config';

interface CardFaceData {
    name: string;
    mana_cost: string;
    cmc: number;
    oracle_text: string;
    flavor_text: string;
    power: string;
    toughness: string;
}

interface CardData {
    card_id: string;
    oracle_id: string;
    name: string;
    layout: string;
    reserved_list: boolean;
    set_code: string;
    set_name: string;
    release_date: string;
    set_type: string;
    edition_id: string;
    rarity: string;
    artist: string;
    collector_number: string;
    image_url_normal: string;
    image_url_small: string;
    market_price_usd: string;
    foil_price_usd: string;
    faces: CardFaceData[];
    color_identity: string[];
}

const AdminDashboard: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'cards' | 'editions'>('cards');

    // Edition Management State
    const [editionsList, setEditionsList] = useState<any[]>([]);
    const [selectedEditionCard, setSelectedEditionCard] = useState<any>(null);
    const [editionFormData, setEditionFormData] = useState({
        edition_id: '',
        set_code: '',
        rarity: 'common',
        artist: '',
        collector_number: '',
        image_url_normal: '',
        image_url_small: ''
    });
    const [isEditingEdition, setIsEditingEdition] = useState(false);
    const [bulkData, setBulkData] = useState({ set_code: '', identifiers: '' });

    const fetchEditions = async (cardId: string) => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_URL}/api/cards/${cardId}/editions`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setEditionsList(res.data);
        } catch (err) {
            console.error('Failed to fetch editions', err);
        }
    };

    const handleEditionSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            if (isEditingEdition) {
                await axios.put(`${API_URL}/api/cards/editions/${editionFormData.edition_id}`, editionFormData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setMessage({ text: 'Edition updated!', type: 'success' });
            } else {
                await axios.post(`${API_URL}/api/cards/editions`, {
                    ...editionFormData,
                    card_id: selectedEditionCard.card_id
                }, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setMessage({ text: 'Edition added!', type: 'success' });
            }
            fetchEditions(selectedEditionCard.card_id);
            resetEditionForm();
        } catch (err: any) {
            setMessage({ text: err.response?.data?.message || 'Failed to save edition', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteEdition = async (id: string) => {
        if (!window.confirm('Delete this edition?')) return;
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_URL}/api/cards/editions/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessage({ text: 'Edition deleted!', type: 'success' });
            fetchEditions(selectedEditionCard.card_id);
        } catch (err: any) {
            setMessage({ text: err.response?.data?.message || 'Failed to delete edition', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleBulkSubmit = async () => {
        if (!bulkData.set_code || !bulkData.identifiers) {
            setMessage({ text: 'Set Code and Identifiers required', type: 'error' });
            return;
        }
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const identifiers = bulkData.identifiers.split('\n').map(s => s.trim()).filter(s => s);
            const res = await axios.post(`${API_URL}/api/cards/editions/bulk`, {
                set_code: bulkData.set_code,
                card_identifiers: identifiers
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessage({ text: `Bulk process complete. ${res.data.results.filter((r: any) => r.status === 'created').length} editions added.`, type: 'success' });
            setBulkData({ set_code: '', identifiers: '' });
        } catch (err: any) {
            setMessage({ text: err.response?.data?.message || 'Bulk add failed', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const resetEditionForm = () => {
        setEditionFormData({
            edition_id: '',
            set_code: '',
            rarity: 'common',
            artist: '',
            collector_number: '',
            image_url_normal: '',
            image_url_small: ''
        });
        setIsEditingEdition(false);
    };

    const selectEditionForEdit = (ed: any) => {
        setEditionFormData({
            edition_id: ed.edition_id,
            set_code: ed.set_code,
            rarity: ed.rarity,
            artist: ed.artist,
            collector_number: ed.collector_number,
            image_url_normal: ed.image_url_normal,
            image_url_small: ed.image_url_small
        });
        setIsEditingEdition(true);
    };
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });
    const [isEditing, setIsEditing] = useState(false);
    const [isDirty, setIsDirty] = useState(false);

    // Form State
    const [formData, setFormData] = useState<CardData>({
        card_id: '',
        oracle_id: '',
        name: '',
        layout: 'normal',
        reserved_list: false,
        set_code: '',
        set_name: '',
        release_date: '',
        set_type: '',
        edition_id: '',
        rarity: 'common',
        artist: '',
        collector_number: '',
        image_url_normal: '',
        image_url_small: '',
        market_price_usd: '',
        foil_price_usd: '',
        faces: [{
            name: '',
            mana_cost: '',
            cmc: 0,
            oracle_text: '',
            flavor_text: '',
            power: '',
            toughness: ''
        }],
        color_identity: []
    });

    const handleSearch = async () => {
        if (!searchQuery) return;
        setLoading(true);
        try {
            const res = await axios.get(`${API_URL}/api/cards/search?q=${searchQuery}`);
            setSearchResults(res.data);
        } catch (err) {
            console.error('Search failed', err);
        } finally {
            setLoading(false);
        }
    };

    const selectCard = async (edition: any) => {
        try {
            setLoading(true);
            const res = await axios.get(`${API_URL}/api/cards/${edition.card_id}`);
            const fullCard = res.data;

            // Find the matching edition in full card data (it includes PricePoints)
            const fullEdition = fullCard.Editions?.find((e: any) => e.edition_id === edition.edition_id);
            const latestPrice = fullEdition?.PricePoints?.[0];
            setFormData({
                card_id: fullCard.card_id,
                oracle_id: fullCard.oracle_id,
                name: fullCard.name,
                layout: fullCard.layout,
                reserved_list: fullCard.reserved_list,
                set_code: edition.set_code,
                set_name: edition.Set?.set_name || '',
                release_date: edition.Set?.release_date || '',
                set_type: edition.Set?.set_type || '',
                edition_id: edition.edition_id,
                rarity: edition.rarity,
                artist: edition.artist,
                collector_number: edition.collector_number,
                image_url_normal: edition.image_url_normal,
                image_url_small: edition.image_url_small,
                market_price_usd: latestPrice?.market_price_usd?.toString() || '',
                foil_price_usd: latestPrice?.foil_price_usd?.toString() || '',
                faces: fullCard.CardFaces.map((f: any) => ({
                    name: f.name,
                    mana_cost: f.mana_cost,
                    cmc: parseFloat(f.cmc),
                    oracle_text: f.oracle_text,
                    flavor_text: f.flavor_text,
                    power: f.power,
                    toughness: f.toughness
                })),
                color_identity: fullCard.CardColorIdentities.map((ci: any) => ci.color_id)
            });
            setIsEditing(true);
            setIsDirty(false);
            setSearchResults([]);
            setSearchQuery('');
            setMessage({ text: '', type: '' });
        } catch (err) {
            console.error('Failed to load card details', err);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setIsDirty(true);
        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData(prev => ({ ...prev, [name]: checked }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleFaceChange = (index: number, e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setIsDirty(true);
        const newFaces = [...formData.faces];
        newFaces[index] = { ...newFaces[index], [name]: name === 'cmc' ? parseFloat(value) : value };
        setFormData(prev => ({ ...prev, faces: newFaces }));
    };

    const toggleColor = (color: string) => {
        setIsDirty(true);
        setFormData(prev => {
            const colors = prev.color_identity.includes(color)
                ? prev.color_identity.filter(c => c !== color)
                : [...prev.color_identity, color];
            return { ...prev, color_identity: colors };
        });
    };

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this card? This action cannot be undone and will remove all associated data (editions, prices, legality, etc.).')) {
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_URL}/api/cards/${formData.card_id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessage({ text: 'Card deleted successfully!', type: 'success' });
            resetForm();
            setSearchResults([]);
            setSearchQuery('');
        } catch (err: any) {
            console.error('Delete failed', err);
            setMessage({ text: err.response?.data?.message || 'Failed to delete card', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ text: '', type: '' });
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_URL}/api/cards`, formData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Save price if provided
            if (formData.edition_id && (formData.market_price_usd || formData.foil_price_usd)) {
                await axios.post(`${API_URL}/api/cards/editions/price`, {
                    edition_id: formData.edition_id,
                    market_price_usd: formData.market_price_usd ? parseFloat(formData.market_price_usd) : null,
                    foil_price_usd: formData.foil_price_usd ? parseFloat(formData.foil_price_usd) : null,
                }, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }

            setMessage({ text: 'Card saved successfully!', type: 'success' });
        } catch (err: any) {
            setMessage({ text: err.response?.data?.message || 'Failed to save card', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const addNewFace = () => {
        setFormData(prev => ({
            ...prev,
            faces: [...prev.faces, {
                name: '',
                mana_cost: '',
                cmc: 0,
                oracle_text: '',
                flavor_text: '',
                power: '',
                toughness: ''
            }]
        }));
    };

    const removeFace = (index: number) => {
        if (formData.faces.length <= 1) return;
        setFormData(prev => ({
            ...prev,
            faces: prev.faces.filter((_, i) => i !== index)
        }));
    };

    const resetForm = () => {
        setFormData({
            card_id: '',
            oracle_id: '',
            name: '',
            layout: 'normal',
            reserved_list: false,
            set_code: '',
            set_name: '',
            release_date: '',
            set_type: '',
            edition_id: '',
            rarity: 'common',
            artist: '',
            collector_number: '',
            image_url_normal: '',
            image_url_small: '',
            market_price_usd: '',
            foil_price_usd: '',
            faces: [{
                name: '',
                mana_cost: '',
                cmc: 0,
                oracle_text: '',
                flavor_text: '',
                power: '',
                toughness: ''
            }],
            color_identity: []
        });
        setIsEditing(false);
        setIsDirty(false);
        setMessage({ text: '', type: '' });
    };

    return (
        <div className="bg-light-bg dark:bg-[#050508] text-light-text dark:text-gray-200 min-h-screen font-sans antialiased">
            <header className="fixed top-0 w-full z-50 transition-all duration-300 border-b border-light-primary/20 dark:border-primary/20 bg-light-bg/80 dark:bg-black/40 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-20">
                        <div className="flex items-center gap-3">
                            <div className="size-10 text-light-primary dark:text-primary flex items-center justify-center border border-light-primary/40 dark:border-primary/40 rounded-full">
                                <span className="material-symbols-outlined text-[28px]">admin_panel_settings</span>
                            </div>
                            <span className="text-2xl font-display font-bold tracking-[0.2em] text-light-text dark:text-primary uppercase">Admin Panel</span>
                        </div>
                        <nav className="flex items-center gap-8">
                            <ThemeToggle />
                            <a href="/" className="text-sm font-display tracking-widest text-light-primary dark:text-gray-300 hover:text-light-secondary dark:hover:text-primary transition-colors uppercase">Home</a>
                        </nav>
                    </div>
                </div>
            </header>

            <main className="max-w-5xl mx-auto pt-32 pb-24 px-4">
                <div className="flex flex-col gap-8">
                    {/* Tab Switcher */}
                    <div className="flex gap-4 p-1 bg-white/10 dark:bg-white/5 border border-light-primary/20 dark:border-primary/20 rounded-2xl backdrop-blur-md self-center">
                        <button
                            onClick={() => setActiveTab('cards')}
                            className={`px-8 py-3 rounded-xl font-display tracking-widest uppercase text-xs font-bold transition-all ${activeTab === 'cards' ? 'bg-light-primary dark:bg-primary text-white dark:text-black shadow-lg' : 'text-light-text/60 dark:text-gray-400 hover:text-light-text dark:hover:text-white'}`}
                        >
                            Manage Cards
                        </button>
                        <button
                            onClick={() => setActiveTab('editions')}
                            className={`px-8 py-3 rounded-xl font-display tracking-widest uppercase text-xs font-bold transition-all ${activeTab === 'editions' ? 'bg-light-primary dark:bg-primary text-white dark:text-black shadow-lg' : 'text-light-text/60 dark:text-gray-400 hover:text-light-text dark:hover:text-white'}`}
                        >
                            Manage Editions
                        </button>
                    </div>

                    {activeTab === 'cards' ? (
                        <div className="flex flex-col gap-12">
                            {/* Search & Selection Section */}
                            <div className="bg-white/10 dark:bg-white/5 border border-light-primary/20 dark:border-primary/20 rounded-2xl p-6 backdrop-blur-md">
                                <h2 className="text-xl font-display font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <span className="material-symbols-outlined">search</span> Search Existing Card to Edit
                                </h2>
                                <div className="flex gap-4">
                                    <input
                                        type="text"
                                        className="flex-grow bg-white/20 dark:bg-black/40 border border-light-primary/30 dark:border-primary/30 rounded-xl px-4 py-3 focus:outline-none focus:border-light-primary dark:focus:border-primary transition-all"
                                        placeholder="Type card name..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                    />
                                    <button
                                        onClick={handleSearch}
                                        className="bg-light-primary dark:bg-primary text-white dark:text-black px-6 py-3 rounded-xl font-display tracking-widest uppercase text-xs font-bold hover:brightness-125 transition-all"
                                    >
                                        Search
                                    </button>
                                    <button
                                        onClick={resetForm}
                                        className="border border-light-primary/50 dark:border-primary/50 text-light-primary dark:text-primary px-6 py-3 rounded-xl font-display tracking-widest uppercase text-xs font-bold hover:bg-light-primary/10 dark:hover:bg-primary/10 transition-all"
                                    >
                                        New Card
                                    </button>
                                </div>

                                {searchResults.length > 0 && (
                                    <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[300px] overflow-y-auto pr-2">
                                        {searchResults.map((ed) => (
                                            <div
                                                key={ed.edition_id}
                                                onClick={() => selectCard(ed)}
                                                className="flex items-center gap-4 p-3 bg-white/5 dark:bg-black/20 hover:bg-light-primary/10 dark:hover:bg-primary/10 border border-transparent hover:border-light-primary/30 dark:hover:border-primary/30 rounded-xl cursor-pointer transition-all"
                                            >
                                                <img src={ed.image_url_small} alt={ed.Card?.name} className="w-12 rounded-md shadow-lg" />
                                                <div>
                                                    <div className="font-bold">{ed.Card?.name}</div>
                                                    <div className="text-xs opacity-60 uppercase tracking-widest">{ed.set_code} · {ed.rarity}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Main Form Section */}
                            <div className="flex flex-col lg:flex-row gap-8 items-start">
                                <form onSubmit={handleSubmit} className="flex-grow bg-white/10 dark:bg-white/5 border border-light-primary/20 dark:border-primary/20 rounded-2xl p-8 backdrop-blur-md space-y-10">
                                    {message.text && (
                                        <div className={`p-4 rounded-xl text-center font-bold tracking-widest uppercase text-xs ${message.type === 'success' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                            {message.text}
                                        </div>
                                    )}

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        {/* Basic Card Info */}
                                        <div className="space-y-6">
                                            <h3 className="text-sm font-display font-bold uppercase tracking-[0.2em] text-light-primary dark:text-primary border-b border-light-primary/10 dark:border-primary/10 pb-2">Basic Info</h3>
                                            <div className="space-y-4">
                                                <div className="flex flex-col gap-1">
                                                    <label className="text-[10px] uppercase tracking-widest opacity-60">Card Name</label>
                                                    <input name="name" value={formData.name} onChange={handleInputChange} className="admin-input" required />
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="flex flex-col gap-1">
                                                        <label className="text-[10px] uppercase tracking-widest opacity-60">Oracle ID (UUID)</label>
                                                        <input name="oracle_id" value={formData.oracle_id} onChange={handleInputChange} className="admin-input" required />
                                                    </div>
                                                    <div className="flex flex-col gap-1">
                                                        <label className="text-[10px] uppercase tracking-widest opacity-60">Edition ID (UUID)</label>
                                                        <input name="edition_id" value={formData.edition_id} onChange={handleInputChange} className="admin-input" required />
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="flex flex-col gap-1">
                                                        <label className="text-[10px] uppercase tracking-widest opacity-60">Layout</label>
                                                        <select name="layout" value={formData.layout} onChange={handleInputChange} className="admin-input bg-black/40">
                                                            <option value="normal">Normal</option>
                                                            <option value="split">Split</option>
                                                            <option value="flip">Flip</option>
                                                            <option value="transform">Transform</option>
                                                            <option value="saga">Saga</option>
                                                            <option value="adventure">Adventure</option>
                                                        </select>
                                                    </div>
                                                    <div className="flex items-center gap-2 pt-6">
                                                        <input type="checkbox" name="reserved_list" checked={formData.reserved_list} onChange={handleInputChange} id="reserved" className="size-5 accent-light-primary dark:accent-primary" />
                                                        <label htmlFor="reserved" className="text-[10px] uppercase tracking-widest font-bold">Reserved List</label>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Set & Edition Info */}
                                        <div className="space-y-6">
                                            <h3 className="text-sm font-display font-bold uppercase tracking-[0.2em] text-light-primary dark:text-primary border-b border-light-primary/10 dark:border-primary/10 pb-2">Set & Printing</h3>
                                            <div className="space-y-4">
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="flex flex-col gap-1">
                                                        <label className="text-[10px] uppercase tracking-widest opacity-60">Set Code</label>
                                                        <input name="set_code" value={formData.set_code} onChange={handleInputChange} className="admin-input" maxLength={10} required />
                                                    </div>
                                                    <div className="flex flex-col gap-1">
                                                        <label className="text-[10px] uppercase tracking-widest opacity-60">Rarity</label>
                                                        <select name="rarity" value={formData.rarity} onChange={handleInputChange} className="admin-input bg-black/40">
                                                            <option value="common">Common</option>
                                                            <option value="uncommon">Uncommon</option>
                                                            <option value="rare">Rare</option>
                                                            <option value="mythic">Mythic</option>
                                                            <option value="special">Special</option>
                                                            <option value="bonus">Bonus</option>
                                                        </select>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col gap-1">
                                                    <label className="text-[10px] uppercase tracking-widest opacity-60">Set Name</label>
                                                    <input name="set_name" value={formData.set_name} onChange={handleInputChange} className="admin-input" />
                                                </div>
                                                <div className="flex flex-col gap-1">
                                                    <label className="text-[10px] uppercase tracking-widest opacity-60">Artist</label>
                                                    <input name="artist" value={formData.artist} onChange={handleInputChange} className="admin-input" />
                                                </div>
                                                <div className="flex flex-col gap-1">
                                                    <label className="text-[10px] uppercase tracking-widest opacity-60">Image URL (Normal)</label>
                                                    <input name="image_url_normal" value={formData.image_url_normal} onChange={handleInputChange} className="admin-input" />
                                                </div>
                                                {/* Price Section */}
                                                <div className="pt-2 border-t border-light-primary/10 dark:border-primary/10 space-y-3">
                                                    <div className="text-[10px] uppercase tracking-widest font-bold opacity-50 flex items-center gap-1">
                                                        <span className="material-symbols-outlined text-sm">payments</span> Pricing
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div className="flex flex-col gap-1">
                                                            <label className="text-[10px] uppercase tracking-widest opacity-60">Market Price (USD)</label>
                                                            <input
                                                                type="number"
                                                                step="0.01"
                                                                min="0"
                                                                name="market_price_usd"
                                                                value={formData.market_price_usd}
                                                                onChange={handleInputChange}
                                                                className="admin-input"
                                                                placeholder="e.g. 12.50"
                                                            />
                                                        </div>
                                                        <div className="flex flex-col gap-1">
                                                            <label className="text-[10px] uppercase tracking-widest opacity-60">Foil Price (USD)</label>
                                                            <input
                                                                type="number"
                                                                step="0.01"
                                                                min="0"
                                                                name="foil_price_usd"
                                                                value={formData.foil_price_usd}
                                                                onChange={handleInputChange}
                                                                className="admin-input"
                                                                placeholder="e.g. 18.00"
                                                            />
                                                        </div>
                                                    </div>
                                                    <p className="text-[10px] opacity-40 italic">Saving will add a new price record and trigger your price audit log.</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Color Identity Section */}
                                    <div className="space-y-6">
                                        <h3 className="text-sm font-display font-bold uppercase tracking-[0.2em] text-light-primary dark:text-primary border-b border-light-primary/10 dark:border-primary/10 pb-2">Color Identity</h3>
                                        <div className="flex gap-4 items-center">
                                            {['W', 'U', 'B', 'R', 'G', 'C'].map(color => (
                                                <button
                                                    key={color}
                                                    type="button"
                                                    onClick={() => toggleColor(color)}
                                                    className={`size-12 rounded-full flex items-center justify-center font-bold border-2 transition-all ${formData.color_identity.includes(color)
                                                        ? 'bg-light-primary/40 dark:bg-primary/40 border-light-primary dark:border-primary shadow-[0_0_15px_rgba(212,175,55,0.3)]'
                                                        : 'border-white/10 opacity-40 grayscale hover:grayscale-0 hover:opacity-100'
                                                        }`}
                                                >
                                                    <img src={`${API_URL}/icons/mana/${color === 'W' ? 'White' : color === 'U' ? 'Blue' : color === 'B' ? 'Black' : color === 'R' ? 'Red' : color === 'G' ? 'Green' : 'Colorless'}Mana.png`} alt={color} className="size-8" />
                                                </button>
                                            ))}
                                            <span className="ml-4 text-[10px] uppercase tracking-widest font-bold opacity-60">Selected: {formData.color_identity.join(', ') || 'None (Colorless)'}</span>
                                        </div>
                                    </div>

                                    {/* Card Faces Section */}
                                    <div className="space-y-6">
                                        <div className="flex justify-between items-center border-b border-light-primary/10 dark:border-primary/10 pb-2">
                                            <h3 className="text-sm font-display font-bold uppercase tracking-[0.2em] text-light-primary dark:text-primary">Card Faces</h3>
                                            <button type="button" onClick={addNewFace} className="text-[10px] uppercase tracking-widest font-bold flex items-center gap-1 hover:text-light-secondary dark:hover:text-primary transition-colors">
                                                <span className="material-symbols-outlined text-sm">add_circle</span> Add Face
                                            </button>
                                        </div>

                                        <div className="space-y-8">
                                            {formData.faces.map((face, idx) => (
                                                <div key={idx} className="p-6 bg-white/5 dark:bg-black/20 rounded-xl space-y-4 relative group">
                                                    <div className="absolute top-4 right-4 flex items-center gap-2">
                                                        <span className="text-[10px] uppercase tracking-widest font-bold opacity-30">Face {idx + 1}</span>
                                                        {formData.faces.length > 1 && (
                                                            <button type="button" onClick={() => removeFace(idx)} className="text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <span className="material-symbols-outlined">delete</span>
                                                            </button>
                                                        )}
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                        <div className="flex flex-col gap-1">
                                                            <label className="text-[10px] uppercase tracking-widest opacity-60">Face Name</label>
                                                            <input name="name" value={face.name} onChange={(e) => handleFaceChange(idx, e)} className="admin-input" placeholder={idx === 0 ? formData.name : ''} />
                                                        </div>
                                                        <div className="flex flex-col gap-1">
                                                            <label className="text-[10px] uppercase tracking-widest opacity-60">Mana Cost</label>
                                                            <input name="mana_cost" value={face.mana_cost} onChange={(e) => handleFaceChange(idx, e)} className="admin-input" placeholder="{1}{G}" />
                                                        </div>
                                                        <div className="flex flex-col gap-1">
                                                            <label className="text-[10px] uppercase tracking-widest opacity-60">CMC</label>
                                                            <input type="number" step="0.5" name="cmc" value={face.cmc} onChange={(e) => handleFaceChange(idx, e)} className="admin-input" />
                                                        </div>
                                                    </div>

                                                    <div className="flex flex-col gap-1">
                                                        <label className="text-[10px] uppercase tracking-widest opacity-60">Oracle Text</label>
                                                        <textarea name="oracle_text" value={face.oracle_text} onChange={(e) => handleFaceChange(idx, e)} className="admin-input min-h-[100px] py-3 font-serif italic text-sm" />
                                                    </div>

                                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                        <div className="flex flex-col gap-1">
                                                            <label className="text-[10px] uppercase tracking-widest opacity-60">Power</label>
                                                            <input name="power" value={face.power} onChange={(e) => handleFaceChange(idx, e)} className="admin-input" />
                                                        </div>
                                                        <div className="flex flex-col gap-1">
                                                            <label className="text-[10px] uppercase tracking-widest opacity-60">Toughness</label>
                                                            <input name="toughness" value={face.toughness} onChange={(e) => handleFaceChange(idx, e)} className="admin-input" />
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex justify-center items-center gap-4 pt-10">
                                        {isEditing && !isDirty && (
                                            <button
                                                type="button"
                                                onClick={() => setIsDirty(true)}
                                                className="inline-flex items-center gap-2 px-6 py-3 rounded-full border-2 border-light-primary dark:border-purple-400 text-light-primary dark:text-purple-300 bg-transparent font-display font-bold tracking-widest uppercase text-xs hover:bg-light-primary/10 dark:hover:bg-purple-400/10 transition-all"
                                            >
                                                <span className="material-symbols-outlined text-base">edit</span>
                                                Edit Card
                                            </button>
                                        )}

                                        {!isEditing && !isDirty && (
                                            <button
                                                type="button"
                                                onClick={() => setIsDirty(true)}
                                                className="inline-flex items-center gap-2 px-6 py-3 rounded-full border-2 border-light-primary dark:border-purple-400 text-light-primary dark:text-purple-300 bg-transparent font-display font-bold tracking-widest uppercase text-xs hover:bg-light-primary/10 dark:hover:bg-purple-400/10 transition-all"
                                            >
                                                <span className="material-symbols-outlined text-base">add_circle</span>
                                                Add New Card
                                            </button>
                                        )}

                                        {isDirty && (
                                            <button
                                                type="submit"
                                                disabled={loading}
                                                className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-light-primary dark:bg-purple-500 text-white font-display font-bold tracking-widest uppercase text-xs hover:brightness-110 hover:scale-105 shadow-lg transition-all disabled:opacity-50"
                                            >
                                                <span className="material-symbols-outlined text-base">save</span>
                                                {loading ? 'Saving...' : 'Save Changes'}
                                            </button>
                                        )}

                                        {isDirty && (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    if (isEditing) {
                                                        setIsDirty(false);
                                                    } else {
                                                        resetForm();
                                                    }
                                                }}
                                                className="inline-flex items-center gap-2 px-6 py-3 rounded-full border-2 border-slate-400 dark:border-slate-500 text-slate-500 dark:text-slate-400 bg-transparent font-display font-bold tracking-widest uppercase text-xs hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-all"
                                            >
                                                <span className="material-symbols-outlined text-base">undo</span>
                                                Discard
                                            </button>
                                        )}

                                        {isEditing && (
                                            <button
                                                type="button"
                                                onClick={handleDelete}
                                                className="inline-flex items-center gap-2 px-6 py-3 rounded-full border-2 border-red-500/50 text-red-500 bg-red-500/5 font-display font-bold tracking-widest uppercase text-xs hover:bg-red-500/10 hover:border-red-500 transition-all ml-4"
                                            >
                                                <span className="material-symbols-outlined text-base">delete</span>
                                                Delete Card
                                            </button>
                                        )}
                                    </div>
                                </form>

                                {/* Preview Card Sidebar */}
                                <div className="lg:sticky lg:top-32 w-full lg:w-72 space-y-6">
                                    <h3 className="text-sm font-display font-bold uppercase tracking-[0.2em] text-light-primary dark:text-primary border-b border-light-primary/10 dark:border-primary/10 pb-2">Visions</h3>
                                    <div className="relative group">
                                        <div className="absolute -inset-1 bg-gradient-to-r from-light-primary to-light-secondary dark:from-primary dark:to-[#D4AF37] rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                                        <div className="relative bg-[#050508] rounded-xl overflow-hidden shadow-2xl border border-white/10 aspect-[2.5/3.5] flex items-center justify-center">
                                            {formData.image_url_normal ? (
                                                <img src={formData.image_url_normal} alt="Preview" className="w-full h-full object-cover animate-fade-in" />
                                            ) : (
                                                <div className="flex flex-col items-center gap-4 text-gray-600">
                                                    <span className="material-symbols-outlined text-5xl">visibility_off</span>
                                                    <span className="text-[10px] uppercase tracking-widest font-bold">No Image Mapping</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="bg-white/5 p-4 rounded-xl border border-white/5 space-y-2">
                                        <div className="text-[10px] uppercase tracking-widest font-bold opacity-40">Identity</div>
                                        <div className="flex gap-1">
                                            {formData.color_identity.map(c => (
                                                <img key={c} src={`${API_URL}/icons/mana/${c === 'W' ? 'White' : c === 'U' ? 'Blue' : c === 'B' ? 'Black' : c === 'R' ? 'Red' : c === 'G' ? 'Green' : 'Colorless'}Mana.png`} className="size-5" alt={c} />
                                            ))}
                                            {formData.color_identity.length === 0 && <span className="text-[10px] text-gray-500 italic">Colorless</span>}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-12">
                            {/* Edition Management Tab Content */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                {/* Left Column: Selection & Single Form */}
                                <div className="lg:col-span-2 space-y-8">
                                    <div className="bg-white/10 dark:bg-white/5 border border-light-primary/20 dark:border-primary/20 rounded-2xl p-6 backdrop-blur-md">
                                        <h2 className="text-xl font-display font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                                            <span className="material-symbols-outlined">collections</span> 1. Select Card
                                        </h2>
                                        <div className="flex gap-4">
                                            <input
                                                type="text"
                                                className="flex-grow bg-white/20 dark:bg-black/40 border border-light-primary/30 dark:border-primary/30 rounded-xl px-4 py-3 focus:outline-none focus:border-light-primary dark:focus:border-primary transition-all"
                                                placeholder="Search card for printings..."
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                            />
                                            <button
                                                onClick={handleSearch}
                                                className="bg-light-primary dark:bg-primary text-white dark:text-black px-6 py-3 rounded-xl font-display tracking-widest uppercase text-xs font-bold"
                                            >
                                                Search
                                            </button>
                                        </div>
                                        {searchResults.length > 0 && (
                                            <div className="mt-4 grid grid-cols-1 gap-2 max-h-[200px] overflow-y-auto pr-2">
                                                {searchResults.map((ed) => (
                                                    <div
                                                        key={ed.edition_id}
                                                        onClick={() => {
                                                            setSelectedEditionCard(ed.Card);
                                                            fetchEditions(ed.card_id);
                                                            setSearchResults([]);
                                                            setSearchQuery('');
                                                            setMessage({ text: '', type: '' });
                                                        }}
                                                        className="flex items-center justify-between p-3 bg-white/5 dark:bg-black/20 hover:bg-light-primary/10 dark:hover:bg-primary/10 rounded-xl cursor-pointer transition-all border border-transparent hover:border-light-primary/30"
                                                    >
                                                        <span className="font-bold">{ed.Card?.name}</span>
                                                        <span className="text-xs opacity-50 uppercase">{ed.card_id}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                        {selectedEditionCard && (
                                            <div className="mt-6 flex items-center gap-4 p-4 bg-light-primary/10 dark:bg-primary/10 border border-light-primary/30 dark:border-primary/30 rounded-xl">
                                                <div className="material-symbols-outlined text-light-primary dark:text-primary">check_circle</div>
                                                <div>
                                                    <div className="text-[10px] uppercase tracking-widest opacity-60">Selected Card</div>
                                                    <div className="font-display font-bold text-lg">{selectedEditionCard.name}</div>
                                                </div>
                                                <button onClick={() => { setSelectedEditionCard(null); setEditionsList([]); }} className="ml-auto text-xs uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity">Change</button>
                                            </div>
                                        )}
                                    </div>

                                    {selectedEditionCard && (
                                        <div className="bg-white/10 dark:bg-white/5 border border-light-primary/20 dark:border-primary/20 rounded-2xl p-8 backdrop-blur-md">
                                            <h2 className="text-xl font-display font-bold uppercase tracking-widest mb-6 flex items-center gap-2 text-light-primary dark:text-primary">
                                                <span className="material-symbols-outlined">{isEditingEdition ? 'edit' : 'add_circle'}</span>
                                                {isEditingEdition ? '2. Edit Printing' : '2. Add New Printing'}
                                            </h2>
                                            <form onSubmit={handleEditionSubmit} className="space-y-6">
                                                <div className="grid grid-cols-2 gap-6">
                                                    <div className="flex flex-col gap-1">
                                                        <label className="text-[10px] uppercase tracking-widest opacity-60">Set Code</label>
                                                        <input
                                                            className="admin-input"
                                                            value={editionFormData.set_code}
                                                            onChange={(e) => setEditionFormData({ ...editionFormData, set_code: e.target.value.toUpperCase() })}
                                                            placeholder="e.g. MH2"
                                                            required
                                                            disabled={isEditingEdition}
                                                        />
                                                    </div>
                                                    <div className="flex flex-col gap-1">
                                                        <label className="text-[10px] uppercase tracking-widest opacity-60">Rarity</label>
                                                        <select
                                                            className="admin-input bg-black/40"
                                                            value={editionFormData.rarity}
                                                            onChange={(e) => setEditionFormData({ ...editionFormData, rarity: e.target.value })}
                                                        >
                                                            <option value="common">Common</option>
                                                            <option value="uncommon">Uncommon</option>
                                                            <option value="rare">Rare</option>
                                                            <option value="mythic">Mythic</option>
                                                            <option value="special">Special</option>
                                                            <option value="bonus">Bonus</option>
                                                        </select>
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-6">
                                                    <div className="flex flex-col gap-1">
                                                        <label className="text-[10px] uppercase tracking-widest opacity-60">Artist</label>
                                                        <input
                                                            className="admin-input"
                                                            value={editionFormData.artist}
                                                            onChange={(e) => setEditionFormData({ ...editionFormData, artist: e.target.value })}
                                                            placeholder="Artist Name"
                                                        />
                                                    </div>
                                                    <div className="flex flex-col gap-1">
                                                        <label className="text-[10px] uppercase tracking-widest opacity-60">Collector Number</label>
                                                        <input
                                                            className="admin-input"
                                                            value={editionFormData.collector_number}
                                                            onChange={(e) => setEditionFormData({ ...editionFormData, collector_number: e.target.value })}
                                                            placeholder="42"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="flex flex-col gap-1">
                                                    <label className="text-[10px] uppercase tracking-widest opacity-60">Normal Image URL</label>
                                                    <input
                                                        className="admin-input"
                                                        value={editionFormData.image_url_normal}
                                                        onChange={(e) => setEditionFormData({ ...editionFormData, image_url_normal: e.target.value })}
                                                    />
                                                </div>

                                                <div className="flex gap-4 pt-4">
                                                    <button
                                                        type="submit"
                                                        disabled={loading}
                                                        className="flex-grow bg-light-primary dark:bg-primary text-white dark:text-black py-4 rounded-xl font-display font-bold tracking-widest uppercase text-xs hover:brightness-110 shadow-lg disabled:opacity-50"
                                                    >
                                                        {isEditingEdition ? 'Update Printing' : 'Add Printing'}
                                                    </button>
                                                    {isEditingEdition && (
                                                        <button
                                                            type="button"
                                                            onClick={resetEditionForm}
                                                            className="px-6 border border-white/20 rounded-xl uppercase text-[10px] tracking-widest font-bold opacity-60 hover:opacity-100"
                                                        >
                                                            Cancel
                                                        </button>
                                                    )}
                                                </div>
                                            </form>
                                        </div>
                                    )}
                                </div>

                                {/* Right Column: Existing Printings & Bulk */}
                                <div className="space-y-8">
                                    {/* Existing Printings List */}
                                    <div className="bg-white/10 dark:bg-white/5 border border-light-primary/20 dark:border-primary/20 rounded-2xl p-6 backdrop-blur-md h-fit">
                                        <h2 className="text-xl font-display font-bold uppercase tracking-widest mb-6 flex items-center gap-2">
                                            <span className="material-symbols-outlined">format_list_bulleted</span> Existing Prints
                                        </h2>
                                        {!selectedEditionCard ? (
                                            <div className="text-center py-12 opacity-30 italic text-sm">Select a card first</div>
                                        ) : (
                                            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                                                {editionsList.map(ed => (
                                                    <div key={ed.edition_id} className="p-3 bg-white/5 dark:bg-black/40 border border-white/5 rounded-xl group relative">
                                                        <div className="flex items-center gap-3">
                                                            <div className="size-8 bg-black/40 rounded flex items-center justify-center text-[10px] font-bold text-light-primary dark:text-primary border border-white/10 shrink-0">
                                                                {ed.set_code}
                                                            </div>
                                                            <div className="flex-grow">
                                                                <div className="text-xs font-bold uppercase tracking-widest">{ed.rarity}</div>
                                                                <div className="text-[10px] opacity-40">{ed.artist}</div>
                                                            </div>
                                                            <div className="flex gap-1">
                                                                <button onClick={() => selectEditionForEdit(ed)} className="p-1 text-light-primary dark:text-primary hover:text-light-secondary dark:hover:text-amber-500 transition-colors" title="Edit">
                                                                    <span className="material-symbols-outlined text-lg">edit</span>
                                                                </button>
                                                                <button onClick={() => handleDeleteEdition(ed.edition_id)} className="p-1 text-red-500/60 hover:text-red-500 transition-colors" title="Delete">
                                                                    <span className="material-symbols-outlined text-lg">delete</span>
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                                {editionsList.length === 0 && <div className="text-center py-4 opacity-30 text-xs">No editions found.</div>}
                                            </div>
                                        )}
                                    </div>

                                    {/* Bulk Manage Section */}
                                    <div className="bg-gradient-to-br from-light-primary/20 to-light-secondary/20 dark:from-primary/20 dark:to-purple-900/20 border border-light-primary/30 dark:border-primary/30 rounded-2xl p-6 backdrop-blur-md">
                                        <h2 className="text-xl font-display font-bold uppercase tracking-widest mb-4 flex items-center gap-2 text-light-text dark:text-white">
                                            <span className="material-symbols-outlined">upload_file</span> Bulk Add to Set
                                        </h2>
                                        <p className="text-[10px] opacity-60 uppercase tracking-widest mb-6">Create printings for multiple cards in one set</p>
                                        <div className="space-y-4">
                                            <div className="flex flex-col gap-1">
                                                <label className="text-[10px] uppercase tracking-widest font-bold">Target Set Code</label>
                                                <input
                                                    className="admin-input"
                                                    placeholder="e.g. BRO"
                                                    value={bulkData.set_code}
                                                    onChange={e => setBulkData({ ...bulkData, set_code: e.target.value.toUpperCase() })}
                                                />
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <label className="text-[10px] uppercase tracking-widest font-bold">Card Names or IDs (One per line)</label>
                                                <textarea
                                                    className="admin-input min-h-[150px] font-mono text-[10px]"
                                                    placeholder="Fury Sliver&#10;Abyssal Persecutor&#10;uuid-1234-..."
                                                    value={bulkData.identifiers}
                                                    onChange={e => setBulkData({ ...bulkData, identifiers: e.target.value })}
                                                />
                                            </div>
                                            <button
                                                onClick={handleBulkSubmit}
                                                disabled={loading}
                                                className="w-full bg-light-primary dark:bg-white text-white dark:text-black py-3 rounded-xl font-display font-bold tracking-widest uppercase text-xs hover:brightness-110 shadow-xl disabled:opacity-50"
                                            >
                                                {loading ? 'Processing...' : 'Bulk Add Editions'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            <style>{`
                .admin-input {
                    background: rgba(0, 0, 0, 0.2);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 0.75rem;
                    padding: 0.75rem 1rem;
                    color: inherit;
                    width: 100%;
                    transition: all 0.2s;
                    font-size: 0.875rem;
                }
                .admin-input:focus {
                    outline: none;
                    border-color: #5a0496;
                    box-shadow: 0 0 10px rgba(90, 4, 150, 0.2);
                }
                .dark .admin-input:focus {
                    border-color: #D4AF37;
                    box-shadow: 0 0 10px rgba(212, 175, 55, 0.2);
                }
            `}</style>
        </div>
    );
};

export default AdminDashboard;
