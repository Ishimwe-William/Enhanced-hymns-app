import React, {createContext, useContext, useEffect, useState} from 'react';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import * as SecureStore from 'expo-secure-store';
import {GoogleAuthProvider, onAuthStateChanged, signInWithCredential, signOut} from 'firebase/auth';
import {auth} from '../config/firebaseConfig';

WebBrowser.maybeCompleteAuthSession();

const USER_KEY = 'authenticatedUser';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const [request, response, promptAsync] = Google.useAuthRequest({
        androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
        iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
        webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    });

    // Load user from secure store on mount
    useEffect(() => {
        const loadUserFromSecureStore = async () => {
            try {
                const storedUser = await SecureStore.getItemAsync(USER_KEY);
                if (storedUser) {
                    setUser(JSON.parse(storedUser));
                }
            } catch (error) {
                console.error('Error loading user from secure store:', error);
            } finally {
                setLoading(false);
            }
        };

        loadUserFromSecureStore();
    }, []);

    // Watch for Firebase auth changes
    useEffect(() => {
        return onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                const userData = {
                    uid: firebaseUser.uid,
                    email: firebaseUser.email,
                    displayName: firebaseUser.displayName,
                    photoURL: firebaseUser.photoURL,
                };

                setUser(userData);
                await SecureStore.setItemAsync(USER_KEY, JSON.stringify(userData));
            } else {
                setUser(null);
                await SecureStore.deleteItemAsync(USER_KEY);
            }
        });
    }, []);

    useEffect(() => {
        if (response?.type === 'success') {
            const { authentication } = response;
            handleFirebaseSignIn(authentication);
        }
    }, [response]);

    const handleFirebaseSignIn = async (authentication) => {
        try {
            setLoading(true);
            const credential = GoogleAuthProvider.credential(
                authentication.idToken,
                authentication.accessToken
            );
            const result = await signInWithCredential(auth, credential);
            // No need to set user here; it's handled by onAuthStateChanged
        } catch (error) {
            console.error('Sign-in error:', error);
            alert('Sign-in failed: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSignOut = async () => {
        try {
            await signOut(auth);
            await SecureStore.deleteItemAsync(USER_KEY);
            setUser(null);
        } catch (error) {
            console.error('Sign-out error:', error);
            alert('Sign-out failed: ' + error.message);
        }
    };

    return (
        <UserContext.Provider
            value={{
                user,
                loading,
                signIn: () => promptAsync(),
                signOut: handleSignOut,
            }}
        >
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => useContext(UserContext);
