import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Alert, Platform, useWindowDimensions} from 'react-native';
import {DrawerContentScrollView, DrawerItemList} from '@react-navigation/drawer';
import {Ionicons} from '@expo/vector-icons';
import * as StoreReview from 'expo-store-review';
import * as Linking from 'expo-linking';
import {AppLogoHeader} from "./ui/AppLogoHeader";
import {useTheme} from "../context/ThemeContext";


const CustomDrawerContent = (props) => {
    const [isLandscape, setIsLandscape] = useState(false);
    const {colors} = useTheme().theme;
    const handleRateApp = async () => {
        showRatingOptions();
    };

    const {width, height} = useWindowDimensions();

    useEffect(() => {
        setIsLandscape( (width > height) );
    }, [width, height]);

    const FooterItem = ({handlePress, icon, text}) => {
        const footerTextStyles = {
            color: colors.textSecondary,
            marginLeft: 12,
            fontSize: 16,
        }
        return (
            <TouchableOpacity
                style={styles.footerItem}
                onPress={handlePress}
            >
                <Ionicons name={icon} size={20} color={colors.textSecondary}/>
                <Text style={footerTextStyles}>{text}</Text>
            </TouchableOpacity>
        )
    }

    const showRatingOptions = () => {
        Alert.alert(
            'Rate Our App',
            'Help us improve by rating our app in the store!',
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Rate Now',
                    onPress: openStoreForReview,
                },
            ]
        );
    };

    const openStoreForReview = async () => {
        try {
            const storeUrl = StoreReview.storeUrl();
            if (storeUrl) {
                await Linking.openURL(storeUrl);
            } else {
                // Fallback URLs - replace with your actual app IDs
                const itunesItemId = process.env.EXPO_PUBLIC_APP_STORE_ID; // Replace with your iOS App Store ID
                const androidPackageName = process.env.EXPO_PUBLIC_PACKAGE_NAME; // Replace with your package name

                if (Platform.OS === 'ios') {
                    await Linking.openURL(`https://apps.apple.com/app/apple-store/id${itunesItemId}?action=write-review`);
                } else {
                    await Linking.openURL(`https://play.google.com/store/apps/details?id=${androidPackageName}&showAllReviews=true`);
                }
            }
        } catch (error) {
            console.error('Error opening store:', error);
            Alert.alert('Error', 'Unable to open the app store at this time.');
        }
    };

    const handleHelpSupport = () => {
        // Implement help & support functionality
        Alert.alert(
            'Help & Support',
            'How can we help you today?',
            [
                {
                    text: 'FAQ',
                    onPress: () => {
                        // Navigate to FAQ or open FAQ URL
                        console.log('Open FAQ');
                    },
                },
                {
                    text: 'Contact Us',
                    onPress: () => {
                        // Open email or contact form
                        Linking.openURL(`mailto:${process.env.EXPO_PUBLIC_FEEDBACK_EMAIL}`);
                    },
                },
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
            ]
        );
    };

    return (
        <View style={styles.container}>
            <View style={{backgroundColor: colors.primary}}>
                <AppLogoHeader/>
            </View>

            <DrawerContentScrollView {...props} style={styles.drawerContent}>
                <DrawerItemList {...props} />
            </DrawerContentScrollView>

            {!isLandscape && (
                <View style={styles.footer}>
                    <FooterItem icon={"help-circle-outline"} text={"Help & Support"} handlePress={handleHelpSupport}/>
                    <FooterItem icon={"star-outline"} text={"Rate App"} handlePress={handleRateApp}/>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    drawerContent: {
        flex: 1,
        paddingBottom: 20,
    },
    footer: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
    },
    footerItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
    }
});

export default CustomDrawerContent;
