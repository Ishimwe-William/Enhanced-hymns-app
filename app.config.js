import 'dotenv/config';

export default ({ config }) => {
    return {
        ...config,
        name: "Indirimbo Zo Guhimbaza Imana",
        slug: "hymns-app",
        description: "An app for accessing and singing hymns in Kinyarwanda.",
        version: process.env.EXPO_PUBLIC_APP_VERSION,
        backgroundColor: "#ffffff",
        userInterfaceStyle: "automatic",
        icon: "./assets/icon.png",
        splash: {
            image: "./assets/icon.png",
            resizeMode: "native",
            backgroundColor: "#ffffff",
        },
        assetBundlePatterns: ["**/*"],
        scheme: "com.bunsenplus.hymnsapp",
        android: {
            permissions: [
                "WAKE_LOCK",
                "android.permission.RECORD_AUDIO",
                "android.permission.MODIFY_AUDIO_SETTINGS",
                "android.permission.FOREGROUND_SERVICE",
                "android.permission.FOREGROUND_SERVICE_MEDIA_PLAYBACK"
            ],
            package: "com.bunsenplus.hymnsapp",
            icon: "./assets/icon.png",
            adaptiveIcon: {
                foregroundImage: "./assets/adaptive-icon.png",
                backgroundColor: "#ffffff",
            },
            versionCode: process.env.EXPO_PUBLIC_ANDROID_VERSION_CODE,
        },
        ios: {
            supportsTablet: true,
            bundleIdentifier: "com.bunsenplus.hymnsapp",
            icon: "./assets/icon.png",
        },
        extra: {
            eas: {
                projectId: "d7cb8427-b88f-40f9-a885-1ef8431ba4ff",
            },
            // Environment variables
            EXPO_PUBLIC_FIREBASE_API_KEY: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
            EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
            EXPO_PUBLIC_FIREBASE_PROJECT_ID: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
            EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
            EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
            EXPO_PUBLIC_FIREBASE_APP_ID: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
            EXPO_PUBLIC_MEASUREMENT_ID: process.env.EXPO_PUBLIC_MEASUREMENT_ID,

            EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
            EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
            EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,

            EXPO_PUBLIC_FEEDBACK_EMAIL: process.env.EXPO_PUBLIC_FEEDBACK_EMAIL,
            EXPO_PUBLIC_PACKAGE_NAME: process.env.EXPO_PUBLIC_PACKAGE_NAME,
            EXPO_PUBLIC_GOOGLE_PLAY_ID: process.env.EXPO_PUBLIC_GOOGLE_PLAY_ID,

            EXPO_PUBLIC_APP_NAME: process.env.EXPO_PUBLIC_APP_NAME,
            EXPO_PUBLIC_APP_VERSION: process.env.EXPO_PUBLIC_APP_VERSION,
            EXPO_PUBLIC_APP_DEV: process.env.EXPO_PUBLIC_APP_DEV,
            EXPO_PUBLIC_ANDROID_VERSION_CODE: process.env.EXPO_PUBLIC_ANDROID_VERSION_CODE,
        },
        plugins: ["expo-secure-store", "expo-sqlite"],
    };
};
