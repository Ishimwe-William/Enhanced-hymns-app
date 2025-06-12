"C:\Program Files\Java\jdk-22\bin\keytool.exe" -list -v -keystore "%USERPROFILE%\.android\debug.keystore" -alias androiddebugkey -storepass android -keypass android

# Google Firebase Authentication Setup Guide

A comprehensive guide to implementing Google Sign-In with Firebase Authentication in React Native/Expo apps.

## Prerequisites

- Node.js and npm/yarn installed
- Expo CLI installed (`npm install -g @expo/cli`)
- Google Cloud Console account
- Firebase Console account
- Android Studio (for development builds)

## Table of Contents

1. [Installation](#installation)
2. [Firebase Project Setup](#firebase-project-setup)
3. [Google Cloud Console Setup](#google-cloud-console-setup)
4. [Environment Configuration](#environment-configuration)
5. [App Configuration](#app-configuration)
6. [Code Implementation](#code-implementation)
7. [Building and Testing](#building-and-testing)
8. [Troubleshooting](#troubleshooting)

## Installation

Install the required dependencies:

```bash
npm install firebase expo-auth-session expo-web-browser
# or
yarn add firebase expo-auth-session expo-web-browser
```

## Firebase Project Setup

### 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Enter your project name (e.g., "Hymns App")
4. Enable Google Analytics (optional)
5. Click "Create project"

### 2. Enable Authentication

1. In your Firebase project, go to **Authentication** → **Sign-in method**
2. Click on **Google** provider
3. Toggle **Enable**
4. Set your project's public-facing name
5. Choose a support email
6. Click **Save**

### 3. Get Firebase Configuration

1. Go to **Project Settings** (gear icon) → **General**
2. Scroll down to "Your apps"
3. Click **Add app** → **Web** (</> icon)
4. Register your app with a nickname
5. Copy the Firebase configuration object

## Google Cloud Console Setup

### 1. Create OAuth 2.0 Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project (should be auto-created by Firebase)
3. Navigate to **APIs & Credentials** → **Credentials**
4. Click **Create Credentials** → **OAuth 2.0 Client ID**

### 2. Create Web Client ID

1. **Application type**: Web application
2. **Name**: "Web client for [Your App Name]"
3. **Authorized redirect URIs**: Leave empty for now
4. Click **Create**
5. **Copy the Client ID** (you'll need this)

### 3. Create Android Client ID

1. Click **Create Credentials** → **OAuth 2.0 Client ID** again
2. **Application type**: Android
3. **Name**: "Android client for [Your App Name]"
4. **Package name**: Your app's package name (e.g., `com.bunsenplus.hymnsapp`)
5. **SHA-1 certificate fingerprint**: Get this from your keystore

#### Getting SHA-1 Fingerprint

For development builds:
```bash
# Get your development keystore SHA-1
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
```

For EAS builds:
```bash
# If using EAS Build
eas credentials
```

6. **IMPORTANT**: Check the "Enable custom URI scheme" checkbox
    - This is essential for Android OAuth to work
    - Note: It may take 5 minutes to a few hours for settings to take effect
7. Click **Create**
8. **Copy the Android Client ID**

### 4. Create iOS Client ID (if targeting iOS)

1. **Application type**: iOS
2. **Name**: "iOS client for [Your App Name]"
3. **Bundle ID**: Your iOS bundle identifier (e.g., `com.bunsenplus.hymnsapp`)
4. Click **Create**
5. **Copy the iOS Client ID**

## Environment Configuration

Create a `.env` file in your project root:

```env
# Firebase Configuration
EXPO_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id

# Google OAuth Client IDs
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=your_web_client_id
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=your_android_client_id
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=your_ios_client_id
```

## App Configuration

Update your `app.json` or `app.config.js`:

```json
{
  "expo": {
    "name": "Your App Name",
    "slug": "your-app-slug",
    "version": "1.0.0",
    "scheme": "yourappscheme",
    "android": {
      "package": "com.yourcompany.yourapp"
    },
    "ios": {
      "bundleIdentifier": "com.yourcompany.yourapp"
    },
    "extra": {
      "eas": {
        "projectId": "your-eas-project-id"
      }
    }
  }
}
```
## metro.config.js updates

```javascript
// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);
config.resolver.sourceExts.push('cjs');
config.resolver.unstable_enablePackageExports = false;

module.exports = config;
```

**Important**: The `scheme` must be lowercase and follow the pattern `^[a-z][a-z0-9+.-]*$`

## Code Implementation

### 1. Create the Authentication Component

Create a file `Login.js` (or `.tsx` for TypeScript):

```javascript
import React, { useEffect, useState } from 'react';
import { Button, View, Text, StyleSheet, Alert } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { initializeApp } from 'firebase/app';
import {
    getAuth,
    GoogleAuthProvider,
    signInWithCredential,
    signOut,
    onAuthStateChanged
} from 'firebase/auth';

// Firebase configuration
const firebaseConfig = {
    apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

WebBrowser.maybeCompleteAuthSession();

export default function Login() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const [request, response, promptAsync] = Google.useAuthRequest({
        androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
        iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
        webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    });

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (response?.type === 'success') {
            const { authentication } = response;
            handleFirebaseSignIn(authentication);
        } else if (response?.type === 'error') {
            console.error('Google sign-in error:', response.error);
            Alert.alert('Sign-in Error', response.error?.message || 'Unknown error occurred');
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
            console.log('Firebase sign-in successful:', result.user.email);
        } catch (error) {
            console.error('Firebase sign-in error:', error);
            Alert.alert('Authentication Error', error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSignOut = async () => {
        try {
            await signOut(auth);
            console.log('User signed out successfully');
        } catch (error) {
            console.error('Sign-out error:', error);
            Alert.alert('Sign-out Error', error.message);
        }
    };

    const handleGoogleSignIn = async () => {
        try {
            await promptAsync();
        } catch (error) {
            console.error('Error initiating Google sign-in:', error);
            Alert.alert('Error', 'Failed to start sign-in process');
        }
    };

    if (loading) {
        return (
            <View style={styles.container}>
                <Text>Loading...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {user ? (
                <View style={styles.userContainer}>
                    <Text style={styles.welcomeText}>Welcome!</Text>
                    <Text style={styles.userInfo}>Email: {user.email}</Text>
                    <Text style={styles.userInfo}>Name: {user.displayName}</Text>
                    <Button title="Sign Out" onPress={handleSignOut} />
                </View>
            ) : (
                <View style={styles.signInContainer}>
                    <Text style={styles.title}>Please sign in</Text>
                    <Button
                        title="Sign in with Google"
                        onPress={handleGoogleSignIn}
                        disabled={!request}
                    />
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    userContainer: {
        alignItems: 'center',
    },
    signInContainer: {
        alignItems: 'center',
    },
    title: {
        fontSize: 18,
        marginBottom: 20,
    },
    welcomeText: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    userInfo: {
        fontSize: 14,
        marginBottom: 10,
        textAlign: 'center',
    },
});
```

### 2. Environment Variables Validation (Optional)

Add this helper to validate your environment setup:

```javascript
const validateEnvVars = () => {
    const requiredVars = [
        'EXPO_PUBLIC_FIREBASE_API_KEY',
        'EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN',
        'EXPO_PUBLIC_FIREBASE_PROJECT_ID',
        'EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID',
        'EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID'
    ];
    
    const missing = requiredVars.filter(varName => !process.env[varName]);
    if (missing.length > 0) {
        console.warn('Missing environment variables:', missing);
        return false;
    }
    return true;
};

// Call this in your component
useEffect(() => {
    if (!validateEnvVars()) {
        Alert.alert('Configuration Error', 'Please check your environment variables');
    }
}, []);
```

## Building and Testing

### 1. Development Build (Required for OAuth)

**Important**: Google OAuth requires a development build. It won't work with Expo Go.

Install EAS CLI:
```bash
npm install -g eas-cli
```

Login to Expo:
```bash
eas login
```

Create development build:
```bash
# For Android
eas build --profile development --platform android

# For iOS
eas build --profile development --platform ios
```

### 2. Install Development Build

Download and install the generated APK/IPA on your device.

### 3. Test Authentication

1. Open your app on the device
2. Tap "Sign in with Google"
3. Complete the Google sign-in flow
4. Verify the user information displays correctly
5. Test sign-out functionality

## Troubleshooting

### Common Issues

#### 1. "Custom URI scheme is not enabled" Error

**Cause**: Android OAuth client not properly configured or using Expo Go

**Solutions**:
- **Enable custom URI scheme** in Google Cloud Console (Android OAuth client settings)
- Ensure SHA-1 fingerprint is added to Google Cloud Console
- Use development build instead of Expo Go
- Verify package name matches exactly
- **Wait 5 minutes to a few hours** after enabling custom URI scheme

#### 2. "Invalid scheme" Error

**Cause**: Scheme doesn't follow the required pattern

**Solution**: Ensure scheme is lowercase and matches `^[a-z][a-z0-9+.-]*$`

#### 3. Firebase Configuration Errors

**Cause**: Missing or incorrect environment variables

**Solutions**:
- Double-check all environment variables
- Ensure no extra spaces in `.env` file
- Restart development server after changing `.env`

#### 4. "Web client ID is required" Error

**Cause**: Missing web client ID in Google configuration

**Solution**: Ensure `webClientId` is set in `Google.useAuthRequest()`

### Debug Tips

1. **Enable console logging**:
   ```javascript
   console.log('Environment check:', {
     android: !!process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
     web: !!process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
     firebase: !!process.env.EXPO_PUBLIC_FIREBASE_API_KEY
   });
   ```

2. **Check network requests** in development tools

3. **Verify Google Cloud Console settings** match your app configuration

4. **Test on physical device** - emulators may have networking issues

## Security Considerations

1. **Environment Variables**: Never commit `.env` files to version control
2. **Firebase Security Rules**: Configure appropriate Firestore/Realtime Database rules
3. **Token Handling**: Firebase handles token refresh automatically
4. **Client ID Protection**: Android/iOS client IDs can be public, but keep web client secret secure

## Additional Features

### User Profile Creation

```javascript
import { doc, setDoc, getFirestore } from 'firebase/firestore';

const db = getFirestore(app);

const createUserProfile = async (user) => {
    const userRef = doc(db, 'users', user.uid);
    await setDoc(userRef, {
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        createdAt: new Date(),
        lastLoginAt: new Date()
    }, { merge: true });
};
```

### Firestore Security Rules
```javascript
   // firestore.rules
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /users/{userId} {
         allow read, write: if request.auth != null && request.auth.uid == userId;
       }
     }
   }
```

## Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Expo Auth Session Documentation](https://docs.expo.dev/guides/authentication/)
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [React Native Firebase](https://rnfirebase.io/)

## Support

If you encounter issues:

1. Check the [Expo Forums](https://forums.expo.dev/)
2. Review [Firebase Support](https://firebase.google.com/support)
3. Search [Stack Overflow](https://stackoverflow.com/) for similar issues
4. Check Google Cloud Console logs for detailed error messages

---

**Note**: This guide assumes you're using Expo SDK 49+ and Firebase v9+. For older versions, some APIs may differ.


1. Create a release keystore (if you haven't already)
```bash
cd android/app
keytool -genkeypair -v -storetype PKCS12 -keystore my-upload-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000
```

   Follow the prompts to set up your keystore. Make sure to remember the passwords and alias you set.

2. Configure release signing
   Edit android/gradle.properties:
```properties
   propertiesMYAPP_UPLOAD_STORE_FILE=my-upload-key.keystore
   MYAPP_UPLOAD_KEY_ALIAS=my-key-alias
   MYAPP_UPLOAD_STORE_PASSWORD=your_keystore_password
   MYAPP_UPLOAD_KEY_PASSWORD=your_key_password
```
3. Update android/app/build.gradle
```groovy
   gradleandroid {
       signingConfigs {
           debug {
               storeFile file('debug.keystore')
               storePassword 'android'
               keyAlias 'androiddebugkey'
               keyPassword 'android'
           }
           release {
               if (project.hasProperty('MYAPP_UPLOAD_STORE_FILE')) {
                   storeFile file(MYAPP_UPLOAD_STORE_FILE)
                   storePassword MYAPP_UPLOAD_STORE_PASSWORD
                   keyAlias MYAPP_UPLOAD_KEY_ALIAS
                   keyPassword MYAPP_UPLOAD_KEY_PASSWORD
               }
           }
       }
       buildTypes {
           debug {
               signingConfig signingConfigs.debug
           }
           release {
               signingConfig signingConfigs.release
               minifyEnabled false
               proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
           }
       }
   }
```

4. Clean and rebuild
```bash
cd android
   ./gradlew clean
   ./gradlew bundleRelease
   ```
5. Verify the AAB
   The new AAB should be at:
```
   android/app/build/outputs/bundle/release/app-release.aab
```
