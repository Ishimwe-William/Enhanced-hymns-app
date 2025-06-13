import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MyConstants } from '../../../utils/constants';

export const HymnShareCapture = React.forwardRef(({ hymn }, ref) => {
    const styles = StyleSheet.create({
        captureOverlay: {
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'transparent',
            alignItems: 'center',
            justifyContent: 'center',
        },
        shareableContent: {
            width: '90%',
            backgroundColor: '#FFFFFF',
            padding: 20,
            borderRadius: 8,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 5,
        },
        hymnHeader: {
            alignItems: 'center',
            marginBottom: 16,
            borderBottomWidth: 1,
            borderBottomColor: '#E0E0E0',
            paddingBottom: 12,
        },
        hymnNumber: {
            fontSize: 16,
            color: '#666',
            fontWeight: '500',
        },
        appBranding: {
            alignItems: 'center',
            marginTop: 20,
            paddingTop: 12,
            borderTopWidth: 1,
            borderTopColor: '#E0E0E0',
        },
        brandingText: {
            fontSize: 12,
            color: '#999',
            fontStyle: 'italic',
        },
    });

    return (
        <View style={styles.captureOverlay}>
            <View
                ref={ref}
                style={styles.shareableContent}
                collapsable={false}
            >
                <View style={styles.hymnHeader}>
                    <Text style={styles.hymnNumber}>{hymn.number} - {hymn.title}</Text>
                </View>
                {hymn.stanzas && Object.values(hymn.stanzas)
                    .sort((a, b) => a.stanzaNumber - b.stanzaNumber)
                    .map((stanza, index) => (
                        <View key={index}>
                            <Text style={{textAlign: "center"}}>{stanza.stanzaNumber}.</Text>
                            <Text style={{textAlign: "center"}}>{stanza.text}</Text>
                        </View>
                    ))}
                {hymn.refrains && Object.values(hymn.refrains).length > 0 && (
                    <View>
                        <Text style={{textAlign: "center"}}>Chorus:</Text>
                        <Text style={{textAlign: "center"}}>
                            {Object.values(hymn.refrains).sort((a, b) => a.refrainNumber - b.refrainNumber)[0].text}
                        </Text>
                    </View>
                )}
                <View style={styles.appBranding}>
                    <Text style={styles.brandingText}>Shared from {MyConstants.AppName}</Text>
                </View>
            </View>
        </View>
    );
});
