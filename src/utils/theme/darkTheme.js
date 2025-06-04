// src/theme/darkTheme.js
export default {
    dark: true,
    colors: {
        // Primary colors - maintaining AUCA brand recognition in dark mode
        primary: '#27537e',    // Brighter blue for better visibility in dark mode
        secondary: '#FFFFFF',   // White

        // Background colors
        background: '#0F172A',  // Dark blue-black background
        card: '#1E293B',        // Slightly lighter card background

        // Text colors
        text: '#F1F5F9',        // Light gray text for readability
        textSecondary: '#CBD5E1', // Secondary text with good contrast

        // UI elements
        border: '#334155',      // Subtle border color for dark mode
        notification: '#F87171', // Lighter red for better visibility
        error: '#F87171',       // Lighter red for better visibility
        success: '#34D399',     // Slightly lighter green for dark mode
        warning: '#FBBF24',     // Slightly lighter amber for dark mode
        info: '#60A5FA',        // Slightly lighter blue for dark mode

        // Form elements
        disabled: '#64748B',
        placeholder: '#94A3B8',
        inputBackground: '#1E293B',

        // Accents
        highlight: '#1B3058',   // Darker blue highlight for dark mode
        headerBackground: '#0F172A',
        headerText: '#F1F5F9',
        tabBarBackground: '#0F172A',
        tabBarActive: '#60A5FA', // Lighter blue for active tabs in dark mode
        tabBarInactive: '#94A3B8',
        chip: '#334155',
        cardShadow: '#020617',
        divider: '#334155',

        // Text on colored backgrounds
        textOnPrimary: '#F1F5F9',
        textOnSecondary: '#0F172A', // Dark text on light background
        textOnError: '#F1F5F9',
        textDisabled: '#64748B',

        // AUCA specific colors (adjusted for dark mode)
        accent: {
            red: '#F87171',       // Brighter red for dark mode
            navy: '#3B82F6',      // Slightly lighter blue for dark mode
            yellow: '#FBBF24',    // Slightly softer yellow for dark mode
            maroon: '#EF4444',    // Brighter red for emphasis in dark mode
        },
    },
    spacing: {
        xs: 4,
        sm: 8,
        md: 16,
        lg: 24,
        xl: 32,
        xxl: 48,
    },
    typography: {
        fontFamily: {
            regular: 'System',
            medium: 'System',
            bold: 'System',
        },
        fontSize: {
            xs: 12,
            sm: 14,
            md: 16,
            lg: 18,
            xl: 20,
            xxl: 24,
            xxxl: 28,
            title: 32,
        },
        lineHeight: {
            tight: 1.2,
            normal: 1.5,
            relaxed: 1.8,
        },
    },
    borderRadius: {
        xs: 4,
        sm: 8,
        md: 12,
        lg: 16,
        xl: 24,
        round: 9999,
    },
    opacity: {
        light: 0.2,
        medium: 0.5,
        high: 0.8,
    },
    shadows: {
        none: {
            shadowColor: 'transparent',
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0,
            shadowRadius: 0,
            elevation: 0,
        },
        small: {
            shadowColor: '#020617',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.2,
            shadowRadius: 1.5,
            elevation: 2,
        },
        medium: {
            shadowColor: '#020617',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 3,
            elevation: 4,
        },
        large: {
            shadowColor: '#020617',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 5,
            elevation: 8,
        },
    },
    animation: {
        timing: {
            fast: 150,
            normal: 300,
            slow: 450,
        },
    },
};