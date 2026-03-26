import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

interface SetData {
    set_code: string;
    set_name: string;
    release_date: string;
    set_type: string;
    card_count: number;
    edition_count: number;
    parent_set_code: string | null;
    icon_svg_uri: string | null;
    digital: boolean;
    block_name: string | null;
    block_code: string | null;
    nonfoil_only: boolean;
    foil_only: boolean;
}

interface GroupedSet extends SetData {
    children: SetData[];
    isChild: boolean;
}

const SetsPage: React.FC = () => {
    const [sets, setSets] = useState<SetData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [sortBy, setSortBy] = useState<'release_date' | 'set_name'>('release_date');
    const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('DESC');
    const [typeFilter, setTypeFilter] = useState<string>('');
    const [expandedSets, setExpandedSets] = useState<Set<string>>(new Set());
    const navigate = useNavigate();

    useEffect(() => {
        fetchData();
    }, [sortBy, sortOrder]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const resp = await fetch(`http://localhost:3000/api/sets?sort=${sortBy}&order=${sortOrder}`);
            if (!resp.ok) throw new Error('Failed to fetch sets');
            const setsData = await resp.json();
            setSets(setsData);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Build grouped sets list using parent_set_code from DB
    const groupedSets = useMemo(() => {
        const ourCodes = new Set(sets.map(s => s.set_code));

        // Identify children: sets that have a parent_set_code pointing to a set we have
        const childCodes = new Set<string>();
        const childrenMap: Record<string, SetData[]> = {};

        for (const s of sets) {
            if (s.parent_set_code && ourCodes.has(s.parent_set_code)) {
                childCodes.add(s.set_code);
                if (!childrenMap[s.parent_set_code]) childrenMap[s.parent_set_code] = [];
                childrenMap[s.parent_set_code].push(s);
            }
        }

        // Build result: parents with their children attached
        const result: GroupedSet[] = [];
        for (const s of sets) {
            if (childCodes.has(s.set_code)) continue; // skip children in top-level

            const children = childrenMap[s.set_code] || [];
            result.push({
                ...s,
                children,
                isChild: false,
            });
        }
        return result;
    }, [sets]);

    // Apply type filter
    const filteredSets = typeFilter
        ? groupedSets.filter(s => {
            const parentMatches = s.set_type?.toLowerCase().includes(typeFilter.toLowerCase());
            const childMatches = s.children.some(c => c.set_type?.toLowerCase().includes(typeFilter.toLowerCase()));
            return parentMatches || childMatches;
        })
        : groupedSets;

    const toggleExpanded = (code: string) => {
        setExpandedSets(prev => {
            const next = new Set(prev);
            if (next.has(code)) next.delete(code);
            else next.add(code);
            return next;
        });
    };

    const formatDate = (dateStr: string) => {
        if (!dateStr) return '—';
        return new Date(dateStr).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getSetTypeColor = (type: string) => {
        const colors: Record<string, string> = {
            'core': 'bg-blue-500/20 text-blue-400',
            'expansion': 'bg-green-500/20 text-green-400',
            'masters': 'bg-purple-500/20 text-purple-400',
            'draft_innovation': 'bg-amber-500/20 text-amber-400',
            'commander': 'bg-red-500/20 text-red-400',
            'promo': 'bg-pink-500/20 text-pink-400',
            'token': 'bg-cyan-500/20 text-cyan-400',
            'memorabilia': 'bg-indigo-500/20 text-indigo-400',
            'eternal': 'bg-emerald-500/20 text-emerald-400',
            'alchemy': 'bg-violet-500/20 text-violet-400',
            'funny': 'bg-yellow-500/20 text-yellow-400',
        };
        return colors[type?.toLowerCase()] || 'bg-slate-500/20 text-slate-400';
    };

    const SetIcon: React.FC<{ code: string; iconUrl?: string | null; className?: string }> = ({ code, iconUrl, className = '' }) => {
        if (iconUrl) {
            return <img src={iconUrl} alt="" className={`inline-block ${className}`} style={{ width: '1.5em', height: '1.5em', filter: 'var(--set-icon-filter, none)' }} />;
        }
        return <i className={`ss ss-${code.toLowerCase()} ss-2x ${className}`}></i>;
    };

    // Count total sets including children
    const totalSetCount = filteredSets.reduce((acc, s) => acc + 1 + s.children.length, 0);

    return (
        <div className="bg-light-bg dark:bg-[#050505] text-light-text dark:text-slate-300 min-h-screen font-sans">
            {/* Navbar */}
            <Navbar />

            <div className="max-w-6xl mx-auto pt-28 pb-8 px-4">
                {/* Filter Bar */}
                <div className="flex flex-wrap items-center gap-4 mb-6 p-4 bg-white/50 dark:bg-[#12121A] rounded-lg border border-light-primary/20 dark:border-white/10">
                    <span className="text-sm font-bold text-light-text dark:text-white">
                        {totalSetCount} sets
                    </span>
                    <span className="text-light-text/50 dark:text-slate-400">sorted by</span>
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as 'release_date' | 'set_name')}
                        className="bg-white dark:bg-[#050505] border border-light-primary/20 dark:border-white/10 px-3 py-1.5 rounded text-sm text-light-text dark:text-white"
                    >
                        <option value="release_date">Release Date</option>
                        <option value="set_name">Name</option>
                    </select>
                    <button
                        onClick={() => setSortOrder(prev => prev === 'ASC' ? 'DESC' : 'ASC')}
                        className="text-light-primary dark:text-slate-400 hover:text-light-secondary dark:hover:text-[#D4AF37] transition-colors"
                    >
                        {sortOrder === 'DESC' ? '↓' : '↑'}
                    </button>
                    <span className="text-light-text/50 dark:text-slate-400">of type</span>
                    <select
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                        className="bg-white dark:bg-[#050505] border border-light-primary/20 dark:border-white/10 px-3 py-1.5 rounded text-sm text-light-text dark:text-white"
                    >
                        <option value="">Any</option>
                        <option value="core">Core</option>
                        <option value="expansion">Expansion</option>
                        <option value="masters">Masters</option>
                        <option value="commander">Commander</option>
                        <option value="draft_innovation">Draft Innovation</option>
                        <option value="promo">Promo</option>
                        <option value="token">Token</option>
                        <option value="memorabilia">Memorabilia</option>
                        <option value="eternal">Eternal</option>
                    </select>
                </div>

                {/* Sets Table */}
                {loading ? (
                    <div className="text-center py-20">
                        <div className="animate-spin w-8 h-8 border-2 border-light-primary dark:border-[#D4AF37] border-t-transparent rounded-full mx-auto mb-4"></div>
                        <p className="text-light-text/50 dark:text-slate-500">Loading sets...</p>
                    </div>
                ) : error ? (
                    <div className="text-center py-20 text-red-500">
                        <p>Error: {error}</p>
                    </div>
                ) : (
                    <div className="bg-white/50 dark:bg-[#12121A] rounded-lg border border-light-primary/20 dark:border-white/10 overflow-hidden">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-light-primary/10 dark:border-white/10 text-left">
                                    <th className="px-4 py-3 text-xs uppercase tracking-wider text-light-text/50 dark:text-slate-500 font-bold">Name</th>
                                    <th className="px-4 py-3 text-xs uppercase tracking-wider text-light-text/50 dark:text-slate-500 font-bold">Cards</th>
                                    <th className="px-4 py-3 text-xs uppercase tracking-wider text-light-text/50 dark:text-slate-500 font-bold">Date</th>
                                    <th className="px-4 py-3 text-xs uppercase tracking-wider text-light-text/50 dark:text-slate-500 font-bold">Type</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredSets.map((set, index) => {
                                    const hasChildren = set.children.length > 0;
                                    const isExpanded = expandedSets.has(set.set_code);

                                    return (
                                        <React.Fragment key={set.set_code}>
                                            {/* Parent row */}
                                            <tr
                                                className={`border-b border-light-primary/5 dark:border-white/5 hover:bg-light-primary/5 dark:hover:bg-white/5 transition-colors cursor-pointer ${index % 2 === 0 ? 'bg-white/30 dark:bg-white/[0.02]' : ''}`}
                                                onClick={() => navigate(`/sets/${set.set_code}`)}
                                            >
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-3">
                                                        {hasChildren && (
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); toggleExpanded(set.set_code); }}
                                                                className="text-light-text/40 dark:text-slate-500 hover:text-light-primary dark:hover:text-white transition-colors w-5 flex-shrink-0"
                                                            >
                                                                <span className={`material-symbols-outlined text-[16px] transition-transform ${isExpanded ? 'rotate-90' : ''}`}>
                                                                    chevron_right
                                                                </span>
                                                            </button>
                                                        )}
                                                        {!hasChildren && <span className="w-5 flex-shrink-0" />}
                                                        <SetIcon code={set.set_code} iconUrl={set.icon_svg_uri} className="text-light-primary dark:text-slate-400 flex-shrink-0" />
                                                        <div>
                                                            <span className="font-medium text-light-text dark:text-white hover:text-light-primary dark:hover:text-[#D4AF37] transition-colors">
                                                                {set.set_name}
                                                            </span>
                                                            <span className="ml-2 text-xs text-light-text/40 dark:text-slate-500 uppercase">{set.set_code}</span>
                                                            {hasChildren && (
                                                                <span className="ml-2 text-[10px] text-light-text/30 dark:text-slate-600">
                                                                    +{set.children.length} sub-set{set.children.length !== 1 ? 's' : ''}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-light-text/70 dark:text-slate-400">
                                                    {set.card_count || '—'}
                                                </td>
                                                <td className="px-4 py-3 text-light-text/70 dark:text-slate-400">
                                                    {formatDate(set.release_date)}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className={`text-xs px-2 py-0.5 rounded ${getSetTypeColor(set.set_type)}`}>
                                                        {set.set_type || '—'}
                                                    </span>
                                                </td>
                                            </tr>

                                            {/* Child rows */}
                                            {isExpanded && set.children.map((child) => (
                                                <tr
                                                    key={child.set_code}
                                                    className="border-b border-light-primary/5 dark:border-white/5 hover:bg-light-primary/5 dark:hover:bg-white/5 transition-colors cursor-pointer bg-light-primary/[0.02] dark:bg-white/[0.01]"
                                                    onClick={() => navigate(`/sets/${child.set_code}`)}
                                                >
                                                    <td className="px-4 py-2.5">
                                                        <div className="flex items-center gap-3 pl-8">
                                                            <span className="text-light-text/20 dark:text-slate-700 text-xs flex-shrink-0">└</span>
                                                            <SetIcon code={child.set_code} iconUrl={child.icon_svg_uri} className="text-light-primary/60 dark:text-slate-500 flex-shrink-0" />
                                                            <div>
                                                                <span className="text-sm text-light-text/80 dark:text-slate-400 hover:text-light-primary dark:hover:text-[#D4AF37] transition-colors">
                                                                    {child.set_name}
                                                                </span>
                                                                <span className="ml-2 text-xs text-light-text/30 dark:text-slate-600 uppercase">{child.set_code}</span>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-2.5 text-sm text-light-text/50 dark:text-slate-500">
                                                        {child.card_count || '—'}
                                                    </td>
                                                    <td className="px-4 py-2.5 text-sm text-light-text/50 dark:text-slate-500">
                                                        {formatDate(child.release_date)}
                                                    </td>
                                                    <td className="px-4 py-2.5">
                                                        <span className={`text-xs px-2 py-0.5 rounded ${getSetTypeColor(child.set_type)}`}>
                                                            {child.set_type || '—'}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </React.Fragment>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <style>{`
                :root { --set-icon-filter: brightness(0) saturate(100%) invert(25%) sepia(30%) saturate(500%) hue-rotate(200deg); }
                .dark { --set-icon-filter: brightness(0) saturate(100%) invert(70%) sepia(10%) saturate(200%) hue-rotate(200deg); }
            `}</style>
        </div>
    );
};

export default SetsPage;
