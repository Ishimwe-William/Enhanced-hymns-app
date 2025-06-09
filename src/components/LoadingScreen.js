import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import {useTheme} from "../context/ThemeContext";

const LoadingScreen = ({ message = 'Loading...' }) => {
    const {colors} = useTheme().theme;

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: colors.card
        },
        message: {
            marginTop: 16,
            fontSize: 16,
            color: colors.textSecondary,
        },
    });


    return (
        <View style={styles.container}>
            <ActivityIndicator size="large" color={colors.info} />
            <Text style={styles.message}>{message}</Text>
        </View>
    );
};


export default LoadingScreen;
