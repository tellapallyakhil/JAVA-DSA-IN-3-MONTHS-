import PatternsContainer from "@/components/features/PatternsContainer";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "14 Core Coding Interview Patterns | Master DSA",
    description: "Master the 14 essential coding patterns that cover 90% of interview questions. Structured practice for Sliding Window, Two Pointers, Dynamic Programming, and more.",
    keywords: [
        "Sliding Window", "Two Pointers", "Binary Search", "Graph Patterns",
        "Dynamic Programming", "Interview Preparation", "DSA Patterns",
        "coding patterns for interviews", "LeetCode patterns guide",
        "14 coding patterns", "pattern based problem solving",
        "backtracking pattern", "BFS DFS pattern", "topological sort",
        "fast and slow pointers", "merge intervals pattern",
        "modified binary search", "top K elements pattern",
        "subsets and permutations", "monotonic stack pattern",
        "prefix sum technique", "greedy algorithm pattern",
        "divide and conquer problems", "union find pattern"
    ],
};

export default function PatternsPage() {
    return <PatternsContainer />;
}

