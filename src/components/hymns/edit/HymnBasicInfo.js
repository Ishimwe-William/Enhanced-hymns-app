import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';

const HymnBasicInfo = ({ editedHymn, setEditedHymn }) => {
    return (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Basic Information</Text>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>Title</Text>
                <TextInput
                    style={styles.input}
                    value={editedHymn.title}
                    onChangeText={(text) => setEditedHymn(prev => ({...prev, title: text}))}
                    placeholder="Enter hymn title"
                    multiline
                />
            </View>

            <View style={styles.row}>
                <View style={[styles.inputGroup, styles.halfWidth]}>
                    <Text style={styles.label}>Number</Text>
                    <TextInput
                        style={styles.input}
                        value={editedHymn.number.toString()}
                        onChangeText={(text) => setEditedHymn(prev => ({...prev, number: parseInt(text) || 0}))}
                        placeholder="Number"
                        keyboardType="numeric"
                    />
                </View>

                <View style={[styles.inputGroup, styles.halfWidth]}>
                    <Text style={styles.label}>Key (Doh)</Text>
                    <TextInput
                        style={styles.input}
                        value={editedHymn.doh}
                        onChangeText={(text) => setEditedHymn(prev => ({...prev, doh: text}))}
                        placeholder="e.g., C, G, F#"
                    />
                </View>
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>Origin</Text>
                <TextInput
                    style={styles.input}
                    value={editedHymn.origin}
                    onChangeText={(text) => setEditedHymn(prev => ({...prev, origin: text}))}
                    placeholder="Enter hymn origin"
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    inputGroup: {
        marginBottom: 16,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    halfWidth: {
        width: '48%',
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        backgroundColor: '#fff',
        minHeight: 44,
        color: '#333',
    },
});

export default HymnBasicInfo;
