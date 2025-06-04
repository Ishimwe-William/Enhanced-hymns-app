// src/theme/lightTheme.js
export default {
    dark: false,
    colors: {
        // Primary colors - updated to match AUCA colors
        primary: '#184C7F',     // AUCA blue
        secondary: '#FFFFFF',   // White

        // Background colors
        background: '#F8FAFC',  // Very light blue-gray background
        card: '#EFF6FF',        // Light blue tint for cards

        // Text colors
        text: '#0F172A',        // Dark blue-black text
        textSecondary: '#334155', // Darker secondary text

        // UI elements
        border: '#CBD5E1',
        notification: '#B22234', // AUCA red
        error: '#B22234',       // AUCA red
        success: '#10B981',
        warning: '#F59E0B',
        info: '#1C4DA1',        // AUCA blue

        // Form elements
        disabled: '#94A3B8',
        placeholder: '#64748B',
        inputBackground: '#F1F5F9',

        // Accents
        highlight: '#DBEAFE',
        headerBackground: '#F8FAFC',
        headerText: '#0F172A',
        tabBarBackground: '#F8FAFC',
        tabBarActive: '#1C4DA1', // AUCA blue
        tabBarInactive: '#64748B',
        chip: '#E2E8F0',
        cardShadow: '#64748B',
        divider: '#E2E8F0',

        // Text on colored backgrounds
        textOnPrimary: '#FFFFFF',
        textOnSecondary: '#1C4DA1', // Blue text on white
        textOnError: '#FFFFFF',
        textDisabled: '#94A3B8',

        // AUCA specific colors
        accent: {
            red: '#B22234',       // Deep red from testimonial section
            navy: '#172554',      // Navy blue from testimonial section
            yellow: '#FFD700',    // Gold accent
            maroon: '#94171E',    // Darker red for emphasis
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
            shadowColor: '#64748B',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.1,
            shadowRadius: 1.5,
            elevation: 2,
        },
        medium: {
            shadowColor: '#64748B',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.12,
            shadowRadius: 3,
            elevation: 4,
        },
        large: {
            shadowColor: '#64748B',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.15,
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
