import { createContext, useContext } from 'react';

const OfflineContext = createContext(true);

export const OfflineProvider = OfflineContext.Provider;

export function useOffline() {
    return useContext(OfflineContext);
}

export default OfflineContext;
