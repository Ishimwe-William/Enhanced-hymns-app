import React, { createContext, useContext, useState, useMemo } from 'react';
import { Appearance } from 'react-native';
import { themes } from "../utils/colors";

const defaultScheme = Appearance.getColorScheme();

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const [themeMode, setThemeMode] = useState(defaultScheme || 'light');

    const toggleTheme = () => {
        setThemeMode(prev => (prev === 'light' ? 'dark' : 'light'));
    };

    const value = useMemo(() => ({
        theme: themes[themeMode],
        themeMode,
        toggleTheme,
    }), [themeMode]);

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);
