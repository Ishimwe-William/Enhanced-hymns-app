export const themes = {
    light: {
        mode: 'light',
        colors: {
            background: '#F0F8FF',           // Soft light gray, like iOS light background
            text: '#333333',                 // Primary dark text
            primary: '#E0E0E0',              // Light neutral, matches dark.primary tone
            header: '#0076fe',              // Same across both themes
            card: '#FFFFFF',                 // Pure white cards
            border: '#D1D1D6',               // Softer border color
            notification: '#007AFF',         // iOS blue
            textSecondary: '#666666',        // Darker gray for subtext,
            warning: "#fd9601",            // iOS red for warnings
            danger: "#FF3B30",            // iOS red for errors
        },
    },
    dark: {
        mode: 'dark',
        colors: {
            background: '#000000',
            text: '#FFFFFF',
            primary: '#273c4b',
            header: '#FF9800',
            card: '#1C1C1E',
            border: '#3A3A3C',
            notification: '#0A84FF',
            textSecondary: '#a5a8a8',
            warning: "#fd9601",            // iOS red for warnings
            danger: "#FF3B30",            // iOS red for errors
        },
    },
};
