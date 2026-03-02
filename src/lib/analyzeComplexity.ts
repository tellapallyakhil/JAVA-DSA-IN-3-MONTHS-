// Client-side Java Code Complexity Analyzer
// Zero dependencies, zero API calls, instant results

export interface ComplexityResult {
    time: string;         // e.g. "O(n log n)"
    timeReason: string;   // e.g. "Arrays.sort() dominates"
    space: string;        // e.g. "O(n)"
    spaceReason: string;  // e.g. "HashMap stores n elements"
    pattern: string;      // e.g. "Binary Search"
    confidence: number;   // 0-100
}

// ─── HELPERS ───────────────────────────────────────────────

function stripComments(code: string): string {
    // Remove single-line comments
    let cleaned = code.replace(/\/\/.*$/gm, '');
    // Remove multi-line comments
    cleaned = cleaned.replace(/\/\*[\s\S]*?\*\//g, '');
    // Remove string literals to avoid false positives
    cleaned = cleaned.replace(/"(?:[^"\\]|\\.)*"/g, '""');
    cleaned = cleaned.replace(/'(?:[^'\\]|\\.)*'/g, "''");
    return cleaned;
}

function countPattern(code: string, pattern: RegExp): number {
    const matches = code.match(pattern);
    return matches ? matches.length : 0;
}

// ─── LOOP ANALYSIS ─────────────────────────────────────────

interface LoopInfo {
    depth: number;
    hasLogStep: boolean;
    hasHalving: boolean;
}

