import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const RefrainView = ({ refrain }) => {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Refrain</Text>
            <Text style={styles.text}>{refrain.text}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 24,
        alignItems:'center',
        paddingLeft: 16,
        borderLeftWidth: 3,
        borderLeftColor: '#007AFF',
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        color: '#007AFF',
        marginBottom: 8,
    },
    text: {
        fontSize: 18,
        lineHeight: 28,
        color: '#333',
        fontStyle: 'italic',
    },
});

export default RefrainView;
