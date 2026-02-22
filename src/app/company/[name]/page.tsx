import { getProblemsByCompany, getAllCompanies, getQuestionsByCompany } from '@/lib/api';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ExternalLink, ArrowLeft, BrainCircuit } from 'lucide-react';
import ProblemCard from '@/components/ProblemCard';

export async function generateStaticParams() {
    const companies = await getAllCompanies();
    return companies.map(c => ({ name: c }));
}

export default async function CompanyPage({ params }: { params: Promise<{ name: string }> }) {
    const { name } = await params;
    const companyName = decodeURIComponent(name);
    const problems = await getProblemsByCompany(companyName);
    const questions = await getQuestionsByCompany(companyName);

    if (!problems.length) {
        const allCompanies = await getAllCompanies();
        if (!allCompanies.some(c => c.toLowerCase() === companyName.toLowerCase())) {
            notFound();
        }
    }

    return (
        <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-4">
                <Link href="/companies" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-white transition-colors">
                    <ArrowLeft size={16} /> Back to Companies
                </Link>
            </div>

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-bold mb-2">{companyName}</h1>
                    <p className="text-muted-foreground">Top asked Java & DSA questions in {companyName} interviews.</p>
                </div>
                {questions.length > 0 && (
                    <Link
                        href={`/company/${encodeURIComponent(companyName)}/quiz`}
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 hover:border-purple-500/50 text-purple-300 rounded-lg transition-all text-sm font-medium group"
                    >
                        <BrainCircuit size={16} className="group-hover:scale-110 transition-transform" />
                        Aptitude & Reasoning ({questions.length})
                    </Link>
                )}
            </div>

            <div className="grid gap-4">
                {problems.map(p => (
                    <ProblemCard key={p.id} problem={p} showCheckbox={false} />
                ))}
            </div>
        </div>
    )
}
