import Link from 'next/link';
import { getAllCompanies } from '@/lib/api';
import { Building2 } from 'lucide-react';

export default function CompaniesPage() {
    const companies = getAllCompanies();

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <h1 className="text-4xl font-bold flex items-center gap-3">
                <Building2 className="text-primary" /> Companies
            </h1>
            <p className="text-muted-foreground">Practicing company-specific questions increases your chances of selection.</p>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {companies.map(company => (
                    <Link
                        key={company}
                        href={`/company/${company}`}
                        className="glass p-6 rounded-xl flex flex-col items-center justify-center gap-3 hover:border-primary/50 hover:bg-white/5 transition-all group"
                    >
                        <div className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:scale-110 transition-transform group-hover:bg-primary/20 group-hover:text-primary">
                            <span className="text-2xl font-bold text-muted-foreground group-hover:text-primary transition-colors">{company[0]}</span>
                        </div>
                        <span className="font-semibold truncate w-full text-center">{company}</span>
                    </Link>
                ))}
            </div>
        </div>
    )
}
