import React from 'react';
import { Link } from 'react-router-dom';

const AdvancedSearch: React.FC = () => {
    return (
        <div className="bg-[#050505] text-slate-300 min-h-screen font-sans selection:bg-[#D4AF37] selection:text-black">
            {/* Header */}
            <nav className="sticky top-0 z-50 bg-[#12121A] border-b border-white/5 px-4 h-14 flex items-center justify-between shadow-2xl">
                <div className="flex items-center gap-6">
                    <Link to="/dashboard" className="flex items-center gap-2 cursor-pointer group">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#D4AF37] to-[#7C3AED] flex items-center justify-center overflow-hidden">
                            <span className="material-symbols-outlined text-white text-xl">auto_fix_high</span>
                        </div>
                        <span className="font-display text-white text-sm tracking-widest hidden md:block">MANA NEXUS</span>
                    </Link>
                </div>
                <div className="flex items-center">
                    <div className="hidden lg:flex items-center">
                        <div className="w-[1px] h-6 bg-white/10 mx-2"></div>
                        <Link className="flex items-center gap-2 text-[13px] font-medium text-white transition-colors uppercase tracking-wider px-3" to="/advanced">
                            <span className="material-symbols-outlined text-[18px]">auto_stories</span>
                            Advanced
                        </Link>
                        <a className="flex items-center gap-2 text-[13px] font-medium text-gray-400 hover:text-white transition-colors uppercase tracking-wider px-3" href="#">
                            <span className="material-symbols-outlined text-[18px]">style</span>
                            Sets
                        </a>
                        <div className="w-[1px] h-6 bg-white/10 mx-2"></div>
                    </div>
                    <div className="flex items-center gap-4 ml-2">
                        {localStorage.getItem('token') ? (
                            <Link to="/profile" className="text-gray-400 hover:text-white transition-colors" title="User Profile">
                                <span className="material-symbols-outlined">account_circle</span>
                            </Link>
                        ) : (
                            <Link to="/login" className="text-gray-400 hover:text-white transition-colors">
                                <span className="material-symbols-outlined">login</span>
                            </Link>
                        )}
                    </div>
                </div>
            </nav>

            <div className="max-w-4xl mx-auto py-20 px-4">
                <header className="text-center mb-20">
                    <h1 className="font-display text-5xl md:text-7xl text-[#D4AF37] mb-6 tracking-[0.25em]">Advanced Search</h1>
                    <div className="h-px w-48 bg-gradient-to-r from-transparent via-[#D4AF37]/40 to-transparent mx-auto mb-6"></div>
                    <p className="text-slate-500 font-light tracking-[0.3em] italic uppercase text-[10px]">The Unbound Archive of Mana Nexus</p>
                </header>

                <form className="space-y-16" onSubmit={(e) => e.preventDefault()}>
                    <div className="space-y-12">
                        <section>
                            <label className="font-display text-[#D4AF37] uppercase tracking-[0.2em] text-sm flex items-center gap-3 mb-4">
                                <span className="material-symbols-outlined text-[#D4AF37] drop-shadow-[0_0_12px_rgba(212,175,55,0.5)]">fingerprint</span>
                                Card Name
                            </label>
                            <input className="w-full bg-[rgba(15,15,15,0.6)] border border-[#D4AF37]/15 focus:border-[#D4AF37] focus:shadow-[0_0_15px_rgba(212,175,55,0.4)] focus:bg-[#D4AF37]/5 px-6 py-4 rounded-sm text-white text-lg placeholder:text-slate-700 outline-none transition-all" placeholder='e.g. "Black Lotus" or "Fire // Ice"' type="text" />
                        </section>
                        <section>
                            <label className="font-display text-[#D4AF37] uppercase tracking-[0.2em] text-sm flex items-center gap-3 mb-4">
                                <span className="material-symbols-outlined text-[#D4AF37] drop-shadow-[0_0_12px_rgba(212,175,55,0.5)]">auto_stories</span>
                                Rules Text
                            </label>
                            <div className="flex gap-3">
                                <input className="flex-grow bg-[rgba(15,15,15,0.6)] border border-[#D4AF37]/15 focus:border-[#D4AF37] focus:shadow-[0_0_15px_rgba(212,175,55,0.4)] focus:bg-[#D4AF37]/5 px-6 py-4 rounded-sm text-white placeholder:text-slate-700 outline-none transition-all" placeholder='e.g. "Draw a card" or "Trample"' type="text" />
                            </div>
                        </section>
                        <section>
                            <label className="font-display text-[#D4AF37] uppercase tracking-[0.2em] text-sm flex items-center gap-3 mb-4">
                                <span className="material-symbols-outlined text-[#D4AF37] drop-shadow-[0_0_12px_rgba(212,175,55,0.5)]">category</span>
                                Type Line
                            </label>
                            <input className="w-full bg-[rgba(15,15,15,0.6)] border border-[#D4AF37]/15 focus:border-[#D4AF37] focus:shadow-[0_0_15px_rgba(212,175,55,0.4)] focus:bg-[#D4AF37]/5 px-6 py-4 rounded-sm text-white mb-4 placeholder:text-slate-700 outline-none transition-all" placeholder='e.g. "Legendary Creature Dragon"' type="text" />
                        </section>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                        <section>
                            <label className="font-display text-[#D4AF37] uppercase tracking-[0.2em] text-sm flex items-center gap-3 mb-4">
                                <span className="material-symbols-outlined text-[#D4AF37] drop-shadow-[0_0_12px_rgba(212,175,55,0.5)]">palette</span>
                                Colors
                            </label>
                            <div className="flex gap-3 mb-6">
                                <div className="w-8 h-8 rounded-full border border-[#D4AF37]/30 bg-yellow-100/5 cursor-pointer hover:border-[#D4AF37] hover:shadow-[0_0_10px_rgba(212,175,55,0.4)] transition-all"></div>
                                <div className="w-8 h-8 rounded-full border border-[#D4AF37]/30 bg-blue-500/5 cursor-pointer hover:border-[#D4AF37] hover:shadow-[0_0_10px_rgba(212,175,55,0.4)] transition-all"></div>
                                <div className="w-8 h-8 rounded-full border border-[#D4AF37]/30 bg-slate-900/40 cursor-pointer hover:border-[#D4AF37] hover:shadow-[0_0_10px_rgba(212,175,55,0.4)] transition-all"></div>
                                <div className="w-8 h-8 rounded-full border border-[#D4AF37]/30 bg-red-500/5 cursor-pointer hover:border-[#D4AF37] hover:shadow-[0_0_10px_rgba(212,175,55,0.4)] transition-all"></div>
                                <div className="w-8 h-8 rounded-full border border-[#D4AF37]/30 bg-green-500/5 cursor-pointer hover:border-[#D4AF37] hover:shadow-[0_0_10px_rgba(212,175,55,0.4)] transition-all"></div>
                                <div className="w-8 h-8 rounded-full border border-[#D4AF37]/30 bg-slate-400/5 cursor-pointer hover:border-[#D4AF37] hover:shadow-[0_0_10px_rgba(212,175,55,0.4)] transition-all"></div>
                            </div>
                        </section>
                        <section>
                            <label className="font-display text-[#D4AF37] uppercase tracking-[0.2em] text-sm flex items-center gap-3 mb-4">
                                <span className="material-symbols-outlined text-[#D4AF37] drop-shadow-[0_0_12px_rgba(212,175,55,0.5)]">diamond</span>
                                Rarity
                            </label>
                            <div className="flex flex-wrap gap-6 pt-2">
                                <label className="flex items-center gap-3 cursor-pointer text-[10px] tracking-tighter"><input className="appearance-none w-4 h-4 rounded-full border border-[#D4AF37]/30 bg-black/60 checked:border-[#D4AF37] checked:shadow-[0_0_10px_rgba(212,175,55,0.4)]" type="checkbox" /> <span className="text-slate-400">COMMON</span></label>
                                <label className="flex items-center gap-3 cursor-pointer text-[10px] tracking-tighter"><input className="appearance-none w-4 h-4 rounded-full border border-[#D4AF37]/30 bg-black/60 checked:border-[#D4AF37] checked:shadow-[0_0_10px_rgba(212,175,55,0.4)]" type="checkbox" /> <span className="text-slate-300">UNCOMMON</span></label>
                                <label className="flex items-center gap-3 cursor-pointer text-[10px] tracking-tighter text-[#D4AF37]"><input className="appearance-none w-4 h-4 rounded-full border border-[#D4AF37]/30 bg-black/60 checked:border-[#D4AF37] checked:shadow-[0_0_10px_rgba(212,175,55,0.4)]" type="checkbox" /> RARE</label>
                                <label className="flex items-center gap-3 cursor-pointer text-[10px] tracking-tighter text-orange-500"><input className="appearance-none w-4 h-4 rounded-full border border-[#D4AF37]/30 bg-black/60 checked:border-[#D4AF37] checked:shadow-[0_0_10px_rgba(212,175,55,0.4)]" type="checkbox" /> MYTHIC</label>
                            </div>
                        </section>
                    </div>

                    <div className="pt-8 text-center">
                        <button className="w-full max-w-2xl py-8 rounded-sm font-display font-bold text-2xl tracking-[0.4em] uppercase transition-all active:scale-[0.98] hover:brightness-125 bg-[#050505] border-2 border-transparent relative shadow-[0_0_25px_rgba(212,175,55,0.2)]"
                            style={{
                                backgroundImage: 'linear-gradient(#050505, #050505), linear-gradient(135deg, #D4AF37 0%, #AA8A2E 50%, #8C6D1F 100%)',
                                backgroundOrigin: 'border-box',
                                backgroundClip: 'padding-box, border-box'
                            }}>
                            <span className="bg-gradient-to-br from-[#D4AF37] via-[#AA8A2E] to-[#8C6D1F] bg-clip-text text-transparent">Commence Search</span>
                        </button>
                    </div>
                </form>

                <footer className="mt-32 pb-12 text-center text-slate-800 text-[10px] uppercase tracking-[0.5em] font-medium">
                    © Mana Nexus Archive • Plane of Advanced Divination • v4.0.0
                </footer>
            </div>
        </div>
    );
};

export default AdvancedSearch;