function analyzeLoops(code: string): LoopInfo {
    const lines = code.split('\n');
    let maxDepth = 0;
    let currentDepth = 0;
    let hasLogStep = false;
    let hasHalving = false;
    let inLoop = false;

    for (const line of lines) {
        const trimmed = line.trim();

        // Detect loop starts
        if (/^\s*(for|while)\s*\(/.test(trimmed)) {
            currentDepth++;
            inLoop = true;
            if (currentDepth > maxDepth) maxDepth = currentDepth;

            // Check for logarithmic patterns in the loop condition/increment
            if (/[*\/]=\s*2/.test(trimmed) || />>/.test(trimmed) || /<</.test(trimmed)) {
                hasLogStep = true;
            }
            if (/i\s*\/=\s*2|i\s*=\s*i\s*\/\s*2|lo\s*=\s*mid|hi\s*=\s*mid|left\s*=\s*mid|right\s*=\s*mid/.test(trimmed)) {
                hasHalving = true;
            }
        }

        // Check inside loop body for log patterns
        if (inLoop && currentDepth > 0) {
            if (/[*\/]=\s*2/.test(trimmed) || />>/.test(trimmed)) {
                hasLogStep = true;
            }
        }

        // Track braces for depth
        const opens = (trimmed.match(/{/g) || []).length;
        const closes = (trimmed.match(/}/g) || []).length;

        if (closes > opens) {
            currentDepth = Math.max(0, currentDepth - (closes - opens));
            if (currentDepth === 0) inLoop = false;
        }
    }

    return { depth: maxDepth, hasLogStep, hasHalving };
}

// ─── RECURSION ANALYSIS ────────────────────────────────────

interface RecursionInfo {
    isRecursive: boolean;
    callCount: number; // How many times it calls itself
    hasMemoization: boolean;
}

function analyzeRecursion(code: string): RecursionInfo {
    // Find method names
    const methodPattern = /(?:static\s+)?(?:\w+(?:<[^>]+>)?)\s+(\w+)\s*\(/g;
    const methods: string[] = [];
    let match;

    while ((match = methodPattern.exec(code)) !== null) {
        const name = match[1];
        if (!['main', 'if', 'while', 'for', 'switch', 'catch'].includes(name)) {
            methods.push(name);
        }
    }

    let isRecursive = false;
    let maxCallCount = 0;

    for (const method of methods) {
        // Count how many times this method calls itself within its body
        const bodyRegex = new RegExp(`${method}\\s*\\(`, 'g');
        const calls = countPattern(code, bodyRegex);
        // Subtract 1 for the definition itself
        const selfCalls = Math.max(0, calls - 1);
        if (selfCalls > 0) {
            isRecursive = true;
            maxCallCount = Math.max(maxCallCount, selfCalls);
        }
    }

    // Check for memoization
    const hasMemoization = /memo|cache|dp\[|dp\.get|visited\.|Map<.*>.*memo|HashMap.*memo/i.test(code);

    return { isRecursive, callCount: maxCallCount, hasMemoization };
}

// ─── SPACE ANALYSIS ────────────────────────────────────────

function analyzeSpace(code: string): { space: string; reason: string } {
    const factors: string[] = [];

    // 2D arrays
    if (/new\s+\w+\s*\[.*\]\s*\[.*\]/.test(code) || /int\s*\[\]\[\]|long\s*\[\]\[\]|boolean\s*\[\]\[\]/.test(code)) {
        factors.push('O(n×m)');
        return { space: 'O(n×m)', reason: '2D array allocation' };
    }

    // 1D arrays with variable size
    if (/new\s+\w+\s*\[\s*\w+/.test(code)) {
        factors.push('O(n)');
    }

    // Collections
    if (/new\s+(HashMap|TreeMap|LinkedHashMap|HashSet|TreeSet|LinkedHashSet)\s*</.test(code)) {
        factors.push('O(n)');
    }
    if (/new\s+(ArrayList|LinkedList|ArrayDeque|Stack|PriorityQueue|Queue)\s*</.test(code)) {
        factors.push('O(n)');
    }

    // StringBuilder in loop
    if (/new\s+StringBuilder/.test(code)) {
        factors.push('O(n)');
    }

    if (factors.length === 0) {
        return { space: 'O(1)', reason: 'No extra data structures' };
    }

    const maxSpace = factors.includes('O(n×m)') ? 'O(n×m)' : 'O(n)';

    const reasons: string[] = [];
    if (/HashMap|HashSet/.test(code)) reasons.push('HashMap/Set');
    if (/TreeMap|TreeSet/.test(code)) reasons.push('TreeMap/Set');
    if (/ArrayList|LinkedList/.test(code)) reasons.push('List');
    if (/PriorityQueue/.test(code)) reasons.push('Heap');
    if (/Stack|ArrayDeque/.test(code)) reasons.push('Stack');
    if (/new\s+\w+\s*\[/.test(code)) reasons.push('Array');

    return {
        space: maxSpace,
        reason: reasons.length > 0 ? reasons.join(' + ') : 'Data structure allocation'
    };
}

// ─── PATTERN DETECTION ─────────────────────────────────────

function detectPattern(code: string): string {
    const lc = code.toLowerCase();

    // Binary Search
    if (/lo\s*=\s*mid|hi\s*=\s*mid|left\s*=\s*mid|right\s*=\s*mid/.test(code) &&
        /while\s*\(\s*\w+\s*<=?\s*\w+/.test(code)) {
        return '🔍 Binary Search';
    }

    // Two Pointers
    if (/(left|lo|i)\s*.*<.*\s*(right|hi|j)/.test(code) &&
        /(left|lo|i)\s*\+\+/.test(code) && /(right|hi|j)\s*--/.test(code)) {
        return '👉👈 Two Pointers';
    }

    // Sliding Window
    if (/window|slide|start.*end|begin.*end/.test(lc) ||
        (/while.*<.*length/.test(code) && /right|end|j/.test(code) && /left|start|i/.test(code) && !/mid/.test(code))) {
        return '🪟 Sliding Window';
    }

    // BFS
    if (/Queue|LinkedList.*queue|ArrayDeque/.test(code) && /visited|seen/.test(lc)) {
        return '🌊 BFS';
    }

    // DFS
    if (/(dfs|depthFirst|explore)\s*\(/.test(code) ||
        (/Stack/.test(code) && /visited|seen/.test(lc))) {
        return '🌲 DFS';
    }

    // Dynamic Programming
    if (/\bdp\b\s*\[/.test(code) || /\bdp\b\s*=\s*new/.test(code) ||
        /memo\[|memoiz/.test(lc)) {
        return '📊 Dynamic Programming';
    }

    // Backtracking
    if (/backtrack|permut|subset|combin/.test(lc) &&
        analyzeRecursion(code).isRecursive) {
        return '🔄 Backtracking';
    }

    // Heap / Top-K
    if (/PriorityQueue/.test(code)) {
        return '⛰️ Heap / Top-K';
    }

    // Merge Sort pattern
    if (/merge.*sort|mergeSort/.test(code)) {
        return '🔀 Merge Sort';
    }

    // Divide and Conquer
    if (analyzeRecursion(code).isRecursive && /mid|half|pivot/.test(code)) {
        return '✂️ Divide & Conquer';
    }

    // Greedy
    if (/greedy|Arrays\.sort|Collections\.sort/.test(code) && !/dp\[/.test(code)) {
        if (/interval|meeting|job|task|activity/.test(lc)) {
            return '💰 Greedy';
        }
    }

    // Graph
    if (/graph|adjacen|adj\[|adj\./.test(lc)) {
        return '🕸️ Graph';
    }

    // Linked List
    if (/ListNode|\.next/.test(code)) {
        return '🔗 Linked List';
    }

    // Tree
    if (/TreeNode|\.left|\.right|root/.test(code) && analyzeRecursion(code).isRecursive) {
        return '🌳 Tree Traversal';
    }

    // Stack-based
    if (/Stack<|new\s+Stack|Deque.*stack/.test(code)) {
        return '📚 Stack';
    }

    // Sorting
    if (/Arrays\.sort|Collections\.sort/.test(code)) {
        return '📶 Sorting';
    }

    // Hashing
    if (/HashMap|HashSet/.test(code)) {
        return '#️⃣ Hashing';
    }

    // Simple iteration
    if (/for\s*\(|while\s*\(/.test(code)) {
        return '🔁 Iteration';
    }

    return '📝 General';
}

// ─── BUILT-IN METHOD COMPLEXITY ────────────────────────────

function detectBuiltInComplexity(code: string): string | null {
    // These override loop-based analysis when present
    if (/Arrays\.sort|Collections\.sort/.test(code)) {
        return 'O(n log n)';
    }
    if (/PriorityQueue/.test(code) && /while.*!.*isEmpty|for.*poll/.test(code)) {
        return 'O(n log n)';
    }
    if (/TreeMap|TreeSet/.test(code) && /for|while/.test(code)) {
        return 'O(n log n)';
    }
    return null;
}

// ─── MAIN ANALYZER ─────────────────────────────────────────

export function analyzeComplexity(rawCode: string): ComplexityResult | null {
    if (!rawCode || rawCode.trim().length < 30) return null;

    const code = stripComments(rawCode);
    const loops = analyzeLoops(code);
    const recursion = analyzeRecursion(code);
    const spaceResult = analyzeSpace(code);
    const pattern = detectPattern(rawCode); // Use raw for pattern names in strings
    const builtIn = detectBuiltInComplexity(code);

    let time = 'O(1)';
    let timeReason = 'No loops or recursion';
    let confidence = 85;

    // Priority 1: Built-in method complexity
    if (builtIn) {
        time = builtIn;
        if (/Arrays\.sort|Collections\.sort/.test(code)) {
            timeReason = 'Sorting dominates';
        } else if (/PriorityQueue/.test(code)) {
            timeReason = 'Heap operations in loop';
        } else if (/TreeMap|TreeSet/.test(code)) {
            timeReason = 'Balanced BST operations';
        }
        confidence = 90;
    }

    // Priority 2: Recursion analysis
    if (recursion.isRecursive) {
        if (recursion.hasMemoization) {
            // Memoized recursion — usually linear or polynomial
            if (loops.depth >= 1) {
                time = 'O(n²)';
                timeReason = 'Memoized recursion + loop';
            } else {
                time = 'O(n)';
                timeReason = 'Memoized recursion (DP)';
            }
            confidence = 75;
        } else if (recursion.callCount >= 2) {
            // Binary recursion without memo
            if (/mid|half|pivot/.test(code)) {
                time = 'O(n log n)';
                timeReason = 'Divide & conquer recursion';
                confidence = 70;
            } else {
                time = 'O(2^n)';
                timeReason = `${recursion.callCount}x recursive calls without memoization`;
                confidence = 65;
            }
        } else {
            // Single recursive call
            if (loops.hasHalving || /mid/.test(code)) {
                time = 'O(log n)';
                timeReason = 'Recursive binary search';
                confidence = 85;
            } else {
                time = 'O(n)';
                timeReason = 'Linear recursion';
                confidence = 75;
            }
        }
    }

    // Priority 3: Loop-based analysis (only if no stronger signal)
    if (!recursion.isRecursive || builtIn) {
        if (loops.depth >= 3) {
            time = 'O(n³)';
            timeReason = 'Triple nested loops';
            confidence = 90;
        } else if (loops.depth === 2) {
            if (loops.hasLogStep) {
                time = 'O(n log n)';
                timeReason = 'Nested loop with log step';
                confidence = 80;
            } else {
                time = 'O(n²)';
                timeReason = 'Nested loops';
                confidence = 90;
            }
        } else if (loops.depth === 1) {
            if (loops.hasLogStep || loops.hasHalving) {
                time = 'O(log n)';
                timeReason = 'Loop halving pattern';
                confidence = 85;
            } else {
                // Single loop, but might have sort before it
                if (builtIn === 'O(n log n)') {
                    // Sort dominates over single loop
                    time = 'O(n log n)';
                } else {
                    time = 'O(n)';
                    timeReason = 'Single loop';
                    confidence = 90;
                }
            }
        }
    }

    // Edge: if sort + nested loop, nested loop dominates
    if (loops.depth >= 2 && builtIn === 'O(n log n)') {
        time = 'O(n²)';
        timeReason = 'Nested loops dominate over sort';
    }

    return {
        time,
        timeReason,
        space: spaceResult.space,
        spaceReason: spaceResult.reason,
        pattern,
        confidence,
    };
}
