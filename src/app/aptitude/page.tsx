import AptitudeContainer from '@/components/features/AptitudeContainer';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: "Aptitude Preparation | Topic-wise Practice & Formulas",
    description: "Master Quantitative, Logical Reasoning, and Verbal Ability with topic-wise lessons, quick formulas, tricks, and interactive MCQ practice. Perfect for TCS, Infosys, Wipro, and campus placements.",
    keywords: [
        "aptitude preparation", "quantitative aptitude", "logical reasoning",
        "verbal ability", "placement aptitude", "TCS aptitude", "Infosys aptitude",
        "campus placement aptitude", "aptitude formulas", "aptitude tricks",
        "number system aptitude", "percentages problems", "profit and loss",
        "time and work", "data interpretation", "syllogisms", "blood relations",
    ],
};

export default function AptitudePage() {
    return <AptitudeContainer />;
}

