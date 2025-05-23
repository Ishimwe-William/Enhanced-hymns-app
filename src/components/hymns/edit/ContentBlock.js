import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';

const ContentBlock = ({
                          item,
                          type, // 'stanza' or 'refrain'
                          onTextChange,
                          onRemove
                      }) => {
    const isStanza = type === 'stanza';
    const number = isStanza ? item.stanzaNumber : item.refrainNumber;
    const title = isStanza ? `Stanza ${number}` : `Refrain ${number}`;
    const placeholder = isStanza ? 'Enter stanza text' : 'Enter refrain text';

    return (
        <View style={styles.contentBlock}>
            <View style={styles.contentHeader}>
                <Text style={styles.contentTitle}>{title}</Text>
                <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => onRemove(number)}
                >
                    <Text style={styles.removeButtonText}>Remove</Text>
                </TouchableOpacity>
            </View>
            <TextInput
                style={styles.contentInput}
                value={item.text || ''}
                onChangeText={(text) => onTextChange(number, text)}
                placeholder={placeholder}
                multiline
                textAlignVertical="top"
            />
        </View>
    );
};

const styles = StyleSheet.create({
    contentBlock: {
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 8,
        overflow: 'hidden',
    },
    contentHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    contentTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    contentInput: {
        padding: 12,
        fontSize: 16,
        minHeight: 100,
        textAlignVertical: 'top',
        color: '#333',
        backgroundColor: '#fff',
    },
    removeButton: {
        backgroundColor: '#FF3B30',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    removeButtonText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
    },
});

export default ContentBlock;
