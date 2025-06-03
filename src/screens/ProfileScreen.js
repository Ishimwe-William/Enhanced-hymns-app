import React from 'react';
import {View, Text, Button, StyleSheet, Image} from 'react-native';
import {useUser} from '../context/UserContext';
import Header from "../components/ui/Header";
import {DrawerActions, useNavigation} from "@react-navigation/native";
import LoadingScreen from "../components/LoadingScreen";

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


    return (
        <View style={styles.container}>
            <Header
                title="Profile"
                showMenu
                onBack={handleBack}
                onMenu={handleMenuPress}
                onMore={showLogoutModal}
            />
            {user ? (
                <View style={styles.userContainer}>
                    {user.photoURL && (
                        <Image source={{ uri: user.photoURL }} style={styles.profileImage} />
                    )}
                    <Text style={styles.welcomeText}>Welcome!</Text>
                    <Text style={styles.userInfo}>Email: {user.email}</Text>
                    <Text style={styles.userInfo}>Name: {user.displayName}</Text>
                    <Text style={styles.userInfo}>UID: {user.uid}</Text>
                    <Button title="Sign Out" onPress={signOut}/>
                </View>
            ) : (
                <View style={styles.signInContainer}>
                    <Text style={styles.title}>Please sign in</Text>
                    <Button title="Sign in with Google" onPress={signIn}/>
                </View>
            )}
        </View>
    );
}

export default ProfileScreen;


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    profileImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginBottom: 15,
    },
    userContainer:
        {alignItems: 'center'},
    signInContainer:
        {alignItems: 'center'},
    title:
        {fontSize: 18, marginBottom: 20},
    welcomeText:
        {fontSize: 20, fontWeight: 'bold', marginBottom: 20},
    userInfo:
        {fontSize: 14, marginBottom: 10, textAlign: 'center'},
});
