import Link from 'next/link';
import { DailyTask, Problem } from '@/types';
import { getAllProblems, getProblemsByTopic } from '@/lib/api';
import concepts from '@/data/concepts.json';

export async function getExtraProblems(day: DailyTask): Promise<Problem[]> {
    const topic = day.javaDSA.topic;
    // Get all problems for this topic
    const allTopicProblems = await getProblemsByTopic(topic);
    // Filter out ones already assigned today
    return allTopicProblems.filter(p => !day.javaDSA.problems.includes(p.id));
}

export function getNotes(topic: string) {
    // @ts-ignore
    return concepts[topic] || null;
}
