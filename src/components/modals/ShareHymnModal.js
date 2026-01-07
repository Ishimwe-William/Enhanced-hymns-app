import React, {useRef} from 'react';
import {
    Modal,
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TouchableWithoutFeedback,
} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import HymnContent from '../../components/hymns/detail/HymnContent';
import {useTheme} from "../../context/ThemeContext";

export default function ShareHymnModal({
                                           visible,
                                           onClose,
                                           hymn,
                                           onShareAsImage,
                                           onShareAsText,
                                       }) {
    const {colors} = useTheme().theme;
    // Create a ref that points to the view you want to capture
    const viewShotRef = useRef(null);

    if (!hymn) return null;

    // When “Share as Image” is tapped, we pass the ref and hymn up
    const handleImagePress = () => {
        if (viewShotRef.current) {
            onShareAsImage(viewShotRef.current);
        }
        onClose();
    };

    // When “Share as Text” is tapped, just call the callback
    const handleTextPress = () => {
        onShareAsText();
        onClose();
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            statusBarTranslucent
            onRequestClose={onClose}
        >
            {/* Tapping outside the card dismisses */}
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={styles.backdrop}/>
            </TouchableWithoutFeedback>

            <View style={styles.centeredContainer}>
                <View style={styles.card}>
                    {/* Close (X) */}
                    <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                        <Ionicons name="close" size={24} color={colors.warning}/>
                    </TouchableOpacity>

                    {/* ─── THE CAPTURED CONTENT: WRAP IN A VIEW for captureRef ───────── */}
                    <View
                        ref={viewShotRef}
                        style={styles.shareableContent}
                        collapsable={false}
                    >
                        {/* Hymn Header */}
                        <View style={styles.hymnHeader}>
                            <Text style={styles.hymnTitle}>{hymn.title}</Text>
                            <Text style={styles.hymnNumber}>Hymn {hymn.number}</Text>
                        </View>

                        {/* HymnContent (the lyrics) */}
                        <HymnContent hymn={hymn}/>

                        {/* Branding line at bottom */}
                        <View style={styles.appBranding}>
                            <Text style={styles.brandingText}>Shared from Hymns App</Text>
                        </View>
                    </View>
                    {/* ──────────────────────────────────────────────────────────────────── */}

                    <View style={styles.divider}/>

                    {/* Share Options */}
                    <TouchableOpacity
                        style={styles.optionButton}
                        onPress={handleImagePress}
                    >
                        <Ionicons
                            name="image-outline"
                            size={24}
                            color={colors.warning}
                            style={styles.optionIcon}
                        />
                        <View style={styles.optionTextContainer}>
                            <Text style={styles.optionTitle}>Share as Image</Text>
                            <Text style={styles.optionSubtitle}>Send hymn as a picture</Text>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.optionButton}
                        onPress={handleTextPress}
                    >
                        <Ionicons
                            name="text-outline"
                            size={24}
                            color="#007AFF"
                            style={styles.optionIcon}
                        />
                        <View style={styles.optionTextContainer}>
                            <Text style={styles.optionTitle}>Share as Text</Text>
                            <Text style={styles.optionSubtitle}>
                                Send hymn lyrics as text
                            </Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    backdrop: {
        flex: 1,
        backgroundColor: '#00000066',
    },
    centeredContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
    },
    card: {
        width: '90%',
        maxHeight: '85%',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        paddingTop: 16,
        paddingBottom: 20,
        paddingHorizontal: 20,
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 6,
    },
    closeButton: {
        position: 'absolute',
        top: 12,
        right: 12,
        zIndex: 10,
    },
    shareableContent: {
        paddingBottom: 16,
    },
    hymnHeader: {
        alignItems: 'center',
        marginBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
        paddingBottom: 12,
    },
    hymnTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333333',
        textAlign: 'center',
    },
    hymnNumber: {
        fontSize: 14,
        color: '#666666',
        fontWeight: '500',
        marginTop: 4,
    },
    appBranding: {
        alignItems: 'center',
        marginTop: 16,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#E0E0E0',
    },
    brandingText: {
        fontSize: 12,
        color: '#999999',
        fontStyle: 'italic',
    },
    divider: {
        height: 1,
        backgroundColor: '#E0E0E0',
        marginVertical: 12,
    },
    optionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
    },
    optionIcon: {
        marginRight: 16,
    },
    optionTextContainer: {
        flex: 1,
    },
    optionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333333',
    },
    optionSubtitle: {
        fontSize: 13,
        color: '#666666',
        marginTop: 2,
    },
});
