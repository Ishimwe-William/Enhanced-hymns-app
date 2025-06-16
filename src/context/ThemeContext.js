import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { Appearance } from 'react-native';
import { themes } from "../utils/theme/colors";
import AsyncStorage from '@react-native-async-storage/async-storage';

const defaultScheme = Appearance.getColorScheme();

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const [themeMode, setThemeMode] = useState(defaultScheme || 'light');
    const [isThemeLoaded, setIsThemeLoaded] = useState(false);

    // Load saved theme preference on app start
    useEffect(() => {
        const loadSavedTheme = async () => {
            try {
                // Try to get theme from local preferences first (faster)
                let savedPreferences = await AsyncStorage.getItem('userPreferences');

                // If no user preferences, try guest preferences
                if (!savedPreferences) {
                    savedPreferences = await AsyncStorage.getItem('guestPreferences');
                }

                if (savedPreferences) {
                    const preferences = JSON.parse(savedPreferences);
                    if (preferences.theme) {
                        setThemeMode(preferences.theme);
                    }
                }
            } catch (error) {
                console.error('Error loading saved theme:', error);
                // Fallback to system theme
                setThemeMode(defaultScheme || 'light');
            } finally {
                setIsThemeLoaded(true);
            }
        };

        loadSavedTheme();
    }, []);

    // Update theme when changed externally (from settings)
    const updateTheme = (newTheme) => {
        setThemeMode(newTheme);
    };

    const toggleTheme = () => {
        setThemeMode(prev => (prev === 'light' ? 'dark' : 'light'));
    };

    const value = useMemo(() => ({
        theme: themes[themeMode],
        themeMode,
        toggleTheme,
        updateTheme,
        isThemeLoaded,
    }), [themeMode, isThemeLoaded]);

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);
