import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const StanzaView = ({ stanza }) => {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Stanza {stanza.stanzaNumber}</Text>
            <Text style={styles.text}>{stanza.text}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 24,
        alignItems: "center",
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        color: '#666',
        marginBottom: 8,
    },
    text: {
        fontSize: 18,
        lineHeight: 28,
        color: '#333',
    },
});

export default StanzaView;
