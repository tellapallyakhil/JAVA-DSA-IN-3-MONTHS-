'use client';

import { DreamCompanyProvider } from '@/context/DreamCompanyContext';

export default function Providers({ children }: { children: React.ReactNode }) {
    return (
        <DreamCompanyProvider>
            {children}
        </DreamCompanyProvider>
    );
}
