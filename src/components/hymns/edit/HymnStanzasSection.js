import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import ContentBlock from './ContentBlock';

const HymnStanzasSection = ({
                                stanzas,
                                onAddStanza,
                                onUpdateStanza,
                                onRemoveStanza
                            }) => {
    const sortedStanzas = Object.values(stanzas).sort((a, b) => a.stanzaNumber - b.stanzaNumber);

    return (
        <View style={styles.section}>
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Stanzas</Text>
                <TouchableOpacity style={styles.addButton} onPress={onAddStanza}>
                    <Text style={styles.addButtonText}>+ Add Stanza</Text>
                </TouchableOpacity>
            </View>

            {sortedStanzas.map((stanza) => (
                <ContentBlock
                    // TODO: fix duplicate keys
                    key={`stanza-${stanza.stanzaNumber}`}
                    item={stanza}
                    type="stanza"
                    onTextChange={onUpdateStanza}
                    onRemove={onRemoveStanza}
                />
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    section: {
        marginBottom: 24,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    addButton: {
        backgroundColor: '#007AFF',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
    },
    addButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
});

export default HymnStanzasSection;
