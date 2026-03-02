"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Terminal, Code2, AlertCircle, Loader2, RefreshCcw, Trash2, Zap, Cpu, Keyboard, Activity, Clock, HardDrive, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useComplexityAnalysis } from '@/hooks/useComplexityAnalysis';

export default function CompilerContainer() {
    const [code, setCode] = useState(`import java.util.*;
import java.util.stream.*;

public class Main {
    // Binary Search - O(log n)
    static int binarySearch(int[] arr, int target) {
        int lo = 0, hi = arr.length - 1;
        while (lo <= hi) {
            int mid = lo + (hi - lo) / 2;
            if (arr[mid] == target) return mid;
            else if (arr[mid] < target) lo = mid + 1;
            else hi = mid - 1;
        }
        return -1;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        int[] arr = new int[n];
        for (int i = 0; i < n; i++) arr[i] = sc.nextInt();

        // Sort + Binary Search
        Arrays.sort(arr);
        System.out.println("Sorted: " + Arrays.toString(arr));

        int target = sc.nextInt();
        int idx = binarySearch(arr, target);
        System.out.println("Index of " + target + ": " + idx);

        // HashMap - frequency count
        Map<Integer, Integer> freq = new HashMap<>();
        for (int x : arr) freq.merge(x, 1, Integer::sum);
        System.out.println("Frequency: " + freq);

        // PriorityQueue (Min-Heap)
        PriorityQueue<Integer> pq = new PriorityQueue<>();
        for (int x : arr) pq.add(x);
        System.out.print("Heap order: ");
        while (!pq.isEmpty()) System.out.print(pq.poll() + " ");
        System.out.println();

        // Streams
        int sum = Arrays.stream(arr).sum();
        System.out.println("Sum: " + sum);
    }
}`);

    // Standard Input/Output States
    const [stdin, setStdin] = useState("5\n3 1 4 1 5\n4");
    const [output, setOutput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isCheerpJReady, setIsCheerpJReady] = useState(false);
    const [status, setStatus] = useState("JVM Online");
    const [queuePosition, setQueuePosition] = useState<number | null>(null);
    const outputEndRef = useRef<HTMLDivElement>(null);
    const editorRef = useRef<HTMLTextAreaElement>(null);

    // Calculate dynamic line count
    const lineCount = code.split('\n').length;

    // Live complexity analysis (client-side, instant)
    const { result: complexity, isAnalyzing: isAnalyzingComplexity } = useComplexityAnalysis(code);

    // Warm-up ping: silently compile a Hello World on mount
    // This pre-establishes the connection so the first real execution is faster
    useEffect(() => {
        const warmUp = async () => {
            try {
                await fetch('/api/execute', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        code: 'public class Main { public static void main(String[] args) { System.out.println("ready"); } }',
                        stdin: ''
                    }),
                });
            } catch (e) {
                // Silently ignore warm-up failures
            }
        };
        warmUp();
    }, []);

    useEffect(() => {
        const script = document.createElement('script');
        script.src = 'https://cjrtnc.leaningtech.com/3.0/loader.js';
        script.async = true;

        script.onload = async () => {
            const checkAndInit = async (retries = 3) => {
                try {
                    if (typeof window !== 'undefined' && (window as any).cheerpjInit) {
                        await (window as any).cheerpjInit();
                        setIsCheerpJReady(true);
                        setStatus("JVM Engine Ready");
                    } else if (retries > 0) {
                        setTimeout(() => checkAndInit(retries - 1), 200);
                    } else {
                        throw new Error("Init timeout");
                    }
                } catch (err) {
                    setIsCheerpJReady(true);
                    setStatus("Simulator Mode");
                }
            };
            checkAndInit();
        };

        script.onerror = () => {
            setIsCheerpJReady(true);
            setStatus("Offline Mode");
        };

        document.head.appendChild(script);
    }, []);

    useEffect(() => {
        if (outputEndRef.current) {
            outputEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [output]);

    const runCodeWithQueue = useCallback(async () => {
        if (!isCheerpJReady || isLoading) return;

        const requestId = crypto.randomUUID();
        setIsLoading(true);
        setQueuePosition(Math.floor(Math.random() * 3) + 1);
        setStatus("In Queue...");
        setOutput(`[READY] Task: ${requestId.substring(0, 8)}\n[STATUS] Initializing isolated environment...\n`);

        const processTask = async () => {
            try {
                setQueuePosition(0);
                setStatus("Executing...");
                setOutput(prev => prev + `[WORKER] Running Main.java via Isolated JVM...\n\n`);

                const response = await fetch('/api/execute', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ code, stdin })
                });

                const data = await response.json();

                if (data.success) {
                    let result = `--- Execution Output ---\n${data.output}`;
                    if (data.error) result += `\n--- Standard Error ---\n${data.error}`;
                    result += `\n\n--- Runtime: ${data.runtime}ms | Status: ${data.type} ---`;
                    setOutput(result);
                    setStatus("Engine Idle");
                } else {
                    setOutput(`[${data.type}]\n${data.error}`);
                    setStatus("ERROR");
                }
            } catch (err: any) {
                setOutput(`System Error: Could not connect to Code Judge.\nDetails: ${err.message}`);
                setStatus("OFFLINE");
            } finally {
                setIsLoading(false);
                setQueuePosition(null);
            }
        };

        await processTask();
    }, [isCheerpJReady, isLoading, code, stdin]);


    const resetCode = () => {
        if (confirm("Reset to default DSA template?")) {
            setCode(`import java.util.*;\nimport java.util.stream.*;\n\npublic class Main {\n    // Binary Search - O(log n)\n    static int binarySearch(int[] arr, int target) {\n        int lo = 0, hi = arr.length - 1;\n        while (lo <= hi) {\n            int mid = lo + (hi - lo) / 2;\n            if (arr[mid] == target) return mid;\n            else if (arr[mid] < target) lo = mid + 1;\n            else hi = mid - 1;\n        }\n        return -1;\n    }\n\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int n = sc.nextInt();\n        int[] arr = new int[n];\n        for (int i = 0; i < n; i++) arr[i] = sc.nextInt();\n\n        Arrays.sort(arr);\n        System.out.println("Sorted: " + Arrays.toString(arr));\n\n        int target = sc.nextInt();\n        int idx = binarySearch(arr, target);\n        System.out.println("Index of " + target + ": " + idx);\n\n        Map<Integer, Integer> freq = new HashMap<>();\n        for (int x : arr) freq.merge(x, 1, Integer::sum);\n        System.out.println("Frequency: " + freq);\n\n        int sum = Arrays.stream(arr).sum();\n        System.out.println("Sum: " + sum);\n    }\n}`);
            setStdin("5\n3 1 4 1 5\n4");
        }
    };

    return (
        <div className="min-h-screen pt-20 pb-8 px-4 md:px-6 lg:px-12 bg-[#020205] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent overflow-x-hidden">
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[30%] bg-purple-600/10 rounded-full blur-[100px]" />
            </div>

            <div className="max-w-[1800px] mx-auto relative z-10 lg:h-[calc(100vh-140px)] flex flex-col w-full overflow-x-hidden">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8 w-full p-4 lg:p-0">
                    <div className="flex items-center gap-3 md:gap-4 mb-2">
                        <div className="p-2 md:p-3 bg-primary/20 rounded-none border border-primary/20 shadow-xl shadow-primary/10 backdrop-blur-xl">
                            <Cpu className="text-primary" size={20} />
                        </div>
                        <h1 className="text-2xl sm:text-3xl md:text-5xl font-black text-white tracking-tighter uppercase italic">
                            Cyber<span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-400">VM</span>
                        </h1>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${isCheerpJReady ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                        <div className="flex flex-col">
                            <p className="text-[10px] md:text-xs font-black text-zinc-500 uppercase tracking-widest leading-none">{status}</p>
                            {queuePosition !== null && queuePosition > 0 && (
                                <p className="text-[8px] font-bold text-primary animate-pulse mt-0.5">Position in Queue: #{queuePosition}</p>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-2 md:gap-4 bg-white/5 p-2 rounded-none border border-white/10 backdrop-blur-2xl w-full lg:w-auto">
                        <button onClick={resetCode} title="Reset Code" className="p-2 md:p-3 hover:bg-white/10 rounded-none text-zinc-500 hover:text-white transition-all"><RefreshCcw size={20} /></button>
                        <div className="w-px h-8 md:h-10 bg-white/10 mx-1 md:mx-2" />
                        <button
                            onClick={runCodeWithQueue}
                            disabled={isLoading || !isCheerpJReady}
                            className="flex-1 lg:flex-none flex items-center justify-center gap-3 md:gap-4 px-6 md:px-12 py-3 md:py-4 bg-primary hover:bg-primary/90 disabled:opacity-50 text-white font-black text-sm md:text-xl rounded-none transition-all shadow-[0_0_40px_rgba(100,80,250,0.5)] group active:scale-[0.98]"
                        >
                            {isLoading ? <Loader2 className="animate-spin" size={20} /> : <Zap size={20} className="fill-current" />}
                            EXECUTE
                        </button>
                    </div>
                </div>

                {/* Live Complexity Analysis Widget */}
                <div className="flex flex-col sm:flex-row items-stretch gap-3 mb-4">
                    <div className="flex-1 flex items-center gap-3 px-4 py-2.5 bg-gradient-to-r from-emerald-500/10 to-emerald-500/5 border border-emerald-500/20 rounded-none">
                        <Clock className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                        <div className="flex flex-col">
                            <span className="text-[8px] font-black text-emerald-500/60 uppercase tracking-widest">Time</span>
                            {isAnalyzingComplexity ? (
                                <span className="text-xs text-emerald-300 animate-pulse">analyzing...</span>
                            ) : complexity ? (
                                <span className="text-sm font-bold text-emerald-300">{complexity.time} <span className="text-[10px] font-normal text-emerald-400/60">— {complexity.timeReason}</span></span>
                            ) : (
                                <span className="text-xs text-zinc-600">—</span>
                            )}
                        </div>
                    </div>
                    <div className="flex-1 flex items-center gap-3 px-4 py-2.5 bg-gradient-to-r from-blue-500/10 to-blue-500/5 border border-blue-500/20 rounded-none">
                        <HardDrive className="w-4 h-4 text-blue-400 flex-shrink-0" />
                        <div className="flex flex-col">
                            <span className="text-[8px] font-black text-blue-500/60 uppercase tracking-widest">Space</span>
                            {isAnalyzingComplexity ? (
                                <span className="text-xs text-blue-300 animate-pulse">analyzing...</span>
                            ) : complexity ? (
                                <span className="text-sm font-bold text-blue-300">{complexity.space} <span className="text-[10px] font-normal text-blue-400/60">— {complexity.spaceReason}</span></span>
                            ) : (
                                <span className="text-xs text-zinc-600">—</span>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-3 px-4 py-2.5 bg-gradient-to-r from-purple-500/10 to-purple-500/5 border border-purple-500/20 rounded-none">
                        <Sparkles className="w-4 h-4 text-purple-400 flex-shrink-0" />
                        <div className="flex flex-col">
                            <span className="text-[8px] font-black text-purple-500/60 uppercase tracking-widest">Pattern</span>
                            {isAnalyzingComplexity ? (
                                <span className="text-xs text-purple-300 animate-pulse">detecting...</span>
                            ) : complexity ? (
                                <span className="text-sm font-bold text-purple-300">{complexity.pattern}</span>
                            ) : (
                                <span className="text-xs text-zinc-600">—</span>
                            )}
                        </div>
                    </div>
                    {complexity && (
                        <div className="flex items-center gap-2 px-3 py-2.5 bg-white/5 border border-white/10 rounded-none">
                            <Activity className="w-3.5 h-3.5 text-zinc-500" />
                            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">{complexity.confidence}%</span>
                        </div>
                    )}
                </div>

                <div className="flex-1 grid grid-cols-1 xl:grid-cols-12 gap-6 min-h-0 pb-8">
                    <div className="xl:col-span-7 flex flex-col bg-[#050510] border border-white/10 rounded-none overflow-hidden shadow-2xl group h-[400px] lg:h-full lg:min-h-0">
                        <div className="flex items-center justify-between px-4 md:px-8 py-3 md:py-4 border-b border-white/10 bg-white/[0.03] flex-shrink-0">
                            <div className="flex items-center gap-3 md:gap-4">
                                <div className="bg-amber-500/20 p-2 rounded-none text-amber-500">
                                    <Code2 className="w-4 h-4 md:w-[18px] md:h-[18px]" />
                                </div>
                                <span className="text-[10px] md:text-xs font-black text-white tracking-widest uppercase italic">Main.java</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="h-1.5 w-1.5 rounded-full bg-amber-500/40 animate-pulse" />
                                <span className="text-[8px] font-mono text-zinc-600 uppercase tracking-widest hidden md:block">UTF-8</span>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto custom-scrollbar bg-black/40">
                            <div className="flex min-h-full w-full relative">
                                <div className="w-10 md:w-14 flex-shrink-0 bg-white/[0.02] border-r border-white/5 flex flex-col items-center pt-6 text-zinc-700 font-mono text-[10px] md:text-xs select-none">
                                    {[...Array(Math.max(lineCount, 50))].map((_, i) => (
                                        <div key={i} className="h-8 flex items-center justify-center w-full">{i + 1}</div>
                                    ))}
                                </div>
                                <textarea
                                    ref={editorRef}
                                    value={code}
                                    onChange={(e) => setCode(e.target.value)}
                                    onKeyDown={(e) => {
                                        const textarea = e.currentTarget;
                                        const start = textarea.selectionStart;
                                        const end = textarea.selectionEnd;

                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            const beforeCursor = code.substring(0, start);
                                            const afterCursor = code.substring(end);
                                            const currentLine = beforeCursor.split('\n').pop() || '';
                                            const currentIndent = currentLine.match(/^(\s*)/)?.[1] || '';
                                            const trimmedLine = currentLine.trimEnd();

                                            // If line ends with {, add extra indent
                                            if (trimmedLine.endsWith('{')) {
                                                const newIndent = currentIndent + '    ';
                                                // Auto-close: if next char is } or nothing meaningful, add closing brace
                                                if (afterCursor.trimStart().startsWith('}') || afterCursor.trim() === '') {
                                                    const closingExists = afterCursor.trimStart().startsWith('}');
                                                    if (!closingExists) {
                                                        const newCode = beforeCursor + '\n' + newIndent + '\n' + currentIndent + '}' + afterCursor;
                                                        setCode(newCode);
                                                        const cursorPos = start + 1 + newIndent.length;
                                                        requestAnimationFrame(() => {
                                                            textarea.selectionStart = textarea.selectionEnd = cursorPos;
                                                        });
                                                    } else {
                                                        const newCode = beforeCursor + '\n' + newIndent + afterCursor;
                                                        setCode(newCode);
                                                        const cursorPos = start + 1 + newIndent.length;
                                                        requestAnimationFrame(() => {
                                                            textarea.selectionStart = textarea.selectionEnd = cursorPos;
                                                        });
                                                    }
                                                } else {
                                                    const newCode = beforeCursor + '\n' + newIndent + afterCursor;
                                                    setCode(newCode);
                                                    const cursorPos = start + 1 + newIndent.length;
                                                    requestAnimationFrame(() => {
                                                        textarea.selectionStart = textarea.selectionEnd = cursorPos;
                                                    });
                                                }
                                            }
                                            // If line starts with }, reduce indent
                                            else if (trimmedLine.startsWith('}')) {
                                                const newCode = beforeCursor + '\n' + currentIndent + afterCursor;
                                                setCode(newCode);
                                                const cursorPos = start + 1 + currentIndent.length;
                                                requestAnimationFrame(() => {
                                                    textarea.selectionStart = textarea.selectionEnd = cursorPos;
                                                });
                                            }
                                            // Normal Enter: maintain current indentation
                                            else {
                                                const newCode = beforeCursor + '\n' + currentIndent + afterCursor;
                                                setCode(newCode);
                                                const cursorPos = start + 1 + currentIndent.length;
                                                requestAnimationFrame(() => {
                                                    textarea.selectionStart = textarea.selectionEnd = cursorPos;
                                                });
                                            }
                                        }

                                        if (e.key === 'Tab') {
                                            e.preventDefault();

                                            if (e.shiftKey) {
                                                // Shift+Tab: remove 4 spaces
                                                const beforeCursor = code.substring(0, start);
                                                const lineStart = beforeCursor.lastIndexOf('\n') + 1;
                                                const lineContent = code.substring(lineStart);
                                                const match = lineContent.match(/^ {1,4}/);
                                                if (match) {
                                                    const spacesToRemove = match[0].length;
                                                    const newCode = code.substring(0, lineStart) + lineContent.replace(/^ {1,4}/, '');
                                                    setCode(newCode);
                                                    requestAnimationFrame(() => {
                                                        textarea.selectionStart = textarea.selectionEnd = Math.max(lineStart, start - spacesToRemove);
                                                    });
                                                }
                                            } else {
                                                // Tab: insert 4 spaces
                                                const newCode = code.substring(0, start) + '    ' + code.substring(end);
                                                setCode(newCode);
                                                requestAnimationFrame(() => {
                                                    textarea.selectionStart = textarea.selectionEnd = start + 4;
                                                });
                                            }
                                        }
                                    }}
                                    className="flex-1 bg-transparent px-4 md:px-8 py-6 font-mono text-sm md:text-base resize-none focus:outline-none text-zinc-100 leading-8 selection:bg-primary/40 scrollbar-hide h-full"
                                    style={{ minHeight: `${lineCount * 32 + 100}px` }}
                                    spellCheck={false}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="xl:col-span-5 flex flex-col gap-6 min-h-0">
                        <div className="h-[200px] lg:h-1/3 flex flex-col bg-[#050518] border border-white/10 rounded-none overflow-hidden shadow-2xl group">
                            <div className="flex items-center gap-3 md:gap-4 px-4 md:px-8 py-3 md:py-4 border-b border-white/10 bg-white/[0.02]">
                                <div className="bg-blue-500/20 p-2 rounded-none text-blue-400">
                                    <Keyboard className="w-4 h-4 md:w-[18px] md:h-[18px]" />
                                </div>
                                <span className="text-[10px] md:text-xs font-black text-white uppercase tracking-widest">Standard Input</span>
                            </div>
                            <textarea
                                value={stdin}
                                onChange={(e) => setStdin(e.target.value)}
                                className="flex-1 bg-transparent p-4 md:p-6 font-mono text-xs md:text-sm resize-none focus:outline-none text-zinc-300 leading-7 placeholder:text-zinc-700 custom-scrollbar overflow-y-auto"
                                placeholder="Enter arguments here..."
                                spellCheck={false}
                            />
                        </div>

                        <div className="flex-1 min-h-[300px] lg:min-h-0 flex flex-col bg-[#050510] border border-white/10 rounded-none overflow-hidden shadow-2xl group">
                            <div className="flex items-center justify-between px-4 md:px-8 py-3 md:py-4 border-b border-white/10 bg-white/[0.02]">
                                <div className="flex items-center gap-3 md:gap-4">
                                    <div className="bg-emerald-500/20 p-2 rounded-none text-emerald-400">
                                        <Terminal className="w-4 h-4 md:w-[18px] md:h-[18px]" />
                                    </div>
                                    <span className="text-[10px] md:text-xs font-black text-white uppercase tracking-widest">Console Output</span>
                                </div>
                                <button onClick={() => setOutput("")} title="Clear Console" className="p-2 hover:bg-white/10 rounded-none text-zinc-500 hover:text-white transition-all">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                            <div className="flex-1 p-4 md:p-8 font-mono text-xs md:text-sm overflow-y-auto custom-scrollbar bg-black/60">
                                <AnimatePresence mode="wait">
                                    {output ? (
                                        <motion.div key="output" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="text-zinc-100 whitespace-pre-wrap leading-relaxed">
                                            {output}
                                        </motion.div>
                                    ) : (
                                        <div key="empty" className="h-full flex flex-col items-center justify-center text-zinc-800 py-12">
                                            <p className="text-[8px] md:text-[10px] font-black tracking-[0.4em] uppercase opacity-40">Ready for Execution</p>
                                        </div>
                                    )}
                                </AnimatePresence>
                                <div ref={outputEndRef} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 12px;
                    height: 12px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: rgba(255, 255, 255, 0.05);
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.4);
                    border: 3px solid transparent;
                    background-clip: content-box;
                    border-radius: 0px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(255, 255, 255, 0.7);
                    background-clip: content-box;
                }
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
                .scrollbar-hide {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </div>
    );
}
