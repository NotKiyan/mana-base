import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import {
    formats,
    setTypes,
    blocks,
    rarities,
    criteria,
    languages,
    currencyOptions,
    comparisonOptions,
    statOptions,
    comparisonStatOptions
} from '../data/advancedSearchData';
import SetAutocomplete from '../components/SetAutocomplete';

const AdvancedSearch: React.FC = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        cardName: '',
        rulesText: '',
        typeLine: '',
        typePartial: false,
        colors: [] as string[],
        colorComparison: '=',
        commanderColors: [] as string[],
        manaCost: '',
        stat1: 'cmc',
        stat1Mode: '=',
        stat1Value: '',
        formatStatus: 'legal',
        format: '',
        sets: [] as string[],
        block: [] as string[],
        rarities: [] as string[],
        criteria: [] as string[],
        criteriaPartial: false,
        priceCurrency: 'usd',
        priceMode: '<',
        priceValue: '',
        artist: '',
        flavorText: '',
        lore: '',
        language: '',
        display: 'grid',
        order: 'name',
        prefer: 'best',
        showAllPrints: false,
        includeExtras: false
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, checked } = e.target;
        if (name === 'typePartial' || name === 'criteriaPartial' || name === 'showAllPrints' || name === 'includeExtras') {
            setFormData(prev => ({ ...prev, [name]: checked }));
        } else {
            // For array-based checkboxes (colors, rarities, etc.)
            setFormData(prev => {
                const list = (prev as any)[name] as string[];
                return {
                    ...prev,
                    [name]: checked ? [...list, value] : list.filter(item => item !== value)
                };
            });
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const params = new URLSearchParams();

        if (formData.cardName) params.append('name', formData.cardName.trim());
        if (formData.rulesText) params.append('text', formData.rulesText.trim());
        if (formData.typeLine) params.append('type', formData.typeLine.trim());
        if (formData.colors.length > 0) {
            params.append('colors', formData.colors.join(','));
            params.append('colorMode', formData.colorComparison);
        }
        if (formData.commanderColors.length > 0) params.append('commanderColors', formData.commanderColors.join(','));
        if (formData.manaCost) params.append('manaCost', formData.manaCost.trim());

        if (formData.stat1Value) {
            params.append('stat', formData.stat1);
            params.append('statMode', formData.stat1Mode);
            params.append('statValue', formData.stat1Value);
        }

        if (formData.format) {
            params.append('format', formData.format);
            params.append('formatStatus', formData.formatStatus);
        }

        if (formData.sets.length > 0) params.append('set', formData.sets.join(','));
        if (formData.rarities.length > 0) params.append('rarity', formData.rarities.join(','));

        if (formData.artist) params.append('artist', formData.artist.trim());
        if (formData.flavorText) params.append('flavorText', formData.flavorText.trim());

        // Navigation parameters
        navigate(`/search?${params.toString()}`);
    };

    const colorMap: Record<string, string> = {
        W: 'White', U: 'Blue', B: 'Black', R: 'Red', G: 'Green', C: 'Colorless'
    };

    return (
        <div className="bg-light-bg dark:bg-[#050505] text-light-text dark:text-slate-300 min-h-screen font-sans selection:bg-light-primary dark:selection:bg-[#D4AF37] selection:text-white dark:selection:text-black">
            {/* Header */}
            <Navbar />


            <div className="max-w-4xl mx-auto pt-28 pb-12 px-4">
                <header className="mb-12 border-b border-light-primary/10 dark:border-white/10 pb-8">
                    <h1 className="font-display text-4xl text-light-primary dark:text-[#D4AF37] mb-2 tracking-wider">Advanced Search</h1>
                    <p className="text-light-text/60 dark:text-slate-500 text-sm">Search for any card, any way you want.</p>
                </header>

                <form onSubmit={handleSubmit} className="space-y-10">

                    {/* Card Identifiers */}
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
                            <label className="font-bold text-light-text dark:text-white md:text-right pt-2 md:col-span-1">Card Name</label>
                            <div className="md:col-span-3">
                                <input name="cardName" value={formData.cardName} onChange={handleInputChange} className="w-full bg-white dark:bg-[#12121A] border border-light-primary/20 dark:border-white/10 focus:border-light-primary dark:focus:border-[#D4AF37] px-4 py-2 rounded-sm text-light-text dark:text-white outline-none" placeholder='e.g. "Black Lotus"' type="text" />
                                <p className="text-xs text-light-text/50 dark:text-slate-500 mt-1">Any words in the name, exact or partial.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
                            <label className="font-bold text-light-text dark:text-white md:text-right pt-2 md:col-span-1">Rules Text</label>
                            <div className="md:col-span-3">
                                <input name="rulesText" value={formData.rulesText} onChange={handleInputChange} className="w-full bg-white dark:bg-[#12121A] border border-light-primary/20 dark:border-white/10 focus:border-light-primary dark:focus:border-[#D4AF37] px-4 py-2 rounded-sm text-light-text dark:text-white outline-none" placeholder='e.g. "Draw a card"' type="text" />
                                <p className="text-xs text-light-text/50 dark:text-slate-500 mt-1">Any words in the text box.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
                            <label className="font-bold text-light-text dark:text-white md:text-right pt-2 md:col-span-1">Type Line</label>
                            <div className="md:col-span-3">
                                <input name="typeLine" value={formData.typeLine} onChange={handleInputChange} className="w-full bg-white dark:bg-[#12121A] border border-light-primary/20 dark:border-white/10 focus:border-light-primary dark:focus:border-[#D4AF37] px-4 py-2 rounded-sm text-light-text dark:text-white outline-none" placeholder='e.g. "Legendary Creature"' type="text" />
                                <div className="mt-2">
                                    <label className="inline-flex items-center gap-2 text-sm text-light-text/50 dark:text-slate-400">
                                        <input type="checkbox" name="typePartial" checked={formData.typePartial} onChange={handleCheckboxChange} className="bg-white dark:bg-[#12121A] border border-light-primary/30 dark:border-white/20 rounded-sm w-4 h-4 accent-light-primary dark:accent-[#D4AF37]" />
                                        Allow partial type matches
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    <hr className="border-light-primary/10 dark:border-white/5" />

                    {/* Colors */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
                        <label className="font-bold text-light-text dark:text-white md:text-right pt-2 md:col-span-1">Colors</label>
                        <div className="md:col-span-3 space-y-4">
                            <div className="flex flex-wrap gap-6">
                                {[{ code: 'W', icon: 'w' }, { code: 'U', icon: 'u' }, { code: 'B', icon: 'b' }, { code: 'R', icon: 'r' }, { code: 'G', icon: 'g' }, { code: 'C', icon: 'c' }].map(color => (
                                    <label key={color.code} className="flex items-center gap-2 cursor-pointer group">
                                        <input type="checkbox" name="colors" value={color.code} onChange={handleCheckboxChange} className="bg-white dark:bg-[#12121A] border border-light-primary/30 dark:border-white/20 rounded-sm w-4 h-4 accent-light-primary dark:accent-[#D4AF37]" />
                                        <i className={`ms ms-${color.icon} ms-cost ms-shadow text-2xl group-hover:scale-110 transition-transform`}></i>
                                        <span className="text-sm font-medium">{colorMap[color.code]}</span>
                                    </label>
                                ))}
                            </div>
                            <div className="flex items-center gap-2">
                                <select name="colorComparison" value={formData.colorComparison} onChange={handleInputChange} className="bg-white dark:bg-[#12121A] border border-light-primary/20 dark:border-white/10 px-3 py-1 rounded-sm text-light-text dark:text-white outline-none text-sm">
                                    <option value="=">Exactly these colors</option>
                                    <option value=">=">Including these colors</option>
                                    <option value="<=">At most these colors</option>
                                </select>
                            </div>
                            <p className="text-xs text-light-text/50 dark:text-slate-500 italic">
                                "Including" means cards that are all the colors you select, with or without any others. "At most" means cards that have some or all of the colors you select, plus colorless.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
                        <label className="font-bold text-light-text dark:text-white md:text-right pt-2 md:col-span-1">Commander</label>
                        <div className="md:col-span-3">
                            <div className="flex flex-wrap gap-6">
                                {[{ code: 'W', icon: 'w' }, { code: 'U', icon: 'u' }, { code: 'B', icon: 'b' }, { code: 'R', icon: 'r' }, { code: 'G', icon: 'g' }, { code: 'C', icon: 'c' }].map(color => (
                                    <label key={`cmd-${color.code}`} className="flex items-center gap-2 cursor-pointer group">
                                        <input type="checkbox" name="commanderColors" value={color.code} onChange={handleCheckboxChange} className="bg-white dark:bg-[#12121A] border border-light-primary/30 dark:border-white/20 rounded-sm w-4 h-4 accent-light-primary dark:accent-[#D4AF37]" />
                                        <i className={`ms ms-${color.icon} ms-cost ms-shadow text-2xl group-hover:scale-110 transition-transform`}></i>
                                        <span className="text-sm font-medium">{colorMap[color.code]}</span>
                                    </label>
                                ))}
                            </div>
                            <p className="text-xs text-light-text/50 dark:text-slate-500 italic mt-2">
                                Select your commander's color identity, and only cards that fit in your deck will be returned.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
                        <label className="font-bold text-light-text dark:text-white md:text-right pt-2 md:col-span-1">Mana Cost</label>
                        <div className="md:col-span-3">
                            <input name="manaCost" value={formData.manaCost} onChange={handleInputChange} className="w-full max-w-xs bg-white dark:bg-[#12121A] border border-light-primary/20 dark:border-white/10 focus:border-light-primary dark:focus:border-[#D4AF37] px-4 py-2 rounded-sm text-light-text dark:text-white outline-none" placeholder='e.g. "{2}{U}{U}"' type="text" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
                        <label className="font-bold text-light-text dark:text-white md:text-right pt-2 md:col-span-1">Stats</label>
                        <div className="md:col-span-3 flex gap-2">
                            <select name="stat1" value={formData.stat1} onChange={handleInputChange} className="bg-white dark:bg-[#12121A] border border-light-primary/20 dark:border-white/10 px-3 py-2 rounded-sm text-light-text dark:text-white outline-none">
                                {statOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                            </select>
                            <select name="stat1Mode" value={formData.stat1Mode} onChange={handleInputChange} className="bg-white dark:bg-[#12121A] border border-light-primary/20 dark:border-white/10 px-3 py-2 rounded-sm text-light-text dark:text-white outline-none">
                                {comparisonStatOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                            </select>
                            <input name="stat1Value" value={formData.stat1Value} onChange={handleInputChange} className="bg-white dark:bg-[#12121A] border border-light-primary/20 dark:border-white/10 focus:border-light-primary dark:focus:border-[#D4AF37] px-4 py-2 rounded-sm text-light-text dark:text-white outline-none w-24" placeholder="Value" type="number" />
                        </div>
                    </div>

                    <hr className="border-light-primary/10 dark:border-white/5" />

                    {/* Formats & Sets */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
                        <label className="font-bold text-light-text dark:text-white md:text-right pt-2 md:col-span-1">Formats</label>
                        <div className="md:col-span-3 flex gap-2">
                            <select name="formatStatus" value={formData.formatStatus} onChange={handleInputChange} className="bg-white dark:bg-[#12121A] border border-light-primary/20 dark:border-white/10 px-3 py-2 rounded-sm text-light-text dark:text-white outline-none">
                                <option value="legal">Legal</option>
                                <option value="restricted">Restricted</option>
                                <option value="banned">Banned</option>
                            </select>
                            <select name="format" value={formData.format} onChange={handleInputChange} className="bg-white dark:bg-[#12121A] border border-light-primary/20 dark:border-white/10 px-3 py-2 rounded-sm text-light-text dark:text-white outline-none flex-grow max-w-xs">
                                <option value="">Select a format...</option>
                                {formats.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
                        <label className="font-bold text-light-text dark:text-white md:text-right pt-2 md:col-span-1">Sets</label>
                        <div className="md:col-span-3">
                            <SetAutocomplete
                                options={setTypes}
                                value={formData.sets}
                                onChange={(newSets) => setFormData(prev => ({ ...prev, sets: newSets }))}
                                placeholder="Enter a set name or choose from the list"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
                        <label className="font-bold text-light-text dark:text-white md:text-right pt-2 md:col-span-1">Block or Group</label>
                        <div className="md:col-span-3">
                            <SetAutocomplete
                                options={blocks}
                                value={formData.block}
                                onChange={(newBlocks) => setFormData(prev => ({ ...prev, block: newBlocks }))}
                                placeholder="Enter a block name or choose from the list"
                            />
                            <p className="text-xs text-light-text/50 dark:text-slate-500 mt-1">Restrict cards based on their set, block, or group.</p>
                        </div>
                    </div>

                    <hr className="border-light-primary/10 dark:border-white/5" />

                    {/* Rarity */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
                        <label className="font-bold text-light-text dark:text-white md:text-right pt-2 md:col-span-1">Rarity</label>
                        <div className="md:col-span-3 flex gap-6">
                            {rarities.map(r => (
                                <label key={r.value} className="flex items-center gap-2 cursor-pointer text-sm">
                                    <input type="checkbox" name="rarities" value={r.value} onChange={handleCheckboxChange} className="bg-white dark:bg-[#12121A] border border-light-primary/30 dark:border-white/20 rounded-sm w-4 h-4 accent-light-primary dark:accent-[#D4AF37]" />
                                    {r.label}
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Criteria */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
                        <label className="font-bold text-light-text dark:text-white md:text-right pt-2 md:col-span-1">Criteria</label>
                        <div className="md:col-span-3">
                            <select name="criteria" multiple className="w-full bg-white dark:bg-[#12121A] border border-light-primary/20 dark:border-white/10 px-3 py-2 rounded-sm text-light-text dark:text-white outline-none h-40">
                                {criteria.map(c => (
                                    <option key={c.value} value={c.value}>{c.label}</option>
                                ))}
                            </select>
                            <div className="mt-2">
                                <label className="inline-flex items-center gap-2 text-sm text-light-text/50 dark:text-slate-400">
                                    <input type="checkbox" name="criteriaPartial" checked={formData.criteriaPartial} onChange={handleCheckboxChange} className="bg-white dark:bg-[#12121A] border border-light-primary/30 dark:border-white/20 rounded-sm w-4 h-4 accent-light-primary dark:accent-[#D4AF37]" />
                                    Allow partial criteria matches
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
                        <label className="font-bold text-light-text dark:text-white md:text-right pt-2 md:col-span-1">Prices</label>
                        <div className="md:col-span-3 flex gap-2">
                            <select name="priceCurrency" value={formData.priceCurrency} onChange={handleInputChange} className="bg-white dark:bg-[#12121A] border border-light-primary/20 dark:border-white/10 px-3 py-2 rounded-sm text-light-text dark:text-white outline-none">
                                {currencyOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                            </select>
                            <select name="priceMode" value={formData.priceMode} onChange={handleInputChange} className="bg-white dark:bg-[#12121A] border border-light-primary/20 dark:border-white/10 px-3 py-2 rounded-sm text-light-text dark:text-white outline-none">
                                {comparisonOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                            </select>
                            <input name="priceValue" value={formData.priceValue} onChange={handleInputChange} className="bg-white dark:bg-[#12121A] border border-light-primary/20 dark:border-white/10 focus:border-light-primary dark:focus:border-[#D4AF37] px-4 py-2 rounded-sm text-light-text dark:text-white outline-none w-24" placeholder="0.00" type="number" step="0.01" />
                        </div>
                    </div>

                    <hr className="border-light-primary/10 dark:border-white/5" />

                    {/* Flavor & Lore */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
                        <label className="font-bold text-light-text dark:text-white md:text-right pt-2 md:col-span-1">Artist</label>
                        <div className="md:col-span-3">
                            <input name="artist" value={formData.artist} onChange={handleInputChange} className="w-full bg-white dark:bg-[#12121A] border border-light-primary/20 dark:border-white/10 focus:border-light-primary dark:focus:border-[#D4AF37] px-4 py-2 rounded-sm text-light-text dark:text-white outline-none" placeholder='e.g. "Magali"' type="text" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
                        <label className="font-bold text-light-text dark:text-white md:text-right pt-2 md:col-span-1">Flavor Text</label>
                        <div className="md:col-span-3">
                            <input name="flavorText" value={formData.flavorText} onChange={handleInputChange} className="w-full bg-white dark:bg-[#12121A] border border-light-primary/20 dark:border-white/10 focus:border-light-primary dark:focus:border-[#D4AF37] px-4 py-2 rounded-sm text-light-text dark:text-white outline-none" placeholder='e.g. "Kjeldoran"' type="text" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
                        <label className="font-bold text-light-text dark:text-white md:text-right pt-2 md:col-span-1">Lore Finder™</label>
                        <div className="md:col-span-3">
                            <input name="lore" value={formData.lore} onChange={handleInputChange} className="w-full bg-white dark:bg-[#12121A] border border-light-primary/20 dark:border-white/10 focus:border-light-primary dark:focus:border-[#D4AF37] px-4 py-2 rounded-sm text-light-text dark:text-white outline-none" placeholder='e.g. "Jhoira"' type="text" />
                            <p className="text-xs text-light-text/50 dark:text-slate-500 mt-1">Search for names or words in any part of the card.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
                        <label className="font-bold text-light-text dark:text-white md:text-right pt-2 md:col-span-1">Language</label>
                        <div className="md:col-span-3">
                            <select name="language" value={formData.language} onChange={handleInputChange} className="bg-white dark:bg-[#12121A] border border-light-primary/20 dark:border-white/10 px-3 py-2 rounded-sm text-light-text dark:text-white outline-none w-full max-w-xs">
                                <option value="">Default</option>
                                {languages.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
                            </select>
                        </div>
                    </div>

                    <hr className="border-light-primary/10 dark:border-white/5" />

                    {/* Preferences */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
                        <label className="font-bold text-light-text dark:text-white md:text-right pt-2 md:col-span-1">Preferences</label>
                        <div className="md:col-span-3 space-y-4">
                            <div className="flex flex-wrap gap-4">
                                <select name="display" value={formData.display} onChange={handleInputChange} className="bg-white dark:bg-[#12121A] border border-light-primary/20 dark:border-white/10 px-3 py-2 rounded-sm text-light-text dark:text-white outline-none">
                                    <option value="grid">Display as Images</option>
                                    <option value="checklist">Display as Checklist</option>
                                    <option value="text">Display as Text Only</option>
                                    <option value="full">Display as Full</option>
                                </select>
                                <select name="order" value={formData.order} onChange={handleInputChange} className="bg-white dark:bg-[#12121A] border border-light-primary/20 dark:border-white/10 px-3 py-2 rounded-sm text-light-text dark:text-white outline-none">
                                    <option value="name">Sort by Name</option>
                                    <option value="released">Sort by Release Date</option>
                                    <option value="set">Sort by Set/Number</option>
                                    <option value="rarity">Sort by Rarity</option>
                                    <option value="color">Sort by Color</option>
                                    <option value="usd">Sort by Price: USD</option>
                                    <option value="cmc">Sort by Mana Value</option>
                                    <option value="power">Sort by Power</option>
                                    <option value="toughness">Sort by Toughness</option>
                                    <option value="artist">Sort by Artist Name</option>
                                    <option value="edhrec">Sort by EDHREC Rank</option>
                                    <option value="review">Sort by Set Review</option>
                                </select>
                                <select name="prefer" value={formData.prefer} onChange={handleInputChange} className="bg-white dark:bg-[#12121A] border border-light-primary/20 dark:border-white/10 px-3 py-2 rounded-sm text-light-text dark:text-white outline-none">
                                    <option value="best">Prefer No Preference</option>
                                    <option value="newest">Prefer Newest</option>
                                    <option value="oldest">Prefer Oldest</option>
                                    <option value="promo">Prefer Promo</option>
                                    <option value="usdlow">Prefer Lowest USD</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm text-light-text/50 dark:text-slate-400">
                                    <input type="checkbox" name="showAllPrints" checked={formData.showAllPrints} onChange={handleCheckboxChange} className="bg-white dark:bg-[#12121A] border border-light-primary/30 dark:border-white/20 rounded-sm w-4 h-4 accent-light-primary dark:accent-[#D4AF37] mr-2" />
                                    Show all card prints
                                </label>
                                <label className="block text-sm text-light-text/50 dark:text-slate-400">
                                    <input type="checkbox" name="includeExtras" checked={formData.includeExtras} onChange={handleCheckboxChange} className="bg-white dark:bg-[#12121A] border border-light-primary/30 dark:border-white/20 rounded-sm w-4 h-4 accent-light-primary dark:accent-[#D4AF37] mr-2" />
                                    Include extra cards (tokens, planes, schemes, etc)
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="pt-8 text-center pb-20">
                        <button type="submit" className="w-full max-w-sm py-4 rounded-md font-display font-bold text-xl tracking-wider uppercase transition-all active:scale-[0.98] hover:brightness-125 bg-light-primary dark:bg-[#D4AF37] text-white dark:text-black shadow-[0_0_20px_rgba(90,4,150,0.3)] dark:shadow-[0_0_20px_rgba(212,175,55,0.4)]">
                            Search with these options
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
};

export default AdvancedSearch;
