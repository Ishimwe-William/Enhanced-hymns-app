import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {useTheme} from "../context/ThemeContext";

const EmptyState = ({ icon, title, message }) => {
    const {colors} = useTheme().theme;

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: 40,
            backgroundColor: colors.card,
        },
        iconContainer: {
            marginBottom: 16,
        },
        title: {
            fontSize: 20,
            fontWeight: '600',
            color: colors.textSecondary,
            marginBottom: 8,
            textAlign: 'center',
        },
        message: {
            fontSize: 16,
            color: colors.textSecondary,
            fontWeight: '300',
            textAlign: 'center',
            lineHeight: 22,
        },
    });

    return (
        <View style={styles.container}>
            <View style={styles.iconContainer}>
                <Ionicons name={icon} size={64} color={colors.textSecondary} />
            </View>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.message}>{message}</Text>
        </View>
    );
};



export default EmptyState;
