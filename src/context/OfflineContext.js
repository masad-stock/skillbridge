import React, { createContext, useContext } from 'react';

const OfflineContext = createContext();

export function OfflineProvider({ children, value }) {
    return (
        <OfflineContext.Provider value={value}>
            {children}
        </OfflineContext.Provider>
    );
}

export function useOffline() {
    const context = useContext(OfflineContext);
    if (context === undefined) {
        throw new Error('useOffline must be used within an OfflineProvider');
    }
    return context;
}