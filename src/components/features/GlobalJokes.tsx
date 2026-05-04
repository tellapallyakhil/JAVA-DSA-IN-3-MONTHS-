"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Quote, Ghost } from "lucide-react";
import { techJokes } from "@/data/jokes";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

export default function GlobalJokes() {
    const pathname = usePathname();
    const [index, setIndex] = useState(0);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        if (!techJokes || techJokes.length === 0) return;
        const interval = setInterval(() => {
            setIndex((prev) => (prev + 1) % techJokes.length);
        }, 10000); // 10 seconds per rotation
        return () => clearInterval(interval);
    }, []);

    // Don't show on compiler page or if it might interfere with complex editors
    const isDashboard = pathname === "/" || pathname === "/progress" || pathname === "/profile";
    const jokesLimit = isDashboard ? 1 : 3;

    if (pathname === "/compiler") return null;

    // Safety check for slicing
    const getJokes = (start: number, count: number) => {
        const result = [];
        for (let i = 0; i < count; i++) {
            result.push(techJokes[(start + i) % techJokes.length]);
        }
        return result;
    };

    const leftJokes = getJokes(index, jokesLimit);
    const rightJokes = getJokes(index + techJokes.length / 2, jokesLimit);

    return (
        <div className="hidden xl:block fixed inset-0 pointer-events-none z-[20]">
            {/* Left Side Jokes */}
            <div className="absolute left-6 top-1/4 space-y-8 w-64">
                <div className="flex items-center gap-2 mb-4 opacity-20">
                    <Quote className="text-primary" size={16} />
                    <span className="text-[10px] font-black tracking-[0.3em] text-white uppercase">Dev_Humour.log</span>
                </div>
                <AnimatePresence mode="wait">
                    <motion.div
                        key={index + "_left"}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="space-y-8"
                    >
                        {leftJokes.map((joke, i) => (
                            <motion.div
                                key={joke.joke}
                                initial={{ opacity: 0, x: -30 }}
                                animate={{ opacity: 0.35, x: 0 }}
                                whileHover={{ opacity: 1, x: 8, scale: 1.02 }}
                                transition={{ duration: 0.8, delay: i * 0.2 }}
                                className="pointer-events-auto bg-white/[0.02] border-l-2 border-primary/20 p-5 backdrop-blur-sm group cursor-help transition-all shadow-xl hover:shadow-primary/5 hover:bg-white/[0.04]"
                            >
                                <p className="text-[11px] font-semibold text-zinc-500 group-hover:text-zinc-200 leading-relaxed italic transition-colors">
                                    "{joke.joke}"
                                </p>
                                <div className="mt-3 flex items-center justify-between border-t border-white/5 pt-2">
                                    <span className="text-[9px] font-black text-primary/40 uppercase tracking-widest">{joke.category}</span>
                                    <span className="text-[8px] font-mono text-zinc-700">
                                        {mounted ? `0x${((index + i) * 137 % 999).toString(16).padStart(3, '0')}` : "0x..."}
                                    </span>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Right Side Jokes */}
            <div className="absolute right-6 top-1/3 space-y-8 w-64">
                <div className="flex items-center gap-2 mb-4 justify-end opacity-20">
                    <span className="text-[10px] font-black tracking-[0.3em] text-white uppercase text-right">System_snark.v1</span>
                    <Ghost className="text-purple-500" size={16} />
                </div>
                <AnimatePresence mode="wait">
                    <motion.div
                        key={index + "_right"}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="space-y-8"
                    >
                        {rightJokes.map((joke, i) => (
                            <motion.div
                                key={joke.joke}
                                initial={{ opacity: 0, x: 30 }}
                                animate={{ opacity: 0.35, x: 0 }}
                                whileHover={{ opacity: 1, x: -8, scale: 1.02 }}
                                transition={{ duration: 0.8, delay: i * 0.2 }}
                                className="pointer-events-auto bg-white/[0.02] border-r-2 border-purple-500/20 p-5 backdrop-blur-sm group cursor-help transition-all text-right shadow-xl hover:shadow-purple-500/5 hover:bg-white/[0.04]"
                            >
                                <p className="text-[11px] font-semibold text-zinc-500 group-hover:text-zinc-200 leading-relaxed italic transition-colors">
                                    "{joke.joke}"
                                </p>
                                <div className="mt-3 flex items-center justify-between flex-row-reverse border-t border-white/5 pt-2">
                                    <span className="text-[9px] font-black text-purple-500/40 uppercase tracking-widest">{joke.category}</span>
                                    <span className="text-[8px] font-mono text-zinc-700">
                                        {mounted ? `0x${(Math.floor(index + i + techJokes.length / 2) * 137 % 999).toString(16).padStart(3, '0')}` : "0x..."}
                                    </span>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}

