'use client';

import { DreamCompanyProvider } from '@/context/DreamCompanyContext';
import dynamic from 'next/dynamic';

const GlobalJokes = dynamic(() => import('@/components/features/GlobalJokes'), { ssr: false });
const ScrollToTop = dynamic(() => import('@/components/features/ScrollToTop'), { ssr: false });

export default function Providers({ children }: { children: React.ReactNode }) {
    return (
        <DreamCompanyProvider>
            <GlobalJokes />
            <ScrollToTop />
            {children}
        </DreamCompanyProvider>
    );
}

