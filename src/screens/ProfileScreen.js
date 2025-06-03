import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet, Image, ScrollView} from 'react-native';
import {useUser} from '../context/UserContext';
import Header from "../components/ui/Header";
import {DrawerActions, useNavigation} from "@react-navigation/native";
import LoadingScreen from "../components/LoadingScreen";
import { Ionicons } from '@expo/vector-icons';

const ProfileScreen = () => {
    const {user, loading, signIn, signOut} = useUser();
    const navigation = useNavigation();

    if (loading) {
        return <LoadingScreen message="Loading profile..." />;
    }

    const handleMenuPress = () => {
        navigation.dispatch(DrawerActions.openDrawer());
    };

    const handleBack = () => {
        navigation.goBack();
    };

    const showLogoutModal = () => {
        // Implement your logout modal logic here
        console.log("Show logout modal");
    }

    const ProfileItem = ({ icon, title, subtitle, onPress, rightElement }) => (
        <TouchableOpacity style={styles.profileItem} onPress={onPress}>
            <View style={styles.profileIcon}>
                <Ionicons name={icon} size={22} color="#007AFF" />
            </View>
            <View style={styles.profileContent}>
                <Text style={styles.profileTitle}>{title}</Text>
                {subtitle && <Text style={styles.profileSubtitle}>{subtitle}</Text>}
            </View>
            {rightElement || <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />}
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <Header
                title="Profile"
                showMenu
                onBack={handleBack}
                onMenu={handleMenuPress}
                onMore={showLogoutModal}
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
                            <ProfileItem
                                icon="person-outline"
                                title="Display Name"
                                subtitle={user.displayName || 'Not set'}
                                onPress={() => {}}
                            />
                            <ProfileItem
                                icon="mail-outline"
                                title="Email"
                                subtitle={user.email}
                                onPress={() => {}}
                            />
                            <ProfileItem
                                icon="key-outline"
                                title="User ID"
                                subtitle={user.uid}
                                onPress={() => {}}
                            />
                        </View>

                        {/* Account Actions Section */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Account Actions</Text>
                            <ProfileItem
                                icon="create-outline"
                                title="Edit Profile"
                                subtitle="Update your profile information"
                                onPress={() => {}}
                            />
                            <ProfileItem
                                icon="shield-checkmark-outline"
                                title="Privacy Settings"
                                subtitle="Manage your privacy preferences"
                                onPress={() => {}}
                            />
                            <TouchableOpacity style={styles.signOutItem} onPress={signOut}>
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
    profileItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        padding: 16,
        marginBottom: 1,
    },
    profileIcon: {
        width: 32,
        height: 32,
        borderRadius: 6,
        backgroundColor: '#F0F8FF',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    profileContent: {
        flex: 1,
    },
    profileTitle: {
        fontSize: 16,
        fontWeight: '500',
        color: '#333',
    },
    profileSubtitle: {
        fontSize: 14,
        color: '#666',
        marginTop: 2,
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
});

export default ProfileScreen;
