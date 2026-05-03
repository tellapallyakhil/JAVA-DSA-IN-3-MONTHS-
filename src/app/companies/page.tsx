import { getAllCompanies } from '@/lib/api';
import CompaniesSearchContainer from '@/components/features/CompaniesSearchContainer';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Top Tech Companies | Placement Preparation Guide',
    description: 'Master technical interviews for top companies like Google, Amazon, Microsoft, and TCS with company-specific DSA problems and mock interviews.',
};

export default async function CompaniesPage() {
    const companies = await getAllCompanies();

    return (
        <div className="animate-in fade-in duration-500">
            <CompaniesSearchContainer companies={companies} />
        </div>
    );
}
