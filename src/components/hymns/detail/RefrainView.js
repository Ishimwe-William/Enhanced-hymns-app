import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import {useTheme} from "../../../context/ThemeContext";

const RefrainView = ({ refrain }) => {
    const colors = useTheme().theme.colors;

    const styles = StyleSheet.create({
        container: {
            marginBottom: 24,
            alignItems:'center',
            paddingLeft: 16,
            borderLeftWidth: 3,
            borderLeftColor: colors.header,
        },
        title: {
            fontSize: 16,
            fontWeight: '600',
            color: colors.header,
            marginBottom: 8,
        },
        text: {
            textAlign: 'center',
            fontSize: 18,
            lineHeight: 28,
            color: colors.textSecondary,
            fontStyle: 'italic',
        },
    });

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Refrain</Text>
            <Text style={styles.text}>{refrain.text}</Text>
        </View>
    );
};


export default RefrainView;
