import React, {createContext, useContext, useEffect, useState} from 'react';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import * as SecureStore from 'expo-secure-store';
import {GoogleAuthProvider, onAuthStateChanged, signInWithCredential, signOut} from 'firebase/auth';
import {auth} from '../config/firebaseConfig';

WebBrowser.maybeCompleteAuthSession();

const USER_KEY = 'authenticatedUser';
const USER_TOKEN_KEY = 'userAuthToken';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [authInitialized, setAuthInitialized] = useState(false);

    const [request, response, promptAsync] = Google.useAuthRequest({
        androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
        iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
        webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    });

    // Enhanced function to check if user session is still valid
    const checkUserSession = async () => {
        try {
            const storedUser = await SecureStore.getItemAsync(USER_KEY);
            const storedToken = await SecureStore.getItemAsync(USER_TOKEN_KEY);

            if (storedUser && storedToken) {
                const userData = JSON.parse(storedUser);

                // Check if the current Firebase user matches stored user
                if (auth.currentUser && auth.currentUser.uid === userData.uid) {
                    setUser(userData);
                    setIsAuthenticated(true);
                    return true;
                }
            }

            // Clear invalid session data
            await clearStoredUserData();
            return false;
        } catch (error) {
            console.error('Error checking user session:', error);
            await clearStoredUserData();
            return false;
        }
    };

    // Function to clear stored user data
    const clearStoredUserData = async () => {
        try {
            await SecureStore.deleteItemAsync(USER_KEY);
            await SecureStore.deleteItemAsync(USER_TOKEN_KEY);
            setUser(null);
            setIsAuthenticated(false);
        } catch (error) {
            console.error('Error clearing stored user data:', error);
        }
    };

    // Load user from secure store on mount with enhanced validation
    useEffect(() => {
        const initializeAuth = async () => {
            try {
                setLoading(true);

                // First check if there's a stored user session
                const hasValidSession = await checkUserSession();

                if (!hasValidSession) {
                    // Wait a bit for Firebase to initialize and check current user
                    setTimeout(async () => {
                        if (auth.currentUser) {
                            // If Firebase has a current user but no stored session, sync them
                            const firebaseUser = auth.currentUser;
                            const userData = {
                                uid: firebaseUser.uid,
                                email: firebaseUser.email,
                                displayName: firebaseUser.displayName,
                                photoURL: firebaseUser.photoURL,
                            };

                            setUser(userData);
                            setIsAuthenticated(true);
                            await SecureStore.setItemAsync(USER_KEY, JSON.stringify(userData));
                        }
                        setAuthInitialized(true);
                        setLoading(false);
                    }, 1000);
                } else {
                    setAuthInitialized(true);
                    setLoading(false);
                }
            } catch (error) {
                console.error('Error initializing auth:', error);
                setAuthInitialized(true);
                setLoading(false);
            }
        };

        initializeAuth();
    }, []);

    // Watch for Firebase auth changes with enhanced synchronization
    useEffect(() => {
        return onAuthStateChanged(auth, async (firebaseUser) => {
            try {
                if (firebaseUser) {
                    const userData = {
                        uid: firebaseUser.uid,
                        email: firebaseUser.email,
                        displayName: firebaseUser.displayName,
                        photoURL: firebaseUser.photoURL,
                        lastLogin: new Date().toISOString(),
                    };

                    setUser(userData);
                    setIsAuthenticated(true);

                    // Store user data and token info
                    await SecureStore.setItemAsync(USER_KEY, JSON.stringify(userData));

                    // Store auth token if available
                    const token = await firebaseUser.getIdToken();
                    if (token) {
                        await SecureStore.setItemAsync(USER_TOKEN_KEY, token);
                    }
                } else {
                    await clearStoredUserData();
                }
            } catch (error) {
                console.error('Error in auth state change:', error);
                await clearStoredUserData();
            } finally {
                if (authInitialized) {
                    setLoading(false);
                }
            }
        });
    }, [authInitialized]);

    // Handle Google sign-in response
    useEffect(() => {
        if (response?.type === 'success') {
            const { authentication } = response;
            handleFirebaseSignIn(authentication);
        } else if (response?.type === 'error') {
            console.error('Google sign-in error:', response.error);
            setLoading(false);
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
            // User state will be updated by onAuthStateChanged
        } catch (error) {
            console.error('Sign-in error:', error);
            alert('Sign-in failed: ' + error.message);
            setLoading(false);
        }
    };

    const handleSignOut = async () => {
        try {
            setLoading(true);
            await signOut(auth);
            await clearStoredUserData();
        } catch (error) {
            console.error('Sign-out error:', error);
            alert('Sign-out failed: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    // Function to manually refresh user session
    const refreshUserSession = async () => {
        if (auth.currentUser) {
            try {
                await auth.currentUser.reload();
                const token = await auth.currentUser.getIdToken(true); // Force refresh
                await SecureStore.setItemAsync(USER_TOKEN_KEY, token);
                return true;
            } catch (error) {
                console.error('Error refreshing user session:', error);
                return false;
            }
        }
        return false;
    };

    // Function to check if user is ready (not loading and auth is initialized)
    const isUserReady = () => {
        return !loading && authInitialized;
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
