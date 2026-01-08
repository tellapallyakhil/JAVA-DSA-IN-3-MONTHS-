"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Terminal, Activity, LogIn, LogOut, Menu, X, BookOpen, Building2, Home, BarChart3, User } from 'lucide-react';
import { useProgress } from '@/hooks/useProgress';
import { supabase } from '@/lib/supabaseClient';

export default function Navbar() {
    const { user } = useProgress();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        window.location.href = '/login';
    };

    const navLinks = [
        { href: '/', label: 'Dashboard', icon: Home },
        { href: '/topics', label: 'Topics', icon: BookOpen },
        { href: '/companies', label: 'Companies', icon: Building2 },
        { href: '/progress', label: 'My Progress', icon: BarChart3, highlight: true },
    ];

    return (
        <>
            <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5 h-16 flex items-center justify-between px-6 md:px-12">
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="bg-primary/20 p-2 rounded-lg text-primary group-hover:bg-primary group-hover:text-white transition-all">
                        <Terminal size={20} />
                    </div>
                    <span className="font-bold text-xl tracking-tight text-white">DSA<span className="text-primary">Prep</span></span>
                </Link>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-400">
                    {navLinks.map(link => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={link.highlight
                                ? "text-white bg-primary/20 hover:bg-primary/30 border border-primary/20 px-4 py-2 rounded-full transition-all flex items-center gap-2"
                                : "hover:text-primary hover:text-glow transition-all flex items-center gap-2"
                            }
                        >
                            {link.highlight && <Activity size={16} />}
                            {link.label}
                        </Link>
                    ))}

                    {user ? (
                        <Link href="/profile" title="My Profile" className="group flex items-center gap-2 hover:bg-white/5 p-1 pr-3 rounded-full border border-transparent hover:border-white/10 transition-all">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-xs font-bold text-white uppercase shadow-lg">
                                {user.email?.slice(0, 2)}
                            </div>
                            <span className="text-xs text-zinc-400 group-hover:text-white transition-colors max-w-[100px] truncate hidden lg:block">
                                {user.email?.split('@')[0]}
                            </span>
                            <User size={14} className="text-zinc-500 group-hover:text-primary ml-1" />
                        </Link>
                    ) : (
                        <Link href="/login" className="hover:text-white flex items-center gap-2">
                            <LogIn size={18} />
                            Sign In
                        </Link>
                    )}
                </div>

                {/* Mobile Menu Button */}
                <button
                    className="md:hidden p-2 hover:bg-white/5 rounded-lg transition-colors"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                    {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </nav>

            {/* Mobile Menu Overlay */}
            {mobileMenuOpen && (
                <div className="fixed inset-0 z-40 bg-black/90 backdrop-blur-lg pt-20 px-6 md:hidden animate-in fade-in duration-200">
                    <div className="space-y-4">
                        {navLinks.map(link => (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={() => setMobileMenuOpen(false)}
                                className="flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all"
                            >
                                <link.icon className="text-primary" size={24} />
                                <span className="text-lg font-medium">{link.label}</span>
                            </Link>
                        ))}

                        <hr className="border-white/10 my-6" />

                        {user ? (
                            <div className="space-y-4">
                                <Link
                                    href="/profile"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all"
                                >
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-lg font-bold text-white uppercase">
                                        {user.email?.slice(0, 2)}
                                    </div>
                                    <div className="flex-1">
                                        <div className="font-medium">{user.email?.split('@')[0]}</div>
                                        <div className="text-sm text-muted-foreground truncate max-w-[200px]">{user.email}</div>
                                    </div>
                                    <User size={20} className="text-muted-foreground" />
                                </Link>
                                <button
                                    onClick={handleSignOut}
                                    className="w-full flex items-center justify-center gap-2 p-4 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all"
                                >
                                    <LogOut size={20} />
                                    Sign Out
                                </button>
                            </div>
                        ) : (
                            <Link
                                href="/login"
                                onClick={() => setMobileMenuOpen(false)}
                                className="flex items-center justify-center gap-2 p-4 rounded-xl bg-primary hover:bg-primary/90 transition-all font-bold"
                            >
                                <LogIn size={20} />
                                Sign In
                            </Link>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
