export const themes = {
    light: {
        mode: 'light',
        artwork: require('../../../assets/artwork-light.png'),
        colors: {
            background: '#F0F8FF',           // Soft light gray, like iOS light background
            text: '#333333',                 // Primary dark text
            primary: '#E1F3EF',              // Light neutral, matches dark.primary tone
            header: '#00AD95',              // Same across both themes
            card: '#FFFFFF',                 // Pure white cards
            border: '#D1D1D6',               // Softer border color
            notification: '#007AFF',         // iOS blue
            textSecondary: '#666666',        // Darker gray for subtext,
            warning: "#fd9601",            // iOS red for warnings
            danger: "#FF3B30",            // iOS red for errors
            track: "purple",
            trackText: "white",
        },
    },
    dark: {
        mode: 'dark',
        artwork: require('../../../assets/artwork-dark.png'),
        colors: {
            background: '#000000',
            text: '#FFFFFF',
            primary: '#1F2F3E',
            header: '#FF9800',
            track: "black",
            trackText: "white",
            card: '#1C1C1E',
            border: '#3A3A3C',
            notification: '#0A84FF',
            textSecondary: '#a5a8a8',
            warning: "#fd9601",            // iOS red for warnings
            danger: "#FF3B30",            // iOS red for errors
        },
    },
};
