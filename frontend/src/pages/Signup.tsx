import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

const Signup: React.FC = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await axios.post('http://localhost:3000/api/auth/signup', { username, email, password });
            console.log('Signup successful:', res.data);
            localStorage.setItem('token', res.data.token);
            navigate('/dashboard');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Signup failed');
        }
    };

    return (
        <div className="bg-background-light dark:bg-obsidian font-display min-h-screen flex flex-col relative overflow-x-hidden selection:bg-primary/30 selection:text-white">
            {/* Background Effects */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,#1e1b4b_0%,#050505_60%)] opacity-80"></div>
                <div className="absolute -top-[10%] -left-[10%] w-[50vw] h-[50vw] bg-[radial-gradient(circle,rgba(147,51,234,0.15)_0%,rgba(0,0,0,0)_70%)] animate-pulse" style={{ animationDuration: '4000ms' }}></div>
                <div className="absolute -bottom-[10%] -right-[10%] w-[50vw] h-[50vw] bg-[radial-gradient(circle,rgba(20,184,166,0.15)_0%,rgba(0,0,0,0)_70%)] animate-pulse" style={{ animationDuration: '5000ms' }}></div>
            </div>

            <div className="relative z-10 flex flex-1 flex-col items-center justify-center p-4 sm:p-6 w-full">
                <main className="w-full max-w-[480px] bg-[rgba(32,29,18,0.6)] backdrop-blur-md border border-primary/40 rounded-xl shadow-[0_0_15px_rgba(212,175,53,0.2)] relative overflow-hidden flex flex-col transition-all duration-300 hover:shadow-[0_0_20px_rgba(212,175,53,0.3)]">
                    {/* Decorative corners */}
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-primary/60 z-20 rounded-tl-lg"></div>
                    <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-primary/60 z-20 rounded-tr-lg"></div>
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-primary/60 z-20 rounded-bl-lg"></div>
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-primary/60 z-20 rounded-br-lg"></div>

                    {/* Header */}
                    <div className="pt-8 pb-4 px-8 text-center border-b border-primary/10">
                        <h1 className="text-3xl font-black uppercase tracking-tight text-white mb-1 drop-shadow-md">Join the Nexus</h1>
                        <p className="text-primary/70 text-sm font-normal leading-tight tracking-wide">Catalog your collection. Dominate the meta.</p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSignup} className="px-8 py-6 flex flex-col gap-4">
                        {error && <p className="text-red-500 text-xs text-center">{error}</p>}

                        <div className="group">
                            <label className="block text-primary/80 text-[10px] font-bold uppercase tracking-[0.2em] mb-1.5" htmlFor="username">Username</label>
                            <div className="relative flex w-full items-center">
                                <div className="absolute left-4 text-primary/50 flex items-center justify-center pointer-events-none">
                                    <span className="material-symbols-outlined text-[18px]">person</span>
                                </div>
                                <input
                                    className="flex w-full min-w-0 flex-1 rounded-lg text-white placeholder:text-primary/20 focus:outline-0 focus:ring-0 border border-primary/30 bg-[#15130b]/80 focus:border-primary/70 focus:shadow-[0_0_12px_rgba(212,175,53,0.5)] h-10 pl-11 pr-4 text-sm font-normal transition-all duration-300"
                                    id="username"
                                    placeholder="Enter your username"
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="group">
                            <label className="block text-primary/80 text-[10px] font-bold uppercase tracking-[0.2em] mb-1.5" htmlFor="email">Email Address</label>
                            <div className="relative flex w-full items-center">
                                <div className="absolute left-4 text-primary/50 flex items-center justify-center pointer-events-none">
                                    <span className="material-symbols-outlined text-[18px]">mail</span>
                                </div>
                                <input
                                    className="flex w-full min-w-0 flex-1 rounded-lg text-white placeholder:text-primary/20 focus:outline-0 focus:ring-0 border border-primary/30 bg-[#15130b]/80 focus:border-primary/70 focus:shadow-[0_0_12px_rgba(212,175,53,0.5)] h-10 pl-11 pr-4 text-sm font-normal transition-all duration-300"
                                    id="email"
                                    placeholder="mage@example.com"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="group">
                            <label className="block text-primary/80 text-[10px] font-bold uppercase tracking-[0.2em] mb-1.5" htmlFor="password">Password</label>
                            <div className="relative flex w-full items-center">
                                <div className="absolute left-4 text-primary/50 flex items-center justify-center pointer-events-none">
                                    <span className="material-symbols-outlined text-[18px]">lock</span>
                                </div>
                                <input
                                    className="flex w-full min-w-0 flex-1 rounded-lg text-white placeholder:text-primary/20 focus:outline-0 focus:ring-0 border border-primary/30 bg-[#15130b]/80 focus:border-primary/70 focus:shadow-[0_0_12px_rgba(212,175,53,0.5)] h-10 pl-11 pr-12 text-sm font-normal transition-all duration-300"
                                    id="password"
                                    placeholder="Create a password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                                <button className="absolute right-4 text-primary/40 hover:text-primary transition-colors flex items-center justify-center" type="button">
                                    <span className="material-symbols-outlined text-[18px]">visibility</span>
                                </button>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3 mt-2">
                            <button className="w-full relative flex items-center justify-center overflow-hidden rounded-lg h-12 px-4 group transition-all duration-500 shadow-xl border border-primary/40 hover:border-primary/80">
                                <div className="absolute inset-0 bg-gradient-to-br from-[#4a3b10] via-[#2a240a] to-[#8c7322] opacity-90 group-hover:opacity-100 transition-opacity"></div>
                                <div className="absolute inset-0 shadow-[inset_0_0_12px_rgba(212,175,53,0.15),_inset_0_1px_1px_rgba(255,255,255,0.2)] pointer-events-none backdrop-blur-[2px]"></div>
                                <div className="absolute inset-0 border border-white/10 rounded-lg pointer-events-none"></div>
                                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                                <span className="relative z-10 flex items-center gap-2 bg-gradient-to-b from-[#fceda4] via-[#d4af35] to-[#aa8e30] bg-clip-text text-transparent font-bold uppercase tracking-[0.15em] text-sm drop-shadow-sm group-hover:brightness-110 transition-all">
                                    Create Account
                                    <span className="material-symbols-outlined text-[18px] text-[#d4af35] group-hover:text-[#fceda4] transition-colors">arrow_forward</span>
                                </span>
                            </button>
                            <div className="text-center">
                                <p className="text-primary/60 text-xs text-center w-full">
                                    Already have an account?
                                    <Link className="text-primary hover:text-[#eecb56] font-bold transition-colors ml-1 underline underline-offset-4 decoration-primary/30" to="/login">Sign In</Link>
                                </p>
                            </div>
                        </div>
                    </form>
                </main>
            </div>
        </div>
    );
};

export default Signup;
