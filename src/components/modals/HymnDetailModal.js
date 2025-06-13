import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';

export const HymnDetailModal = ({ onShare, onFeedback, onClose }) => {
    const { colors } = useTheme().theme;

    const styles = StyleSheet.create({
        modalContainer: {
            minWidth: 280,
        },
        modalTitle: {
            fontSize: 18,
            fontWeight: '600',
            marginBottom: 16,
            color: colors.header,
            textAlign: 'center',
        },
        modalOption: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: 16,
            paddingHorizontal: 4,
            borderBottomWidth: 0.5,
            borderBottomColor: colors.textSecondary,
        },
        modalOptionIcon: {
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: colors.card,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 16,
        },
        modalOptionContent: {
            flex: 1,
        },
        modalOptionTitle: {
            fontSize: 16,
            fontWeight: '600',
            color: colors.text,
            marginBottom: 2,
        },
        modalOptionSubtitle: {
            fontSize: 14,
            color: colors.textSecondary,
        },
        cancelButton: {
            marginTop: 20,
            paddingVertical: 14,
            backgroundColor: '#F5F5F5',
            borderRadius: 8,
            alignItems: 'center',
        },
        cancelButtonText: {
            fontSize: 16,
            fontWeight: '600',
            color: '#666',
        },
    });

    return (
        <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Options</Text>

            <TouchableOpacity
                style={styles.modalOption}
                onPress={() => {
                    onShare();
                    onClose();
                }}
            >
                <View style={styles.modalOptionIcon}>
                    <Ionicons name="share-outline" size={24} color={colors.header} />
                </View>
                <View style={styles.modalOptionContent}>
                    <Text style={styles.modalOptionTitle}>Share Hymn</Text>
                    <Text style={styles.modalOptionSubtitle}>
                        Share this hymn with others
                    </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.header} />
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.modalOption}
                onPress={() => {
                    onFeedback();
                    onClose();
                }}
            >
                <View style={styles.modalOptionIcon}>
                    <Ionicons name="chatbubble-outline" size={24} color={colors.header} />
                </View>
                <View style={styles.modalOptionContent}>
                    <Text style={styles.modalOptionTitle}>Send Feedback</Text>
                    <Text style={styles.modalOptionSubtitle}>
                        Report issues or suggestions
                    </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.header} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
        </View>
    );
};
