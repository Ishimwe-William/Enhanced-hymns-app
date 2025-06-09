// src/screens/hymns/HymnDetail.js

import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    StyleSheet,
    Text,
    TouchableOpacity,
    Alert,
    Linking,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Header from '../../components/ui/Header';
import HymnContent from '../../components/hymns/detail/HymnContent';
import HymnControls from '../../components/hymns/detail/HymnControls';
import LoadingScreen from '../../components/LoadingScreen';
import { useHymns } from '../../context/HymnContext';
import { useUser } from '../../context/UserContext';
import { Ionicons } from '@expo/vector-icons';

// Import our new share utilities
import { shareHymnAsImage, shareHymnAsText } from '../../utils/shareHymn';
import {MyConstants} from "../../utils/constants";
import {useTheme} from "../../context/ThemeContext";

const HymnDetail = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { hymnId } = route.params;

    const { hymns, loadHymnDetails } = useHymns();
    const { user } = useUser();

    const [hymn, setHymn] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isCapturing, setIsCapturing] = useState(false);

    const {colors} = useTheme().theme;

    // We’ll capture exactly the “shareableContent” <View> when isCapturing===true
    const viewShotRef = useRef(null);

    // Check if current user is admin
    const isAdmin = user?.role === 'admin' || user?.isAdmin === true;

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.card,
        },
        modalContainer: {
            minWidth: 280,
        },
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
            // If you want a drop‐shadow for the captured image:
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
        hymnTitle: {
            fontSize: 24,
            fontWeight: 'bold',
            color: '#333',
            textAlign: 'center',
            marginBottom: 4,
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
        modalTitle: {
            fontSize: 18,
            fontWeight: '600',
            marginBottom: 16,
            color: colors.header,
            textAlign: 'center',
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
        adminOption: {
            backgroundColor: '#FFF9F0',
            borderRadius: 8,
            marginTop: 8,
            paddingHorizontal: 12,
            borderBottomWidth: 0,
        },
        adminOptionIcon: {
            backgroundColor: '#FFF4E6',
        },
        adminOptionTitle: {
            color: '#FF9500',
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


    useEffect(() => {
        const loadHymn = async () => {
            try {
                setLoading(true);
                const hymnData = await loadHymnDetails(hymnId);
                setHymn(hymnData);
            } catch (error) {
                console.error('Error loading hymn:', error);
            } finally {
                setLoading(false);
            }
        };
        loadHymn();
    }, [hymnId]);

    const handleBack = () => {
        navigation.goBack();
    };

    const handleEdit = () => {
        navigation.navigate('HymnEdit', { hymnId });
    };

    // Tapping “Share” → show Alert to choose “Image” vs “Text”
    const handleShare = () => {
        if (!hymn) {
            Alert.alert('Cannot share right now', 'Hymn data is not loaded yet.');
            return;
        }

        Alert.alert(
            'Share Hymn',
            'How would you like to share this hymn?',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Share as Image', onPress: () => beginImageShare() },
                { text: 'Share as Text', onPress: () => beginTextShare() },
            ]
        );
    };

    const beginImageShare = async () => {
        setIsCapturing(true);

        // Wait a short moment so the “shareableContent” actually appears in the view hierarchy
        // before we captureRef(...) it.
        setTimeout(async () => {
            try {
                if (viewShotRef.current) {
                    await shareHymnAsImage(viewShotRef.current, hymn);
                } else {
                    Alert.alert('Error', 'Could not find the view to capture.');
                }
            } catch (err) {
                // shareHymnAsImage already shows an alert on failure
            } finally {
                setIsCapturing(false);
            }
        }, 300);
    };

    // ⬇️ When “Share as Text” is tapped, just call shareHymnAsText
    const beginTextShare = async () => {
        try {
            await shareHymnAsText(hymn);
        } catch (err) {
            // shareHymnAsText already shows alert on failure
        }
    };

    const handleFeedback = () => {
        Alert.alert(
            'Send Feedback',
            'How would you like to send your feedback?',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Email', onPress: handleEmailFeedback },
                { text: 'In-App Form', onPress: handleInAppFeedback },
            ]
        );
    };

    const handleEmailFeedback = () => {
        // If you have an environment variable for feedback email:
        const email = Constants.expoConfig.extra.EXPO_PUBLIC_FEEDBACK_EMAIL || 'feedback@hymnsapp.com';
        const subject = `Feedback for Hymn ${hymn.number} - ${hymn.title}`;
        const body = `I would like to provide feedback about Hymn ${hymn.number} - "${hymn.title}":\n\n`;

        const mailtoUrl = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

        Linking.openURL(mailtoUrl).catch(() => {
            Alert.alert(
                'Email Not Available',
                `Please send your feedback to: ${email}`
            );
        });
    };

    const handleInAppFeedback = () => {
        navigation.navigate('FeedbackForm', {
            hymnId,
            hymnTitle: hymn.title,
            hymnNumber: hymn.number,
        });
    };

    const handleNext = () => {
        if (!hymn || !hymns || hymns.length === 0) return;
        const currentIndex = hymns.findIndex(h => h.id === hymn.id);
        if (currentIndex < 0) return;

        const nextIndex = currentIndex + 1;
        if (nextIndex < hymns.length) {
            const nextHymn = hymns[nextIndex];
            navigation.replace('HymnDetail', { hymnId: nextHymn.id });
        } else {
            Alert.alert('End of List', 'There is no next hymn.');
        }
    };

    const handlePrevious = () => {
        if (!hymn || !hymns || hymns.length === 0) return;
        const currentIndex = hymns.findIndex(h => h.id === hymn.id);
        if (currentIndex < 0) return;

        const prevIndex = currentIndex - 1;
        if (prevIndex >= 0) {
            const prevHymn = hymns[prevIndex];
            navigation.replace('HymnDetail', { hymnId: prevHymn.id });
        } else {
            Alert.alert('Start of List', 'There is no previous hymn.');
        }
    };

    const renderModalContent = ({ closeModal }) => (
        <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Options</Text>

            <TouchableOpacity
                style={styles.modalOption}
                onPress={() => {
                    handleShare();
                    closeModal();
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
                    handleFeedback();
                    closeModal();
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

            {isAdmin && (
                <TouchableOpacity
                    style={[styles.modalOption, styles.adminOption]}
                    onPress={() => {
                        handleEdit();
                        closeModal();
                    }}
                >
                    <View style={[styles.modalOptionIcon, styles.adminOptionIcon]}>
                        <Ionicons name="create-outline" size={24} color={colors.waring} />
                    </View>
                    <View style={styles.modalOptionContent}>
                        <Text style={[styles.modalOptionTitle, styles.adminOptionTitle]}>
                            Edit Hymn
                        </Text>
                        <Text style={styles.modalOptionSubtitle}>
                            Admin: Modify hymn content
                        </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
                </TouchableOpacity>
            )}

            <TouchableOpacity style={styles.cancelButton} onPress={closeModal}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
        </View>
    );

    if (loading) {
        return <LoadingScreen message="Loading hymn..." />;
    }

    return (
        <View style={styles.container}>
            <Header
                title={`${hymn.number} - ${hymn.title}` || 'Hymn'}
                showBack
                onBack={handleBack}
                onMore={isAdmin ? handleEdit : undefined}
                moreIcon={isAdmin ? 'create-outline' : 'ellipsis-vertical'}
                showMore={true}
                modalContent={isAdmin ? undefined : renderModalContent}
            />

            {/* ─── Normal UI: show the HymnContent + Controls ───────────────────── */}
            <HymnContent hymn={hymn} />

            <HymnControls
                hymn={hymn}
                onNext={handleNext}
                onPrevious={handlePrevious}
                onShare={handleShare}
            />

            {/* ─── ONLY WHEN isCapturing===true do we render the “shareableContent” to be captured ─── */}
            {isCapturing && (
                <View style={styles.captureOverlay}>
                    <View
                        ref={viewShotRef}
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
                            <View >
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
            )}
        </View>
    );
};


export default HymnDetail;
