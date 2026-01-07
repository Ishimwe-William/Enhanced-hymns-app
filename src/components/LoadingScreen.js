import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { useTheme } from "../context/ThemeContext";

const LoadingScreen = ({ message = 'Loading...' }) => {
    const { colors } = useTheme().theme;

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            // 0.7 opacity black background for the "transparent dark" look
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            // Optional: If you want this to overlay on top of other content absolutely
            // ...StyleSheet.absoluteFillObject,
            // zIndex: 999,
        },
        message: {
            marginTop: 16,
            fontSize: 16,
            // Force white text so it's visible on the dark background
            color: '#FFFFFF',
            fontWeight: '500',
        },
    });

    return (
        <View style={styles.container}>
            {/* Use White or your Primary color for the spinner */}
            <ActivityIndicator size="large" color="#FFFFFF" />
            <Text style={styles.message}>{message}</Text>
        </View>
    );
};

export default LoadingScreen;