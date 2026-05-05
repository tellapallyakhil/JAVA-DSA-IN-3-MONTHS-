"use client";

import { useEffect, useState } from "react";
import { ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ScrollToTop() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const toggleVisibility = () => {
            if (window.scrollY > 500) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        window.addEventListener("scroll", toggleVisibility);
        return () => window.removeEventListener("scroll", toggleVisibility);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.button
                    initial={{ opacity: 0, scale: 0.5, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.5, y: 20 }}
                    onClick={scrollToTop}
                    className="fixed bottom-6 right-6 z-[50] p-3 rounded-full bg-primary/10 border border-primary/20 text-primary backdrop-blur-xl shadow-2xl hover:bg-primary hover:text-white transition-all active:scale-90 group"
                    aria-label="Scroll to top"
                >
                    <ChevronUp size={20} className="group-hover:-translate-y-0.5 transition-transform" />
                </motion.button>
            )}
        </AnimatePresence>
    );
}
