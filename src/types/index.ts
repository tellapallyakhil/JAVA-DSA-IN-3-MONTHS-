export interface Problem {
    id: string;
    title: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    topics: string[];
    companies: string[];
    javaConcepts: string[];
    link: string;
}

export interface Question {
    id: string;
    topic: string;
    question: string;
    options: string[];
    answer: string;
    explanation: string;
}

export interface Flashcard {
    front: string;
    back: string;
}

export interface DailyTask {
    day: number;
    title: string;
    type?: 'Work' | 'Holiday';
    javaDSA: {
        topic: string;
        description?: string;
        problems: string[]; // Problem IDs
        concepts: string[];
    };
    aptitude: {
        topic: string;
        questionIds: string[];
    };
    reasoning: {
        topic: string;
        questionIds: string[];
    };
    flashcards?: Flashcard[];
}

export interface Progress {
    completedDays: number[];
    completedProblems: string[];
    completedQuestions: string[]; // Question IDs
    aptitudeDone: { day: number; count: number }[];
    reasoningDone: { day: number; count: number }[];
    activityDates: string[]; // ISO date strings of days with activity
    // 1-4-7 Spaced Repetition System
    revisionItems: RevisionItem[];
    lastUpdated?: number; // Timestamp for sync conflict resolution
    startDate?: string; // ISO date string when user starts their journey (Day 1)
    // Topic Focus Mode
    weakTopics: string[]; // Topic IDs marked as weak (e.g., 'arrays', 'dp')
    topicProgress: { [topicId: string]: TopicMastery }; // Progress on each weak topic
}

// Track mastery progress for a single topic
export interface TopicMastery {
    currentLevel: number; // 1-4 (difficulty levels)
    completedProblems: string[]; // Extra problems completed for this topic
    flashcardsReviewed: number; // Count of flashcards reviewed
    lastPracticed: string; // ISO date of last practice
}

// Track items for 1-4-7 revision
export interface RevisionItem {
    id: string;           // Problem ID or topic name
    type: 'problem' | 'topic';
    title: string;
    learnedDate: string;  // ISO date string
    revisionsDone: number; // 0, 1, 2 (after 2 revisions on day 4 and 7, item is "mastered")
    nextRevisionDate: string; // When to revise next
}
