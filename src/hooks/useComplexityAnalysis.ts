"use client";

import { useState, useEffect, useRef } from 'react';
import { analyzeComplexity, ComplexityResult } from '@/lib/analyzeComplexity';

export function useComplexityAnalysis(code: string, debounceMs: number = 800) {
    const [result, setResult] = useState<ComplexityResult | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        if (!code || code.trim().length < 30) {
            setResult(null);
            return;
        }

        setIsAnalyzing(true);

        // Debounce: analyze after user stops typing
        timeoutRef.current = setTimeout(() => {
            const analysis = analyzeComplexity(code);
            setResult(analysis);
            setIsAnalyzing(false);
        }, debounceMs);

        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, [code, debounceMs]);

    return { result, isAnalyzing };
}
