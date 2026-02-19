'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type DreamCompanyContextType = {
    dreamCompany: string | null;
    setDreamCompany: (company: string | null) => void;
};

const DreamCompanyContext = createContext<DreamCompanyContextType | undefined>(undefined);

export function DreamCompanyProvider({ children }: { children: React.ReactNode }) {
    const [dreamCompany, setDreamCompanyState] = useState<string | null>(null);

    // Load from local storage
    useEffect(() => {
        const saved = localStorage.getItem('dreamCompany');
        if (saved) {
            setDreamCompanyState(saved);
        }
    }, []);

    const setDreamCompany = (company: string | null) => {
        setDreamCompanyState(company);
        if (company) {
            localStorage.setItem('dreamCompany', company);
        } else {
            localStorage.removeItem('dreamCompany');
        }
    };

    return (
        <DreamCompanyContext.Provider value={{ dreamCompany, setDreamCompany }}>
            {children}
        </DreamCompanyContext.Provider>
    );
}

export function useDreamCompany() {
    const context = useContext(DreamCompanyContext);
    if (context === undefined) {
        throw new Error('useDreamCompany must be used within a DreamCompanyProvider');
    }
    return context;
}
