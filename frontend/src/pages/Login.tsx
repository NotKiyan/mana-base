import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await axios.post('http://localhost:3000/api/auth/login', { email, password });
            console.log('Login successful:', res.data);
            // Store token, role, and username in localStorage
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('userRole', res.data.role);
            localStorage.setItem('username', res.data.username);

            if (res.data.role === 'admin') {
                navigate('/admin');
            } else {
                navigate('/dashboard');
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Login failed');
        }
    };

    return (
        <div className="bg-background-light dark:bg-background-dark font-display text-white overflow-x-hidden min-h-screen flex flex-col relative selection:bg-primary selection:text-black">
            {/* Background Effects */}
            <div className="fixed inset-0 pointer-events-none z-0" data-alt="Dark obsidian background with deep indigo radial gradient and mystical corner glows">
                {/* Center Radial Gradient */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-mana-indigo/20 via-[#050505] to-[#050505]"></div>
                {/* Corner Glows */}
                <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-mana-purple/20 rounded-full blur-[120px] mix-blend-screen"></div>
                <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] bg-mana-teal/15 rounded-full blur-[120px] mix-blend-screen"></div>
            </div>

            {/* Main Content Layout */}
            <div className="relative z-10 flex flex-1 items-center justify-center p-4 sm:p-8">
                {/* Glassmorphic Card Container */}
                <div className="w-full max-w-[480px] flex flex-col bg-[#121212]/70 backdrop-blur-md border border-primary/40 rounded-xl shadow-[0_0_30px_rgba(212,175,53,0.1)] overflow-hidden transition-all duration-500 hover:shadow-[0_0_40px_rgba(212,175,53,0.2)] hover:border-primary/60">
                    {/* Header Section */}
                    <div className="flex flex-col items-center pt-12 pb-6 px-8 text-center border-b border-primary/10">
                        {/* Abstract Icon/Logo */}
                        <div className="mb-5 text-primary animate-pulse" style={{ animationDuration: '4s' }}>
                            <span className="material-symbols-outlined text-6xl drop-shadow-[0_0_8px_rgba(212,175,53,0.5)]" style={{ fontVariationSettings: "'FILL' 0, 'wght' 200" }}>token</span>
                        </div>
                        <div className="flex flex-col gap-2">
                            <h1 className="font-serif text-3xl md:text-4xl text-[#f0e6d2] font-bold tracking-tight text-shadow-gold">
                                Access the Nexus
                            </h1>
                            <p className="text-[#b6b1a0] text-base font-normal tracking-wide">
                                Enter the archive of the arcane.
                            </p>
                        </div>
                    </div>

                    {/* Form Section */}
                    <form onSubmit={handleLogin} className="p-8 pb-10 flex flex-col gap-6">
                        {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                        {/* Email Field */}
                        <div className="flex flex-col gap-2">
                            <label className="text-[#d4af35] text-xs font-bold tracking-widest uppercase ml-1">Email Address</label>
                            <div className="relative group">
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-[#0a0a0a]/60 border border-primary/30 rounded-lg h-14 px-4 text-[#f0e6d2] placeholder-[#5a5a5a] focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all duration-300 shadow-inner font-light"
                                    placeholder="Whisper your email..."
                                />
                                {/* Subtle corner accents */}
                                <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-primary/40 rounded-tr opacity-30 group-hover:opacity-100 transition-opacity duration-500"></div>
                                <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-primary/40 rounded-bl opacity-30 group-hover:opacity-100 transition-opacity duration-500"></div>
                            </div>
                        </div>

                        {/* Password Field */}
                        <div className="flex flex-col gap-2">
                            <label className="text-[#d4af35] text-xs font-bold tracking-widest uppercase ml-1">Password</label>
                            <div className="relative group flex items-center">
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-[#0a0a0a]/60 border border-primary/30 rounded-lg h-14 pl-4 pr-12 text-[#f0e6d2] placeholder-[#5a5a5a] focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all duration-300 shadow-inner font-light"
                                    placeholder="Whisper your credentials..."
                                />
                                <button type="button" className="absolute right-0 h-full w-12 flex items-center justify-center text-[#b6b1a0] hover:text-primary transition-colors focus:outline-none">
                                    <span className="material-symbols-outlined text-xl">visibility_off</span>
                                </button>
                                {/* Subtle corner accents */}
                                <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-primary/40 rounded-tr opacity-30 group-hover:opacity-100 transition-opacity duration-500"></div>
                                <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-primary/40 rounded-bl opacity-30 group-hover:opacity-100 transition-opacity duration-500"></div>
                            </div>
                        </div>

                        {/* Forgot Password Link */}
                        <div className="flex justify-end -mt-2">
                            <a href="#" className="text-xs text-primary/60 hover:text-primary transition-colors tracking-wide border-b border-transparent hover:border-primary/50 pb-0.5">
                                Forgot Password?
                            </a>
                        </div>

                        {/* Primary Action Button */}
                        <button type="submit" className="relative w-full h-14 mt-2 rounded-lg overflow-hidden group shadow-[0_4px_15px_rgba(0,0,0,0.5)]">
                            {/* Gradient Background */}
                            <div className="absolute inset-0 bg-gradient-to-b from-[#d4af35] to-[#8a701e] transition-transform duration-500 group-hover:scale-105"></div>
                            {/* Inner Glow / Shine Effect */}
                            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform -translate-x-full group-hover:translate-x-full" style={{ transitionDuration: '1s' }}></div>
                            {/* Content */}
                            <span className="relative z-10 font-bold text-[#171612] tracking-[0.1em] uppercase flex items-center justify-center gap-3 text-sm">
                                Sign In
                                <span className="material-symbols-outlined text-xl font-bold">arrow_forward</span>
                            </span>
                        </button>
                    </form>

                    {/* Footer / Secondary Actions */}
                    <div className="bg-[#0a0a0a]/40 p-5 text-center border-t border-primary/10 backdrop-blur-sm">
                        <p className="text-[#888] text-sm font-light">
                            New to the Nexus?
                            <Link to="/signup" className="text-primary hover:text-[#f3dfa2] font-medium transition-colors ml-1 border-b border-primary/30 hover:border-primary">Forging a new account</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
