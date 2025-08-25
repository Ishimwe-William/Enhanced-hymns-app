import React from 'react';
import {View, Text, StyleSheet, ScrollView, Linking} from 'react-native';
import {useNavigation, DrawerActions} from '@react-navigation/native';
import Header from '../components/ui/Header';
import {AppLogoHeader} from "../components/ui/AppLogoHeader";
import {Paragraph} from "../components/about/Paragraph";
import {Feature} from "../components/about/Feature";
import {MyConstants} from "../utils/constants";
import {ConnectIcon} from "../components/about/ConnectIcon";
import {useTheme} from "../context/ThemeContext";
import Constants from "expo-constants";

const AboutScreen = () => {
    const navigation = useNavigation();
    const {colors} = useTheme().theme;

    const handleMenuPress = () => {
        navigation.dispatch(DrawerActions.openDrawer());
    };

    const handleBack = () => {
        navigation.goBack();
    };

    const openLink = (url) => {
        Linking.openURL(url).catch((err) => console.error('Error opening link:', err));
    };

    const styles = StyleSheet.create({
        container: {
            flex: 1,
        },
        scrollContent: {
            flex: 1,
            padding: 20,
            backgroundColor: colors.card,
        },
        section: {
            marginBottom: 24,
        },
        connect: {
            flexDirection: "row",
            justifyContent: "space-around",
            marginBottom: 24,
        },
        version: {
            fontSize: 16,
            color: '#666',
            textAlign: 'center',
        },
        copyright: {
            fontSize: 14,
            color: '#999',
            textAlign: 'center',
            fontStyle: 'italic',
        },
    });

    return (
        <View style={styles.container}>
            <Header
                title="About"
                showMenu
                onBack={handleBack}
                onMenu={handleMenuPress}
                showMore={false}
            />
            <ScrollView style={styles.scrollContent}>
                <AppLogoHeader/>
                <Paragraph title={"About This App"}>
                    <Text>
                        Hymns Collection is a comprehensive digital hymnal that brings together
                        traditional and contemporary Christian hymns. Our mission is to provide
                        easy access to sacred music for worship, personal devotion, and community singing.
                    </Text>
                </Paragraph>

                <Paragraph title={"Features"} style={{marginBottom: -15}}/>
                <Feature icon={"book-music"} title={"Hymn Collection"}>
                    <Text>Browse hundreds of hymns</Text>
                </Feature>
                <Feature icon={"magnify"} title={"Search Functionality"}>
                    <Text>Easily find hymns by title, number, or lyrics</Text>
                </Feature>
                <Feature icon={"cards-heart"} title={"Favorites"}>
                    <Text>Save your favorite hymns for quick access</Text>
                </Feature>
                <Feature icon={"wifi-off"} title={"Offline Access"}>
                    <Text>Use the app without requiring an internet connection</Text>
                </Feature>

                <Paragraph title={"Project Background"}>
                    <Text>
                        This application was developed as a hobby project to practice React Native
                        mobile development skills. The app aims to preserve and promote Rwandan spiritual music heritage
                        by making
                        these hymns easily accessible in digital format.
                    </Text>
                </Paragraph>
                <Paragraph title={"Connect & Contact"} style={{marginBottom: -15}}/>
                <View style={styles.connect}>
                    <ConnectIcon name={"Github"} icon={"github"}
                                 onPress={() => openLink('https://github.com/Ishimwe-William')}
                    />
                    <ConnectIcon name={"LinkedIn"} icon={"linkedin"}
                                 onPress={() => openLink('https://www.linkedin.com/in/ishimwe-william-086776192/')}

                    />
                    <ConnectIcon name={"Email"} icon={"email"}
                                 onPress={() => Linking.openURL(`mailto:${Constants.expoConfig.extra.EXPO_PUBLIC_FEEDBACK_EMAIL}`)}
                    />
                </View>
                <View style={styles.section}>
                    <Text style={styles.version}>
                        App Version {MyConstants.AppVersion}.
                    </Text>
                    <Text style={styles.copyright}>
                        © {new Date().getFullYear()} {MyConstants.AppDev}.
                    </Text>
                </View>
            </ScrollView>
        </View>
    );
};


export default AboutScreen;
