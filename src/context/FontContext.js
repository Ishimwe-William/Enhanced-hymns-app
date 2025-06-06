import React, { createContext, useContext } from 'react';

const FontContext = createContext();

export const FontProvider = ({ children }) => {
    const value = {
        Matura: { fontFamily: 'Matura MT Script Capitals' },
    };

    return (
        <FontContext.Provider value={value}>
            {children}
        </FontContext.Provider>
    );
};

export const useFont = () => {
    const context = useContext(FontContext);
    if (context === undefined) {
        throw new Error('useFont must be used within a FontProvider');
    }
    return context;
};
