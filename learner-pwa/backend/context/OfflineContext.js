import { createContext } from 'react';

const OfflineContext = createContext(true);

export const OfflineProvider = OfflineContext.Provider;
export default OfflineContext;
