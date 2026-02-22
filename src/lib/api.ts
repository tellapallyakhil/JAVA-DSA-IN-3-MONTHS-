import { supabase } from './supabaseClient';
import { DailyTask, Problem, Question } from '@/types';

// Utility to simulate async data fetching for local JSON
const fetchData = async <T>(module: string): Promise<T> => {
    const data = await import(`@/data/${module}.json`);
    return data.default;
};

export async function getQuestionsByIds(ids: string[]): Promise<Question[]> {
    const questions = await fetchData<Question[]>('questions');
    return questions.filter(q => ids.includes(q.id));
}

export async function getQuestionsByCompany(company: string): Promise<Question[]> {
    const questions = await fetchData<Question[]>('questions');
    return questions.filter(q =>
        q.companies?.some(c => c.toLowerCase() === company.toLowerCase())
    );
}

export async function getAllDays(): Promise<DailyTask[]> {
    return await fetchData<DailyTask[]>('days');
}

export async function getDay(dayNumber: number): Promise<DailyTask | undefined> {
    const days = await getAllDays();
    return days.find((d) => d.day === Number(dayNumber));
}

// Simple in-memory cache to boost response times for frequently accessed data
const apiCache = {
    companies: null as string[] | null,
    topics: null as string[] | null,
    lastFetched: 0
};

const CACHE_TTL = 1000 * 60 * 5; // 5 minutes

export async function getAllProblems(): Promise<Problem[]> {
    const { data, error } = await supabase
        .from('problems')
        .select('*');

    if (error) {
        console.error("Error fetching problems from Supabase:", error);
        return [];
    }

    return data.map(p => ({
        id: p.id,
        title: p.title,
        difficulty: p.difficulty,
        topics: p.topics,
        companies: p.companies,
        javaConcepts: p.java_concepts,
        link: p.link
    }));
}

export async function getProblem(id: string): Promise<Problem | undefined> {
    const { data, error } = await supabase
        .from('problems')
        .select('*')
        .eq('id', id)
        .single();

    if (error || !data) return undefined;

    return {
        id: data.id,
        title: data.title,
        difficulty: data.difficulty,
        topics: data.topics,
        companies: data.companies,
        javaConcepts: data.java_concepts,
        link: data.link
    };
}

export async function getProblemsForDay(dayNumber: number): Promise<Problem[]> {
    const day = await getDay(dayNumber);
    if (!day) return [];

    const { data, error } = await supabase
        .from('problems')
        .select('*')
        .in('id', day.javaDSA.problems);

    if (error || !data) return [];

    return data.map(p => ({
        id: p.id,
        title: p.title,
        difficulty: p.difficulty,
        topics: p.topics,
        companies: p.companies,
        javaConcepts: p.java_concepts,
        link: p.link
    }));
}

export async function getProblemsByCompany(company: string): Promise<Problem[]> {
    // Targeted fetch for specific company
    const { data, error } = await supabase
        .from('problems')
        .select('*')
        .filter('companies', 'cs', `{"${company}"}`);

    if (error || !data) return [];

    return data.map(p => ({
        id: p.id,
        title: p.title,
        difficulty: p.difficulty,
        topics: p.topics,
        companies: p.companies,
        javaConcepts: p.java_concepts,
        link: p.link
    }));
}

export async function getAllCompanies(): Promise<string[]> {
    // Check cache first for instant response
    const now = Date.now();
    if (apiCache.companies && (now - apiCache.lastFetched < CACHE_TTL)) {
        return apiCache.companies;
    }

    // Performance Optimization: Only select the companies column
    const { data, error } = await supabase
        .from('problems')
        .select('companies');

    if (error || !data) return apiCache.companies || [];

    const set = new Set<string>();
    data.forEach(p => p.companies?.forEach((c: string) => set.add(c)));

    const result = Array.from(set).sort();

    // Update cache
    apiCache.companies = result;
    apiCache.lastFetched = now;

    return result;
}

// Normalize inconsistent topic names from the database
const TOPIC_ALIASES: Record<string, string> = {
    'LinkedList': 'Linked Lists',
    'Linked List': 'Linked Lists',
    'Graph': 'Graphs',
    'DP': 'Dynamic Programming Basics',
    'HashTable': 'HashMap',
    'Array': 'Arrays & Hashing',
};

// Get all variant names that map to a canonical topic
function getTopicVariants(canonicalTopic: string): string[] {
    const variants = [canonicalTopic];
    for (const [alias, canonical] of Object.entries(TOPIC_ALIASES)) {
        if (canonical === canonicalTopic) {
            variants.push(alias);
        }
    }
    return variants;
}

export async function getAllTopics(): Promise<string[]> {
    // Check cache
    const now = Date.now();
    if (apiCache.topics && (now - apiCache.lastFetched < CACHE_TTL)) {
        return apiCache.topics;
    }

    // Performance Optimization: Only select the topics column
    const { data, error } = await supabase
        .from('problems')
        .select('topics');

    if (error || !data) return apiCache.topics || [];

    const set = new Set<string>();
    data.forEach(p => p.topics?.forEach((t: string) => {
        // Normalize topic name using alias map
        const normalized = TOPIC_ALIASES[t] || t;
        set.add(normalized);
    }));

    const result = Array.from(set).sort();

    apiCache.topics = result;
    apiCache.lastFetched = now;

    return result;
}

export async function getProblemsByTopic(topic: string): Promise<Problem[]> {
    // Query all variant names for this topic
    const variants = getTopicVariants(topic);

    // Fetch problems matching ANY variant
    const promises = variants.map(variant =>
        supabase
            .from('problems')
            .select('*')
            .filter('topics', 'cs', `{"${variant}"}`)
    );

    const results = await Promise.all(promises);

    // Merge and deduplicate by id
    const seen = new Set<string>();
    const allProblems: Problem[] = [];

    for (const { data, error } of results) {
        if (error || !data) continue;
        for (const p of data) {
            if (!seen.has(p.id)) {
                seen.add(p.id);
                allProblems.push({
                    id: p.id,
                    title: p.title,
                    difficulty: p.difficulty,
                    topics: p.topics,
                    companies: p.companies,
                    javaConcepts: p.java_concepts,
                    link: p.link
                });
            }
        }
    }

    return allProblems;
}

