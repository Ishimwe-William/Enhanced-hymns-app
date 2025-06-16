import React, {createContext, useContext, useEffect, useState, useRef} from 'react';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import AsyncStorage from "@react-native-async-storage/async-storage";
import {GoogleAuthProvider, getAuth, onAuthStateChanged, signInWithCredential, signOut} from 'firebase/auth';
import {auth} from '../config/firebaseConfig';
import Constants from "expo-constants";
import {deletePreferencesFromDB} from "../services/preferencesServiceSQLite";

WebBrowser.maybeCompleteAuthSession();

const USER_KEY = 'authenticatedUser';
const USER_TOKEN_KEY = 'userAuthToken';

const UserContext = createContext();

export const UserProvider = ({children}) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [authInitialized, setAuthInitialized] = useState(false);
    const hasInitializedAuth = useRef(false);

    const [request, response, promptAsync] = Google.useAuthRequest({
        androidClientId: Constants.expoConfig.extra.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
        iosClientId: Constants.expoConfig.extra.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
        webClientId: Constants.expoConfig.extra.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    });

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            setUser(firebaseUser);
            setIsAuthenticated(!!firebaseUser);
            if (!hasInitializedAuth.current) {
                setAuthInitialized(true);
                setLoading(false);
                hasInitializedAuth.current = true;
            }
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (response?.type === 'success') {
            setLoading(true);
            const {idToken, accessToken} = response.authentication;
            const auth = getAuth();

            const credential = GoogleAuthProvider.credential(idToken, accessToken);

            signInWithCredential(auth, credential)
                .then((userCredential) => {
                    const user = userCredential.user;
                    AsyncStorage.setItem('user', JSON.stringify({
                        uid: user.uid,
                        email: user.email,
                        name: user.displayName,
                        photo: user.photoURL
                    }));
                    setLoading(false);
                })
                .catch((error) => {
                    console.error("Error signing in to Firebase with Google credential:", error);
                    setLoading(false);
                });
        }
    }, [response]);

    const handleSignOut = async () => {
        try {
            setLoading(true);
            await signOut(auth);
            await clearStoredUserData();
            await deletePreferencesFromDB(user.uid);
        } catch (error) {
            console.error('Sign-out error:', error);
            alert('Sign-out failed: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const refreshUserSession = async () => {
        if (auth.currentUser) {
            try {
                await auth.currentUser.reload();
                const token = await auth.currentUser.getIdToken(true);
                await AsyncStorage.setItem(USER_TOKEN_KEY, token);
                return true;
            } catch (error) {
                console.error('Error refreshing user session:', error);
                return false;
            }
        }
        return false;
    };

    const isUserReady = () => {
        return !loading && authInitialized;
    };

    const checkUserSession = async () => {
        try {
            const storedUser = await AsyncStorage.getItem(USER_KEY);
            const storedToken = await AsyncStorage.getItem(USER_TOKEN_KEY);

            if (storedUser && storedToken) {
                const userData = JSON.parse(storedUser);

                if (auth.currentUser && auth.currentUser.uid === userData.uid) {
                    setUser(userData);
                    setIsAuthenticated(true);
                    return true;
                }
            }

            await clearStoredUserData();
            return false;
        } catch (error) {
            console.error('Error checking user session:', error);
            await clearStoredUserData();
            return false;
        }
    };

    const clearStoredUserData = async () => {
        try {
            await AsyncStorage.removeItem(USER_KEY);
            await AsyncStorage.removeItem(USER_TOKEN_KEY);
            setUser(null);
            setIsAuthenticated(false);
        } catch (error) {
            console.error('Error clearing stored user data:', error);
        }
    };

    return (
        <UserContext.Provider
            value={{
                user,
                loading,
                isAuthenticated,
                authInitialized,
                signIn: () => promptAsync(),
                signOut: handleSignOut,
                refreshUserSession,
                isUserReady,
                checkUserSession,
            }}
        >
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
};
