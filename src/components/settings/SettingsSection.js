import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

const SettingsSection = ({ title, children }) => {
    const { theme } = useTheme();
    const colors = theme.colors;

    const styles = StyleSheet.create({
        section: {
            marginVertical: 22,
            marginHorizontal: 16,
        },
        sectionTitle: {
            fontSize: 14,
            fontWeight: '600',
            color: colors.textSecondary,
            marginBottom: 8,
            marginLeft: 16,
            textTransform: 'uppercase',
            letterSpacing: 0.5,
        },
    });

    return (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>{title}</Text>
            {children}
        </View>
    );
};

export default SettingsSection;
