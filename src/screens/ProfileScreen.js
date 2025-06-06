import React, {useState} from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Image,
    ScrollView,
    Alert,
} from 'react-native';
import {useUser} from '../context/UserContext';
import Header from "../components/ui/Header";
import {DrawerActions, useNavigation} from "@react-navigation/native";
import LoadingScreen from "../components/LoadingScreen";
import {Ionicons} from '@expo/vector-icons';
import {ListItem} from "../components/ui/ListItem";
import {useTheme} from "../context/ThemeContext";
import {SignInCard} from "../components/profile/SignInCard";
import {LogoutModal} from "../components/profile/LogoutModal";

const Profile = () => {
    const {user, loading, signIn, signOut} = useUser();
    const navigation = useNavigation();
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [signingOut, setSigningOut] = useState(false);
    const {colors} = useTheme().theme;

    if (loading) {
        return <LoadingScreen message="Loading profile..."/>;
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
                [{text: "OK", style: "default"}]
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
                [{text: "OK", style: "default"}]
            );
        } catch (error) {
            console.error('Logout error:', error);
            Alert.alert(
                "Error",
                "Failed to sign out. Please try again.",
                [{text: "OK", style: "default"}]
            );
        } finally {
            setSigningOut(false);
        }
    };

    const handleCancelLogout = () => {
        setShowLogoutModal(false);
    };

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.card,
        },
        content: {
            flex: 1,
        },
        profileContent: {
            flex: 1,
        },
        profileSubtitle: {
            fontSize: 14,
            color: colors.textSecondary,
            marginTop: 2,
        },
        userHeaderContainer: {
            backgroundColor: colors.primary,
            alignItems: 'center',
            paddingVertical: 32,
            marginBottom: 16,
            margin: 12,
            borderRadius: 12,
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
            color: colors.text,
            marginBottom: 4,
        },
        userEmail: {
            fontSize: 16,
            color: colors.textSecondary,
        },
        section: {
            marginTop: 32,
            marginHorizontal: 16,
        },
        sectionTitle: {
            fontSize: 14,
            fontWeight: '600',
            color: colors.textSecondary,
            marginBottom: 8,
            marginLeft: 16,
            textTransform: 'uppercase',
            letterSpacing: 0.5,
        },
        signOutItem: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: colors.primary,
            padding: 16,
            borderRadius: 8,
            marginVertical: 10,
        },
        signOutIcon: {
            width: 32,
            height: 32,
            borderRadius: 6,
            backgroundColor: colors.card,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 12,
        },
        signOutTitle: {
            fontSize: 16,
            fontWeight: '500',
            color: '#FF3B30',
        },
    });


    return (
        <View style={styles.container}>
            <Header
                title="Profile"
                showMenu
                onBack={handleBack}
                onMenu={handleMenuPress}
                showMore={false}
            />

            <ScrollView style={styles.content}>
                {user ? (
                    <>
                        {/* User Profile Header */}
                        <View style={styles.userHeaderContainer}>
                            <View style={styles.avatarContainer}>
                                {user.photoURL ? (
                                    <Image source={{uri: user.photoURL}} style={styles.profileImage}/>
                                ) : (
                                    <View style={styles.defaultAvatar}>
                                        <Ionicons name="person" size={40} color="#007AFF"/>
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
                                onPress={() => {
                                }}
                            />
                            <ListItem
                                icon="mail-outline"
                                title="Email"
                                subtitle={user.email}
                                onPress={() => {
                                }}
                            />
                        </View>

                        {/* Account Actions Section */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Account Actions</Text>
                            <ListItem
                                icon="chatbubble-outline"
                                title="View Feedback"
                                subtitle="View your feedback and suggestions"
                                onPress={() => {
                                }}
                            />
                            <ListItem
                                icon="shield-checkmark-outline"
                                title="Privacy Settings"
                                subtitle="Manage your privacy preferences"
                                onPress={() => {
                                }}
                            />
                            <TouchableOpacity style={styles.signOutItem} onPress={handleShowLogoutModal}>
                                <View style={styles.signOutIcon}>
                                    <Ionicons name="log-out-outline" size={22} color="#FF3B30"/>
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
                        <SignInCard onSignIn={signIn}/>
                    </View>
                )}
            </ScrollView>

            {/* Logout Modal */}
            <LogoutModal
                handleCancelLogout={handleCancelLogout}
                handleConfirmLogout={handleConfirmLogout}
                showLogoutModal={showLogoutModal}
                signingOut={signingOut}
            />
        </View>
    );
}

export default Profile;
