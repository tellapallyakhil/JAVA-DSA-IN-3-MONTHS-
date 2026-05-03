import { getQuestionsByCompany, getAllCompanies } from '@/lib/api';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, BrainCircuit } from 'lucide-react';
import QuizView from '@/components/features/QuizView';

export async function generateStaticParams() {
    const companies = await getAllCompanies();
    return companies.map(c => ({ name: c }));
}

export default async function CompanyQuizPage({ params }: { params: Promise<{ name: string }> }) {
    const { name } = await params;
    const companyName = decodeURIComponent(name);
    const questions = await getQuestionsByCompany(companyName);

    if (!questions.length) {
        const allCompanies = await getAllCompanies();
        if (!allCompanies.some(c => c.toLowerCase() === companyName.toLowerCase())) {
            notFound();
        }
    }

    // Separate by type
    const aptitudeTopics = [
        "Numbers", "HCF & LCM", "Percentages", "Profit & Loss", "Ratio & Proportion",
        "Time & Work", "Time Speed Distance", "Pipes & Cisterns", "Simple Interest",
        "Compound Interest", "Averages", "Ages", "Mixtures", "Boats & Streams",
        "Trains", "Probability", "Permutation & Combination", "Geometry",
        "Mensuration", "Data Interpretation", "Numbers & Decimal Fractions"
    ];

    const aptitude = questions.filter(q => aptitudeTopics.includes(q.topic));
    const reasoning = questions.filter(q => !aptitudeTopics.includes(q.topic));

    return (
        <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-4">
                <Link href={`/company/${encodeURIComponent(companyName)}`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-white transition-colors">
                    <ArrowLeft size={16} /> Back to {companyName}
                </Link>
            </div>

            <div>
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-purple-500/20 rounded-lg text-purple-400">
                        <BrainCircuit size={28} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold">{companyName} – Aptitude & Reasoning</h1>
                        <p className="text-muted-foreground text-sm">
                            {questions.length} questions tailored for {companyName} interview pattern
                        </p>
                    </div>
                </div>
            </div>

            {/* Stats Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="glass-card p-4 text-center">
                    <div className="text-2xl font-bold text-purple-400">{questions.length}</div>
                    <div className="text-xs text-muted-foreground">Total Questions</div>
                </div>
                <div className="glass-card p-4 text-center">
                    <div className="text-2xl font-bold text-blue-400">{aptitude.length}</div>
                    <div className="text-xs text-muted-foreground">Aptitude</div>
                </div>
                <div className="glass-card p-4 text-center">
                    <div className="text-2xl font-bold text-pink-400">{reasoning.length}</div>
                    <div className="text-xs text-muted-foreground">Reasoning</div>
                </div>
                <div className="glass-card p-4 text-center">
                    <div className="text-2xl font-bold text-green-400">{new Set(questions.map(q => q.topic)).size}</div>
                    <div className="text-xs text-muted-foreground">Topics</div>
                </div>
            </div>

            {/* Aptitude Section */}
            {aptitude.length > 0 && (
                <section>
                    <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                        <span className="p-1.5 bg-blue-500/20 rounded-md text-blue-400">📐</span>
                        Aptitude Questions ({aptitude.length})
                    </h2>
                    <QuizView questions={aptitude} />
                </section>
            )}

            {/* Reasoning Section */}
            {reasoning.length > 0 && (
                <section>
                    <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                        <span className="p-1.5 bg-pink-500/20 rounded-md text-pink-400">🧩</span>
                        Reasoning Questions ({reasoning.length})
                    </h2>
                    <QuizView questions={reasoning} />
                </section>
            )}

            {questions.length === 0 && (
                <div className="text-center py-16">
                    <BrainCircuit className="mx-auto text-muted-foreground mb-4 opacity-30" size={48} />
                    <p className="text-muted-foreground">No aptitude or reasoning questions available for {companyName} yet.</p>
                </div>
            )}
        </div>
    );
}
