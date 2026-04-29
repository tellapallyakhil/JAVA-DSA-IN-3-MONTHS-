'use client';

import { DreamCompanyProvider } from '@/context/DreamCompanyContext';
import dynamic from 'next/dynamic';

const GlobalJokes = dynamic(() => import('@/components/GlobalJokes'), { ssr: false });

export default function Providers({ children }: { children: React.ReactNode }) {
    return (
        <DreamCompanyProvider>
            <GlobalJokes />
            {children}
        </DreamCompanyProvider>
    );
}
