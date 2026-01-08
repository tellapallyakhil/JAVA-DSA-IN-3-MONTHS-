import { getProblemsByCompany, getAllCompanies } from '@/lib/api';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ExternalLink, ArrowLeft } from 'lucide-react';
import ProblemCard from '@/components/ProblemCard';

export async function generateStaticParams() {
    const companies = getAllCompanies();
    return companies.map(c => ({ name: c }));
}

export default async function CompanyPage({ params }: { params: Promise<{ name: string }> }) {
    const { name } = await params;
    const companyName = decodeURIComponent(name);
    const problems = getProblemsByCompany(companyName);

    if (!problems.length) {
        const allCompanies = getAllCompanies();
        if (!allCompanies.some(c => c.toLowerCase() === companyName.toLowerCase())) {
            notFound();
        }
        // Case insensitive fallback if needed, but getProblemsByCompany handles it?
        // getProblemsByCompany uses toLowerCase matching.
    }

    return (
        <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-4">
                <Link href="/companies" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-white transition-colors">
                    <ArrowLeft size={16} /> Back to Companies
                </Link>
            </div>

            <div>
                <h1 className="text-4xl font-bold mb-2">{companyName}</h1>
                <p className="text-muted-foreground">Top asked Java & DSA questions in {companyName} interviews.</p>
            </div>

            <div className="grid gap-4">
                {problems.map(p => (
                    <ProblemCard key={p.id} problem={p} showCheckbox={false} />
                ))}
            </div>
        </div>
    )
}
