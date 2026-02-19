import days from '@/data/days.json';
import problems from '@/data/problems.json';
import questions from '@/data/questions.json';
import { DailyTask, Problem, Question } from '@/types';

// ... existing exports ...

export function getQuestionsByIds(ids: string[]): Question[] {
    return (questions as Question[]).filter(q => ids.includes(q.id));
}

export function getQuestionsByCompany(company: string): Question[] {
    return (questions as Question[]).filter(q =>
        q.companies?.some(c => c.toLowerCase() === company.toLowerCase())
    );
}

export function getAllDays(): DailyTask[] {
    return days as DailyTask[];
}

export function getDay(dayNumber: number): DailyTask | undefined {
    return (days as DailyTask[]).find((d) => d.day === Number(dayNumber));
}

export function getAllProblems(): Problem[] {
    return problems as Problem[];
}

export function getProblem(id: string): Problem | undefined {
    return (problems as Problem[]).find((p) => p.id === id);
}

export function getProblemsForDay(dayNumber: number): Problem[] {
    const day = getDay(dayNumber);
    if (!day) return [];
    return (problems as Problem[]).filter((p) => day.javaDSA.problems.includes(p.id));
}

export function getProblemsByCompany(company: string): Problem[] {
    return (problems as Problem[]).filter((p) =>
        p.companies.some(c => c.toLowerCase() === company.toLowerCase())
    );
}

export function getAllCompanies(): string[] {
    const set = new Set<string>();
    (problems as Problem[]).forEach(p => p.companies.forEach(c => set.add(c)));
    return Array.from(set);
}


export function getAllTopics(): string[] {
    const set = new Set<string>();
    (problems as Problem[]).forEach(p => p.topics.forEach(t => set.add(t)));
    return Array.from(set);
}

export function getProblemsByTopic(topic: string): Problem[] {
    return (problems as Problem[]).filter((p) =>
        p.topics.some(t => t.toLowerCase() === topic.toLowerCase())
    );
}
