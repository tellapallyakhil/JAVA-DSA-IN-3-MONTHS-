import { getAllTopics } from '@/lib/api';
import { Metadata } from 'next';
import TopicsSearchContainer from '@/components/features/TopicsSearchContainer';

export const metadata: Metadata = {
    title: 'DSA Topics | Data Structures and Algorithms Guide',
    description: 'Explore comprehensive study notes and practice problems for all major Data Structures and Algorithms topics including Arrays, Trees, Graphs, and Dynamic Programming.',
    keywords: [
        "DSA topics list", "data structures study guide", "algorithms tutorial Java",
        "arrays and hashing problems", "binary tree questions", "graph theory problems",
        "dynamic programming tutorial", "heap and priority queue", "trie data structure",
        "linked list operations", "stack problems", "queue implementations",
        "sorting algorithms explained", "searching algorithms", "string manipulation DSA",
        "bit manipulation problems", "matrix problems DSA", "intervals and merging",
        "DSA study notes", "DSA flashcards interview"
    ],
};

export default async function TopicsPage() {
    const topics = await getAllTopics();
    const concepts = await import('@/data/concepts.json').then(mod => mod.default);

    return (
        <div className="animate-in fade-in duration-500">
            <TopicsSearchContainer topics={topics} concepts={concepts} />
        </div>
    );
}
