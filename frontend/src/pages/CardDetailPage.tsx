import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import API_URL from '../config';

interface FaceData {
    face_id: number;
    face_index: number;
    name: string;
    mana_cost: string;
    cmc: number;
    oracle_text: string;
    flavor_text: string;
    power: string | null;
    toughness: string | null;
    Types?: Array<{ type_name: string }>;
    Subtypes?: Array<{ subtype_name: string }>;
    Keywords?: Array<{ keyword_name: string }>;
}

interface PriceData {
    price_point_id: number;
    date_recorded: string;
    market_price_usd: string | null;
    foil_price_usd: string | null;
}

interface EditionData {
    edition_id: string;
    card_id: string;
    set_code: string;
    rarity: string;
    artist: string;
    collector_number: string;
    image_url_normal: string;
    image_url_small: string;
    frame_version: string;
    finishes: string;
    is_promo: boolean;
    Set: {
        set_code: string;
        set_name: string;
        icon_svg_uri: string | null;
        release_date: string;
    };
    PricePoints?: PriceData[];
}

interface ColorIdentity {
    color_id: string;
}

interface LegalityPivot {
    standard: number;
    future: number;
    historic: number;
    timeless: number;
    gladiator: number;
    pioneer: number;
    modern: number;
    legacy: number;
    pauper: number;
    vintage: number;
    penny: number;
    commander: number;
    oathbreaker: number;
    standardbrawl: number;
    brawl: number;
    alchemy: number;
    paupercommander: number;
    duel: number;
    oldschool: number;
    premodern: number;
    predh: number;
}

interface CardData {
    card_id: string;
    oracle_id: string;
    name: string;
    layout: string;
    reserved_list: boolean;
    CardFaces: FaceData[];
    CardColorIdentities: ColorIdentity[];
    legalities: LegalityPivot | null;
    Editions: EditionData[];
}

interface GraphRelationship {
    partner: {
        id: string;
        name: string;
        image_url_small?: string;
    };
    relationship: string;
}

interface GraphData {
    card: any;
    relationships: GraphRelationship[];
    sets: any[];
    artists: any[];
}

const LEGALITY_LABELS: Record<string, string> = {
    standard: 'Standard', future: 'Future', historic: 'Historic', timeless: 'Timeless',
    gladiator: 'Gladiator', pioneer: 'Pioneer', modern: 'Modern', legacy: 'Legacy',
    pauper: 'Pauper', vintage: 'Vintage', penny: 'Penny', commander: 'Commander',
    oathbreaker: 'Oathbreaker', standardbrawl: 'Std Brawl', brawl: 'Brawl', alchemy: 'Alchemy',
    paupercommander: 'PDH', duel: 'Duel Cmdr', oldschool: 'Old School', premodern: 'Pre-Modern', predh: 'PreDH',
};

// 0 = legal, 1 = not_legal, 2 = banned, 3 = restricted
const LEGALITY_STATUS: Record<number, { label: string; color: string }> = {
    0: { label: 'LEGAL', color: 'bg-[#509f58] text-white border-transparent font-bold' },
    1: { label: 'NOT LEGAL', color: 'bg-[#cccbcb] text-white border-transparent font-bold' },
    2: { label: 'BANNED', color: 'bg-[#ffbd58] text-white border-transparent font-bold' }, // Using amber for banned as per some refs, or red
    3: { label: 'RESTRICTED', color: 'bg-[#f4ad42] text-white border-transparent font-bold' },
};

const RARITY_COLORS: Record<string, string> = {
    common: 'text-slate-400',
    uncommon: 'text-slate-300',
    rare: 'text-amber-400',
    mythic: 'text-orange-500',
    special: 'text-purple-400',
    bonus: 'text-pink-400',
};

const CardDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [card, setCard] = useState<CardData | null>(null);
    const [graphData, setGraphData] = useState<GraphData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedEdition, setSelectedEdition] = useState<number>(0);

    useEffect(() => {
        if (id) {
            fetchCard();
            fetchGraphData();
        }
    }, [id]);

    const fetchGraphData = async () => {
        try {
            const resp = await fetch(`${API_URL}/api/graph/card/${id}`);
            if (resp.ok) {
                const data = await resp.json();
                setGraphData(data);
            }
        } catch (err) {
            console.error('Failed to fetch graph data', err);
        }
    };

    const fetchCard = async () => {
        try {
            setLoading(true);
            const resp = await fetch(`${API_URL}/api/cards/${id}`);
            if (!resp.ok) throw new Error('Card not found');
            const data = await resp.json();
            setCard(data);

            // Track this card as recently viewed (fire-and-forget)
            const token = localStorage.getItem('token');
            if (token && data.card_id) {
                axios.post(
                    `${API_URL}/api/user/viewed/${data.card_id}`,
                    { name: data.name },
                    { headers: { Authorization: `Bearer ${token}` } }
                ).catch(() => { }); // swallow errors silently
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const MANA_ICONS: Record<string, string> = {
        'w': 'WhiteMana.png', 'u': 'BlueMana.png', 'b': 'BlackMana.png',
        'r': 'RedMana.png', 'g': 'GreenMana.png', 'c': 'ColourslessMana.png', 'x': 'ColourslessMana.png',
    };

    const renderManaSymbol = (code: string, key: string | number, size = 'w-6 h-6') => {
        const icon = MANA_ICONS[code.toLowerCase()];
        if (icon) {
            return <img key={key} src={`${API_URL}/icons/mana/${icon}`} alt={`{${code}}`} className={`${size} rounded-full inline-block mr-0.5`} />;
        }
        return (
            <span key={key} className={`inline-flex items-center justify-center ${size} rounded-full text-[10px] font-bold mr-0.5 bg-gray-700 text-gray-200 border border-gray-500/40`}>
                {code.toUpperCase()}
            </span>
        );
    };

    const formatManaCost = (manaCost: string) => {
        if (!manaCost) return null;
        const symbols = manaCost.match(/\{[^}]+\}/g) || [];
        return symbols.map((sym, i) => renderManaSymbol(sym.replace(/[{}]/g, ''), i, 'w-6 h-6'));
    };

    const formatOracleText = (text: string) => {
        if (!text) return null;
        return text.split('\n').map((line, i) => {
            const parts = line.split(/(\{.*?\})/g);
            return (
                <p key={i} className="mb-2 last:mb-0">
                    {parts.map((part, j) => {
                        if (part.match(/^\{.*\}$/)) {
                            const code = part.replace(/[{}]/g, '');
                            return renderManaSymbol(code, `${i}-${j}`, 'w-4 h-4');
                        }
                        return part;
                    })}
                </p>
            );
        });
    };

    const getRarityColor = (rarity: string) => RARITY_COLORS[rarity?.toLowerCase()] || 'text-slate-400';

    if (loading) {
        return (
            <div className="bg-light-bg dark:bg-[#050505] min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin w-8 h-8 border-2 border-light-primary dark:border-[#D4AF37] border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-light-text/50 dark:text-slate-500">Summoning card...</p>
                </div>
            </div>
        );
    }

    if (error || !card) {
        return (
            <div className="bg-light-bg dark:bg-[#050505] min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <span className="material-symbols-outlined text-6xl text-slate-700 mb-4">search_off</span>
                    <p className="text-red-400 mb-4">{error || 'Card not found'}</p>
                    <Link to="/dashboard" className="text-light-primary dark:text-[#D4AF37] hover:underline">← Back to Home</Link>
                </div>
            </div>
        );
    }

    const currentEdition = card.Editions[selectedEdition];
    const mainFace = card.CardFaces?.[0];
    const hasMultipleFaces = card.CardFaces && card.CardFaces.length > 1;

    // Build type line
    const buildTypeLine = (face: FaceData) => {
        const types = face.Types?.map(t => t.type_name).join(' ') || '';
        const subtypes = face.Subtypes?.map(s => s.subtype_name).join(' ') || '';
        if (types && subtypes) return `${types} — ${subtypes}`;
        return types || subtypes || '';
    };

    return (
        <div className="bg-light-bg dark:bg-[#050505] text-light-text dark:text-slate-300 min-h-screen font-sans">
            {/* Navbar */}
            <Navbar />

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 pt-28 pb-8">
                {/* Back button */}
                <button onClick={() => window.history.back()} className="text-light-primary dark:text-slate-500 hover:text-light-secondary dark:hover:text-[#D4AF37] transition-colors mb-6 flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">arrow_back</span>
                    Back
                </button>

                {/* Card Layout: Image center-left, details right */}
                <div className="flex flex-col lg:flex-row gap-8 items-start">

                    {/* Left column: Card image + color identity */}
                    <div className="w-full lg:w-[380px] flex-shrink-0 space-y-4">
                        {/* Color Identity pills */}
                        {card.CardColorIdentities && card.CardColorIdentities.length > 0 && (
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-light-text/50 dark:text-slate-500 uppercase tracking-wider">Color Identity</span>
                                <div className="flex gap-1">
                                    {card.CardColorIdentities.map(ci => {
                                        const code = ci.color_id.toLowerCase();
                                        return (
                                            <span key={ci.color_id} className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold mr-0.5
                                                ${code === 'w' ? 'bg-amber-100 text-amber-800' :
                                                    code === 'u' ? 'bg-blue-200 text-blue-800' :
                                                        code === 'b' ? 'bg-gray-700 text-gray-100' :
                                                            code === 'r' ? 'bg-red-200 text-red-800' :
                                                                code === 'g' ? 'bg-green-200 text-green-800' :
                                                                    'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200'}`}
                                            >
                                                {code.toUpperCase()}
                                            </span>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Card Image */}
                        <div className="relative group">
                            {currentEdition?.image_url_normal ? (
                                <img
                                    src={currentEdition.image_url_normal}
                                    alt={card.name}
                                    className="w-full rounded-2xl shadow-2xl shadow-black/40 dark:shadow-black/80 transition-transform duration-300 group-hover:scale-[1.02]"
                                />
                            ) : (
                                <div className="aspect-[2.5/3.5] bg-light-primary/5 dark:bg-[#1A1A24] rounded-2xl flex items-center justify-center border border-light-primary/10 dark:border-white/10">
                                    <span className="text-light-text/50 dark:text-slate-500">{card.name}</span>
                                </div>
                            )}
                        </div>

                        {/* Edition selector (if multiple) */}
                        {card.Editions.length > 1 && (
                            <div className="bg-white/50 dark:bg-[#12121A] rounded-lg border border-light-primary/10 dark:border-white/10 p-3">
                                <label className="text-xs text-light-text/50 dark:text-slate-500 uppercase tracking-wider mb-2 block">Printing</label>
                                <select
                                    value={selectedEdition}
                                    onChange={e => setSelectedEdition(Number(e.target.value))}
                                    className="w-full bg-white dark:bg-[#050505] border border-light-primary/20 dark:border-white/10 px-3 py-2 rounded text-sm text-light-text dark:text-white"
                                >
                                    {card.Editions.map((ed, i) => (
                                        <option key={ed.edition_id} value={i}>
                                            {ed.Set?.set_name} ({ed.set_code.toUpperCase()}) #{ed.collector_number}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* Reserved List badge */}
                        {card.reserved_list && (
                            <div className="flex items-center gap-2 px-3 py-2 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                                <span className="material-symbols-outlined text-amber-400 text-sm">verified</span>
                                <span className="text-xs text-amber-400 font-bold uppercase tracking-wider">Reserved List</span>
                            </div>
                        )}
                    </div>

                    {/* Right column: Card details */}
                    <div className="flex-grow min-w-0 space-y-6">
                        {/* Card name + mana cost header */}
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <h1 className="text-3xl font-display font-bold text-light-text dark:text-white">
                                    {card.name}
                                </h1>
                                <p className="text-light-text/50 dark:text-slate-500 text-sm mt-1">
                                    {card.layout !== 'normal' && (
                                        <span className="capitalize">{card.layout} • </span>
                                    )}
                                    {currentEdition?.Set?.set_name}
                                    <span className="mx-1">•</span>
                                    <span className={getRarityColor(currentEdition?.rarity)}>{currentEdition?.rarity}</span>
                                    <span className="mx-1">•</span>
                                    #{currentEdition?.collector_number}
                                </p>
                            </div>
                            {mainFace?.mana_cost && (
                                <div className="flex items-center flex-shrink-0">
                                    {formatManaCost(mainFace.mana_cost)}
                                    <span className="ml-2 text-xs text-light-text/40 dark:text-slate-600">({mainFace.cmc} MV)</span>
                                </div>
                            )}
                        </div>

                        {/* Card faces */}
                        {card.CardFaces?.map((face, faceIdx) => (
                            <div key={face.face_id} className="bg-white/50 dark:bg-[#12121A] rounded-lg border border-light-primary/10 dark:border-white/10 p-5 space-y-4">
                                {/* Face header (for multi-face cards) */}
                                {hasMultipleFaces && (
                                    <div className="flex items-center gap-3 border-b border-light-primary/10 dark:border-white/5 pb-3">
                                        <span className="text-xs text-light-text/40 dark:text-slate-600 uppercase tracking-wider">Face {faceIdx + 1}</span>
                                        <span className="font-medium text-light-text dark:text-white">{face.name}</span>
                                        {face.mana_cost && (
                                            <div className="ml-auto flex items-center">
                                                {formatManaCost(face.mana_cost)}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Type line */}
                                {buildTypeLine(face) && (
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-bold text-light-text dark:text-white tracking-wide">
                                            {buildTypeLine(face)}
                                        </span>
                                    </div>
                                )}

                                {/* Oracle text */}
                                {face.oracle_text && (
                                    <div className="text-sm text-light-text/80 dark:text-slate-300 leading-relaxed font-serif">
                                        {formatOracleText(face.oracle_text)}
                                    </div>
                                )}

                                {/* Flavor text */}
                                {face.flavor_text && (
                                    <div className="text-sm text-light-text/50 dark:text-slate-500 italic leading-relaxed mt-4">
                                        {formatOracleText(face.flavor_text)}
                                    </div>
                                )}

                                {/* Power/Toughness */}
                                {(face.power !== null || face.toughness !== null) && (
                                    <div className="flex items-center gap-2">
                                        <span className="px-3 py-1.5 bg-light-primary/10 dark:bg-[#D4AF37]/10 border border-light-primary/20 dark:border-[#D4AF37]/30 rounded-lg text-sm font-bold text-light-text dark:text-white">
                                            {face.power ?? '?'} / {face.toughness ?? '?'}
                                        </span>
                                    </div>
                                )}

                                {/* Keywords */}
                                {face.Keywords && face.Keywords.length > 0 && (
                                    <div className="flex flex-wrap gap-1.5">
                                        {face.Keywords.map(kw => (
                                            <span key={kw.keyword_name} className="px-2 py-0.5 text-xs bg-violet-500/10 text-violet-400 border border-violet-500/20 rounded">
                                                {kw.keyword_name}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}

                        {/* Edition details: Artist, Frame */}
                        {currentEdition && (
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                <div className="bg-white/50 dark:bg-[#12121A] rounded-lg border border-light-primary/10 dark:border-white/10 p-3">
                                    <span className="text-[10px] text-light-text/40 dark:text-slate-600 uppercase tracking-wider block mb-1">Artist</span>
                                    <span className="text-sm text-light-text dark:text-white">{currentEdition.artist || '—'}</span>
                                </div>
                                <div className="bg-white/50 dark:bg-[#12121A] rounded-lg border border-light-primary/10 dark:border-white/10 p-3">
                                    <span className="text-[10px] text-light-text/40 dark:text-slate-600 uppercase tracking-wider block mb-1">Frame</span>
                                    <span className="text-sm text-light-text dark:text-white">{currentEdition.frame_version || '—'}</span>
                                </div>
                                <div className="bg-white/50 dark:bg-[#12121A] rounded-lg border border-light-primary/10 dark:border-white/10 p-3">
                                    <span className="text-[10px] text-light-text/40 dark:text-slate-600 uppercase tracking-wider block mb-1">Finishes</span>
                                    <span className="text-sm text-light-text dark:text-white capitalize">{currentEdition.finishes || '—'}</span>
                                </div>
                                <div className="bg-white/50 dark:bg-[#12121A] rounded-lg border border-light-primary/10 dark:border-white/10 p-3">
                                    <span className="text-[10px] text-light-text/40 dark:text-slate-600 uppercase tracking-wider block mb-1">Promo</span>
                                    <span className="text-sm text-light-text dark:text-white">{currentEdition.is_promo ? 'Yes' : 'No'}</span>
                                </div>
                            </div>
                        )}

                        {/* Prices */}
                        {currentEdition?.PricePoints && currentEdition.PricePoints.length > 0 && (
                            <div className="bg-white/50 dark:bg-[#12121A] rounded-lg border border-light-primary/10 dark:border-white/10 p-5">
                                <h3 className="text-xs text-light-text/50 dark:text-slate-500 uppercase tracking-wider font-bold mb-3">Market Prices</h3>
                                <div className="flex gap-6">
                                    {currentEdition.PricePoints[0].market_price_usd && (
                                        <div>
                                            <span className="text-[10px] text-light-text/40 dark:text-slate-600 uppercase block">Regular</span>
                                            <span className="text-2xl font-display font-bold text-emerald-500">${currentEdition.PricePoints[0].market_price_usd}</span>
                                        </div>
                                    )}
                                    {currentEdition.PricePoints[0].foil_price_usd && (
                                        <div>
                                            <span className="text-[10px] text-light-text/40 dark:text-slate-600 uppercase block">Foil</span>
                                            <span className="text-2xl font-display font-bold text-amber-400">${currentEdition.PricePoints[0].foil_price_usd}</span>
                                        </div>
                                    )}
                                </div>
                                <p className="text-[10px] text-light-text/30 dark:text-slate-600 mt-2">
                                    as of {new Date(currentEdition.PricePoints[0].date_recorded).toLocaleDateString()}
                                </p>
                            </div>
                        )}

                        {/* Graph Relationships (Melds, Transforms) */}
                        {graphData && graphData.relationships.length > 0 && (
                            <div className="bg-gradient-to-br from-violet-900/20 to-fuchsia-900/10 rounded-xl border border-violet-500/20 p-5 shadow-lg shadow-violet-900/5">
                                <h3 className="text-xs text-violet-400 uppercase tracking-widest font-bold mb-4 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-sm">hub</span>
                                    Graph Connections
                                </h3>
                                <div className="space-y-4">
                                    {graphData.relationships.map((rel, idx) => (
                                        <div key={idx} className="flex items-center gap-4 group">
                                            <div className="text-[10px] text-violet-400/60 uppercase font-mono px-2 py-1 bg-violet-500/5 border border-violet-500/10 rounded">
                                                {rel.relationship.replace('_', ' ')}
                                            </div>
                                            <Link
                                                to={`/card/${rel.partner.id}`}
                                                className="text-white hover:text-violet-400 font-medium transition-colors flex-grow capitalize"
                                            >
                                                {rel.partner.name}
                                            </Link>
                                            <Link
                                                to={`/card/${rel.partner.id}`}
                                                className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] text-violet-400 hover:underline"
                                            >
                                                View Partner →
                                            </Link>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Bottom sections: Legality + All printings */}
                <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Format Legality Grid */}
                    {card.legalities && (
                        <div className="bg-white/50 dark:bg-[#12121A] rounded-lg border border-light-primary/10 dark:border-white/10 p-5">
                            <h3 className="text-xs text-light-text/50 dark:text-slate-500 uppercase tracking-wider font-bold mb-4 border-b border-light-primary/10 dark:border-white/10 pb-2">Legality</h3>
                            <div className="grid grid-cols-2 gap-x-8 gap-y-2">
                                {Object.entries(LEGALITY_LABELS).map(([key, label]) => {
                                    const status = (card.legalities as any)?.[key] ?? 1;
                                    const statusInfo = LEGALITY_STATUS[status] || LEGALITY_STATUS[1];
                                    return (
                                        <div key={key} className="flex items-center justify-between py-0.5">
                                            <span className={`px-2 py-0.5 rounded text-[10px] uppercase tracking-wider min-w-[80px] text-center ${statusInfo.color}`}>
                                                {statusInfo.label}
                                            </span>
                                            <span className="font-medium text-sm text-light-text dark:text-gray-300">{label}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* All Printings */}
                    {card.Editions.length > 0 && (
                        <div className="bg-white/50 dark:bg-[#12121A] rounded-lg border border-light-primary/10 dark:border-white/10 p-5">
                            <h3 className="text-xs text-light-text/50 dark:text-slate-500 uppercase tracking-wider font-bold mb-4">
                                All Printings ({card.Editions.length})
                            </h3>
                            <div className="space-y-1 max-h-72 overflow-y-auto">
                                {card.Editions.map((ed, i) => (
                                    <div
                                        key={ed.edition_id}
                                        onClick={() => setSelectedEdition(i)}
                                        className={`flex items-center gap-3 px-3 py-2 rounded cursor-pointer transition-colors ${i === selectedEdition
                                            ? 'bg-light-primary/10 dark:bg-[#D4AF37]/10 border border-light-primary/30 dark:border-[#D4AF37]/30'
                                            : 'hover:bg-light-primary/5 dark:hover:bg-white/5 border border-transparent'}`}
                                    >
                                        {ed.Set?.icon_svg_uri ? (
                                            <img src={ed.Set.icon_svg_uri} alt="" className="w-5 h-5" style={{ filter: 'var(--set-icon-filter, none)' }} />
                                        ) : (
                                            <i className={`ss ss-${ed.set_code.toLowerCase()} ss-2x text-light-primary dark:text-slate-400`}></i>
                                        )}
                                        <div className="flex-grow min-w-0">
                                            <span className="text-sm text-light-text dark:text-white truncate block">{ed.Set?.set_name}</span>
                                            <span className="text-[10px] text-light-text/40 dark:text-slate-600">
                                                #{ed.collector_number} • <span className={getRarityColor(ed.rarity)}>{ed.rarity}</span>
                                            </span>
                                        </div>
                                        {ed.PricePoints?.[0]?.market_price_usd && (
                                            <span className="text-xs text-emerald-400 font-mono">${ed.PricePoints[0].market_price_usd}</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                :root { --set-icon-filter: brightness(0) saturate(100%) invert(25%) sepia(30%) saturate(500%) hue-rotate(200deg); }
                .dark { --set-icon-filter: brightness(0) saturate(100%) invert(70%) sepia(10%) saturate(200%) hue-rotate(200deg); }
            `}</style>
        </div>
    );
};

export default CardDetailPage;
