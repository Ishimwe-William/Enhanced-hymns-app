import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import ContentBlock from './ContentBlock';

const HymnRefrainsSection = ({
                                 refrains,
                                 onAddRefrain,
                                 onUpdateRefrain,
                                 onRemoveRefrain
                             }) => {
    const sortedRefrains = Object.values(refrains).sort((a, b) => a.refrainNumber - b.refrainNumber);

    return (
        <View style={styles.section}>
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Refrains</Text>
                <TouchableOpacity style={styles.addButton} onPress={onAddRefrain}>
                    <Text style={styles.addButtonText}>+ Add Refrain</Text>
                </TouchableOpacity>
            </View>

            {sortedRefrains.map((refrain) => (
                <ContentBlock
                    // TODO: fix duplicate keys
                    key={`refrain-${refrain.refrainNumber}`}
                    item={refrain}
                    type="refrain"
                    onTextChange={onUpdateRefrain}
                    onRemove={onRemoveRefrain}
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

export default HymnRefrainsSection;
