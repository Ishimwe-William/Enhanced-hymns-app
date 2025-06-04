import React from 'react';
import {View, StyleSheet, Text, TouchableOpacity, Alert} from 'react-native';
import {useNavigation, DrawerActions} from '@react-navigation/native';
import {Ionicons} from '@expo/vector-icons';
import Header from '../../components/ui/Header';
import HymnListView from '../../components/hymns/list/HymnListView';
import EmptyState from '../../components/EmptyState';
import {useHymns} from '../../context/HymnContext';
import {useUser} from '../../context/UserContext';
import WarningBanner from "../../components/ui/WarningBanner";
import {useTheme} from "../../context/ThemeContext";

const RecentScreen = () => {
    const navigation = useNavigation();
    const {recentHymns, clearRecentHymns, isLoggedIn} = useHymns();
    const {user, signIn} = useUser();
    const {theme} = useTheme()
    const colors = theme.colors;

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: '#f5f5f5',
        },
        modalContainer: {
            alignItems: 'stretch',
            minWidth: 280,
        },
        modalTitle: {
            fontSize: 18,
            fontWeight: '600',
            marginBottom: 16,
            color: colors.text,
            textAlign: 'center',
        },
        modalOption: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: 12,
            paddingHorizontal: 16,
            borderRadius: 8,
            marginBottom: 4,
        },
        modalOptionText: {
            fontSize: 16,
            marginLeft: 12,
            flex: 1,
        },
        cancelOption: {
            marginTop: 8,
            borderTopWidth: 1,
            borderTopColor: colors.border,
            paddingTop: 12,
        },
        modalDivider: {
            height: 1,
            backgroundColor: colors.border,
            marginVertical: 8,
        },
        userInfo: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: 8,
            paddingHorizontal: 16,
        },
        userInfoText: {
            fontSize: 14,
            marginLeft: 8,
            color: colors.textSecondary,
            flex: 1,
        },
        warningInfo: {
            flexDirection: 'row',
            alignItems: 'flex-start',
            paddingVertical: 8,
            paddingHorizontal: 16,
        },
        warningText: {
            fontSize: 12,
            marginLeft: 8,
            color: colors.textSecondary,
            flex: 1,
            lineHeight: 16,
        },
        guestBannerText: {
            flex: 1,
            marginLeft: 8,
            marginRight: 12,
            fontSize: 14,
            color: colors.info,
        },
        signInButton: {
            backgroundColor: colors.primary,
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 6,
        },
        signInButtonText: {
            color: 'white',
            fontSize: 12,
            fontWeight: '600',
        },
    });


    const handleMenuPress = () => {
        navigation.dispatch(DrawerActions.openDrawer());
    };

    const handleHymnSelect = (hymnId) => {
        navigation.navigate('HymnsStack', {
            screen: 'HymnDetail',
            params: {hymnId}
        });
    };

    const handleClearRecent = () => {
        Alert.alert(
            'Clear Recent Hymns',
            'Are you sure you want to clear all recent hymns?',
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Clear',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await clearRecentHymns();
                            Alert.alert('Success', 'Recent hymns cleared successfully');
                        } catch (error) {
                            Alert.alert('Error', 'Failed to clear recent hymns');
                        }
                    },
                },
            ]
        );
    };

    const handleSignInPrompt = () => {
        Alert.alert(
            'Sign In Required',
            'Sign in to save your recent hymns across devices and access more features.',
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Sign In',
                    onPress: () => signIn(),
                },
            ]
        );
    };

    // Modal content component - shows different options based on user state
    const renderModalContent = ({closeModal}) => (
        <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Recent Hymns Options</Text>

            {isLoggedIn ? (
                // Logged in user options
                <>
                    <TouchableOpacity
                        style={styles.modalOption}
                        onPress={() => {
                            closeModal();
                            handleClearRecent();
                        }}
                        disabled={recentHymns.length === 0}
                    >
                        <Ionicons
                            name="trash-outline"
                            size={20}
                            color={recentHymns.length === 0 ? colors.disabled : colors.error}
                        />
                        <Text style={[
                            styles.modalOptionText,
                            {
                                color: recentHymns.length === 0 ? colors.disabled : colors.error
                            }
                        ]}>
                            Clear Recent Hymns
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.modalOption}
                        onPress={() => {
                            closeModal();
                            navigation.navigate('Settings');
                        }}
                    >
                        <Ionicons name="settings-outline" size={20} color={colors.primary}/>
                        <Text style={[styles.modalOptionText, {color: colors.primary}]}>
                            Sync Settings
                        </Text>
                    </TouchableOpacity>

                    <View style={styles.modalDivider}/>

                    <View style={styles.userInfo}>
                        <Ionicons name="person-circle-outline" size={20} color={theme.textSecondary}/>
                        <Text style={styles.userInfoText}>
                            Signed in as {user?.displayName || user?.email}
                        </Text>
                    </View>
                </>
            ) : (
                // Guest user options
                <>
                    <TouchableOpacity
                        style={styles.modalOption}
                        onPress={() => {
                            closeModal();
                            handleSignInPrompt();
                        }}
                    >
                        <Ionicons name="log-in-outline" size={20} color={colors.primary}/>
                        <Text style={[styles.modalOptionText, {color: colors.primary}]}>
                            Sign In to Save Data
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.modalOption}
                        onPress={() => {
                            closeModal();
                            handleClearRecent();
                        }}
                        disabled={recentHymns.length === 0}
                    >
                        <Ionicons
                            name="trash-outline"
                            size={20}
                            color={recentHymns.length === 0 ? colors.disabled : colors.error}
                        />
                        <Text style={[
                            styles.modalOptionText,
                            {
                                color: recentHymns.length === 0 ? colors.disabled : colors.error
                            }
                        ]}>
                            Clear Recent Hymns
                        </Text>
                    </TouchableOpacity>

                    <View style={styles.modalDivider}/>

                    <View style={styles.warningInfo}>
                        <Ionicons name="warning-outline" size={16} color={colors.warning}/>
                        <Text style={styles.warningText}>
                            Your data is only stored locally. Sign in to backup across devices.
                        </Text>
                    </View>
                </>
            )}

            <TouchableOpacity
                style={[styles.modalOption, styles.cancelOption]}
                onPress={closeModal}
            >
                <Ionicons name="close-outline" size={20} color={colors.textSecondary}/>
                <Text style={[styles.modalOptionText, {color: colors.textSecondary}]}>
                    Cancel
                </Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={styles.container}>
            <Header
                title="Recent"
                showMenu
                onMenu={handleMenuPress}
                modalContent={renderModalContent}
            />

            {/* Show warning banner for guest users if they have recent hymns */}
            {!isLoggedIn && recentHymns.length > 0 && (
                <WarningBanner
                    message={"Sign in to backup your recent hymns across devices"}
                    signIn={signIn}
                />
            )}

            {recentHymns.length === 0 ? (
                <EmptyState
                    icon="time-outline"
                    title="No Recent Hymns"
                    message={
                        isLoggedIn
                            ? "Hymns you view will appear here for quick access"
                            : "Hymns you view will appear here. Sign in to save them across devices."
                    }
                    actionText={!isLoggedIn ? "Sign In" : undefined}
                    onActionPress={!isLoggedIn ? signIn : undefined}
                />
            ) : (
                <HymnListView hymns={recentHymns} onHymnSelect={handleHymnSelect}/>
            )}
        </View>
    );
};


export default RecentScreen;
