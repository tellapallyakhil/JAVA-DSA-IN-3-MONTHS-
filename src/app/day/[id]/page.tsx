import { getDay, getProblemsForDay, getAllDays, getQuestionsByIds } from '@/lib/api';
import { getExtraProblems, getNotes } from '@/lib/extras';
import DayView from '@/components/DayView';
import { notFound } from 'next/navigation';

export async function generateStaticParams() {
    const days = getAllDays();
    return days.map((day) => ({
        id: day.day.toString(),
    }));
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const day = getDay(Number(id));

    if (!day) {
        notFound();
    }

    const problems = getProblemsForDay(day.day);
    const extraProblems = await getExtraProblems(day);
    const notes = getNotes(day.javaDSA.topic);

    // Fetch Questions
    const aptitudeQuestions = getQuestionsByIds(day.aptitude.questionIds || []);
    const reasoningQuestions = getQuestionsByIds(day.reasoning.questionIds || []);
    const allQuestions = [...aptitudeQuestions, ...reasoningQuestions];

    return (
        <DayView
            day={day}
            problems={problems}
            extraProblems={extraProblems}
            notes={notes}
            questions={allQuestions}
            flashcards={day.flashcards || []}
        />
    );
}
