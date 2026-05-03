"use client";

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Building2, Search, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CompaniesSearchContainerProps {
    companies: string[];
}

export default function CompaniesSearchContainer({ companies }: CompaniesSearchContainerProps) {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredCompanies = useMemo(() => {
        if (!searchTerm) return companies;
        return companies.filter(company => 
            company.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [companies, searchTerm]);

    return (
        <div className="space-y-10">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <h1 className="text-4xl font-bold flex items-center gap-3 text-white">
                        <Building2 className="text-primary" size={40} /> Companies
                    </h1>
                    <p className="text-zinc-500 max-w-xl">
                        Targeted preparation for top tech employers. Master company-specific patterns and questions.
                    </p>
                </div>
                
                <div className="relative w-full md:w-80 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-primary transition-colors" size={20} />
                    <input
                        type="text"
                        placeholder="Search for a company..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-primary/50 transition-all shadow-2xl placeholder:text-zinc-600"
                    />
                </div>
            </header>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                <AnimatePresence mode="popLayout">
                    {filteredCompanies.map((company, i) => (
                        <motion.div
                            key={company}
                            layout
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.2, delay: i * 0.01 }}
                        >
                            <Link
                                href={`/company/${encodeURIComponent(company)}`}
                                className="glass-card p-6 h-full flex flex-col items-center justify-center gap-4 hover:border-primary/50 hover:bg-white/5 transition-all group text-center"
                            >
                                <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:scale-110 transition-all group-hover:bg-primary/20 group-hover:border-primary/30 group-hover:shadow-[0_0_20px_rgba(var(--primary-rgb),0.2)]">
                                    <span className="text-3xl font-black text-zinc-600 group-hover:text-primary transition-colors">{company[0]}</span>
                                </div>
                                <div className="space-y-1">
                                    <span className="font-bold text-sm text-white group-hover:text-primary transition-colors block truncate w-full px-2">{company}</span>
                                    <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <span className="text-[10px] font-black uppercase tracking-tighter text-primary">Explore</span>
                                        <ArrowRight size={10} className="text-primary" />
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {filteredCompanies.length === 0 && (
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.5 }}
                    className="min-h-[300px] flex flex-col items-center justify-center text-center space-y-4"
                >
                    <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                        <Search size={32} className="text-zinc-600" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white">No company found</h3>
                        <p className="text-sm text-zinc-500">We don't have questions for "{searchTerm}" yet.</p>
                    </div>
                    <button 
                        onClick={() => setSearchTerm('')}
                        className="text-primary font-bold hover:underline px-4 py-2 bg-primary/10 rounded-lg"
                    >
                        View All Companies
                    </button>
                </motion.div>
            )}
        </div>
    );
}
