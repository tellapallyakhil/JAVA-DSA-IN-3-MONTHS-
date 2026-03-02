import PatternsContainer from "@/components/PatternsContainer";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "14 Core Coding Interview Patterns | Master DSA",
    description: "Master the 14 essential coding patterns that cover 90% of interview questions. Structured practice for Sliding Window, Two Pointers, Dynamic Programming, and more.",
    keywords: ["Sliding Window", "Two Pointers", "Binary Search", "Graph Patterns", "Dynamic Programming", "Interview Preparation", "DSA Patterns"],
};

export default function PatternsPage() {
    return <PatternsContainer />;
}
