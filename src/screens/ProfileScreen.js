import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Image,
    ScrollView,
    Modal,
    Alert,
    Dimensions
} from 'react-native';
import {useUser} from '../context/UserContext';
import Header from "../components/ui/Header";
import {DrawerActions, useNavigation} from "@react-navigation/native";
import LoadingScreen from "../components/LoadingScreen";
import { Ionicons } from '@expo/vector-icons';
import {ListItem} from "../components/ui/ListItem";

const { width } = Dimensions.get('window');

const Profile = () => {
    const {user, loading, signIn, signOut} = useUser();
    const navigation = useNavigation();
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [signingOut, setSigningOut] = useState(false);

    if (loading) {
        return <LoadingScreen message="Loading profile..." />;
    }

    const handleMenuPress = () => {
        navigation.dispatch(DrawerActions.openDrawer());
    };

    const handleBack = () => {
        navigation.goBack();
    };

    const handleShowLogoutModal = () => {
        // Only show logout modal if user is authenticated
        if (user) {
            setShowLogoutModal(true);
        } else {
            // If no user is authenticated, show a message
            Alert.alert(
                "Not Signed In",
                "You are not currently signed in to your account.",
                [{ text: "OK", style: "default" }]
            );
        }
    };

    const handleConfirmLogout = async () => {
        setSigningOut(true);
        try {
            await signOut();
            setShowLogoutModal(false);
            // Optional: Show success message
            Alert.alert(
                "Signed Out",
                "You have been successfully signed out.",
                [{ text: "OK", style: "default" }]
            );
        } catch (error) {
            console.error('Logout error:', error);
            Alert.alert(
                "Error",
                "Failed to sign out. Please try again.",
                [{ text: "OK", style: "default" }]
            );
        } finally {
            setSigningOut(false);
        }
    };

    const handleCancelLogout = () => {
        setShowLogoutModal(false);
    };

    const LogoutModal = () => (
        <Modal
            animationType="fade"
            transparent={true}
            visible={showLogoutModal}
            onRequestClose={handleCancelLogout}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <View style={styles.modalIconContainer}>
                            <Ionicons name="log-out-outline" size={32} color="#FF3B30" />
                        </View>
                        <Text style={styles.modalTitle}>Sign Out</Text>
                        <Text style={styles.modalMessage}>
                            Are you sure you want to sign out of your account?
                        </Text>
                    </View>

                    <View style={styles.modalButtons}>
                        <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={handleCancelLogout}
                            disabled={signingOut}
                        >
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.confirmButton, signingOut && styles.disabledButton]}
                            onPress={handleConfirmLogout}
                            disabled={signingOut}
                        >
                            {signingOut ? (
                                <View style={styles.loadingContainer}>
                                    <Text style={styles.confirmButtonText}>Signing out...</Text>
                                </View>
                            ) : (
                                <Text style={styles.confirmButtonText}>Sign Out</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );

    return (
        <View style={styles.container}>
            <Header
                title="Profile"
                showMenu
                onBack={handleBack}
                onMenu={handleMenuPress}
                onMore={handleShowLogoutModal}
            />

            <ScrollView style={styles.content}>
                {user ? (
                    <>
                        {/* User Profile Header */}
                        <View style={styles.userHeaderContainer}>
                            <View style={styles.avatarContainer}>
                                {user.photoURL ? (
                                    <Image source={{ uri: user.photoURL }} style={styles.profileImage} />
                                ) : (
                                    <View style={styles.defaultAvatar}>
                                        <Ionicons name="person" size={40} color="#007AFF" />
                                    </View>
                                )}
                            </View>
                            <Text style={styles.welcomeText}>
                                {user.displayName || 'Welcome!'}
                            </Text>
                            <Text style={styles.userEmail}>{user.email}</Text>
                        </View>

                        {/* Account Information Section */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Account Information</Text>
                            <ListItem
                                icon="person-outline"
                                title="Display Name"
                                subtitle={user.displayName || 'Not set'}
                                onPress={() => {}}
                            />
                            <ListItem
                                icon="mail-outline"
                                title="Email"
                                subtitle={user.email}
                                onPress={() => {}}
                            />
                        </View>

                        {/* Account Actions Section */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Account Actions</Text>
                            <ListItem
                                icon="chatbubble-outline"
                                title="View Feedback"
                                subtitle="View your feedback and suggestions"
                                onPress={() => {}}
                            />
                            <ListItem
                                icon="shield-checkmark-outline"
                                title="Privacy Settings"
                                subtitle="Manage your privacy preferences"
                                onPress={() => {}}
                            />
                            <TouchableOpacity style={styles.signOutItem} onPress={handleShowLogoutModal}>
                                <View style={styles.signOutIcon}>
                                    <Ionicons name="log-out-outline" size={22} color="#FF3B30" />
                                </View>
                                <View style={styles.profileContent}>
                                    <Text style={styles.signOutTitle}>Sign Out</Text>
                                    <Text style={styles.profileSubtitle}>Sign out of your account</Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    </>
                ) : (
                    <View style={styles.signInSection}>
                        <View style={styles.signInContainer}>
                            <View style={styles.signInIcon}>
                                <Ionicons name="person-add-outline" size={48} color="#007AFF" />
                            </View>
                            <Text style={styles.signInTitle}>Welcome to Hymns Collection</Text>
                            <Text style={styles.signInMessage}>
                                Sign in to sync your favorites across devices and access personalized features
                            </Text>
                            <TouchableOpacity style={styles.signInButton} onPress={signIn}>
                                <Ionicons name="logo-google" size={20} color="white" style={styles.signInButtonIcon} />
                                <Text style={styles.signInButtonText}>Sign in with Google</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            </ScrollView>

            {/* Logout Modal */}
            <LogoutModal />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    content: {
        flex: 1,
    },
    profileContent:{
        flex: 1,
    },
    profileSubtitle:{
        fontSize: 14,
        color: '#666',
        marginTop: 2,
    },
    userHeaderContainer: {
        backgroundColor: 'white',
        alignItems: 'center',
        paddingVertical: 32,
        marginBottom: 16,
    },
    avatarContainer: {
        marginBottom: 16,
    },
    profileImage: {
        width: 80,
        height: 80,
        borderRadius: 40,
    },
    defaultAvatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#F0F8FF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    welcomeText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    userEmail: {
        fontSize: 16,
        color: '#666',
    },
    section: {
        marginTop: 32,
        marginHorizontal: 16,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
        marginBottom: 8,
        marginLeft: 16,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    signOutItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        padding: 16,
        marginBottom: 1,
    },
    signOutIcon: {
        width: 32,
        height: 32,
        borderRadius: 6,
        backgroundColor: '#FFF0F0',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    signOutTitle: {
        fontSize: 16,
        fontWeight: '500',
        color: '#FF3B30',
    },
    signInSection: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 32,
    },
    signInContainer: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 32,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    signInIcon: {
        marginBottom: 24,
    },
    signInTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 12,
        textAlign: 'center',
    },
    signInMessage: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 32,
    },
    signInButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#007AFF',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    signInButtonIcon: {
        marginRight: 8,
    },
    signInButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    modalContainer: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 24,
        width: width - 40,
        maxWidth: 340,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.25,
        shadowRadius: 12,
        elevation: 8,
    },
    modalHeader: {
        alignItems: 'center',
        marginBottom: 24,
    },
    modalIconContainer: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#FFF0F0',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
        textAlign: 'center',
    },
    modalMessage: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        lineHeight: 22,
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
    },
    cancelButton: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 16,
        backgroundColor: '#F5F5F5',
        borderRadius: 8,
        alignItems: 'center',
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    confirmButton: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 16,
        backgroundColor: '#FF3B30',
        borderRadius: 8,
        alignItems: 'center',
    },
    confirmButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: 'white',
    },
    disabledButton: {
        backgroundColor: '#FF6B6B',
        opacity: 0.7,
    },
    loadingContainer: {
        alignItems: 'center',
    },
});

export default Profile;
