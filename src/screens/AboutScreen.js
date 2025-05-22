import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useNavigation, DrawerActions } from '@react-navigation/native';
import Header from '../components/ui/Header';

const AboutScreen = () => {
    const navigation = useNavigation();

    const handleMenuPress = () => {
        navigation.dispatch(DrawerActions.openDrawer());
    };

    const handleBack = () => {
        navigation.goBack();
    };

    return (
        <View style={styles.container}>
            <Header
                title="About"
                showMenu
                onBack={handleBack}
                onMenu={handleMenuPress}
            />
            <ScrollView style={styles.content}>
                <View style={styles.section}>
                    <Text style={styles.appName}>Hymns Collection</Text>
                    <Text style={styles.version}>Version 1.0.0</Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>About This App</Text>
                    <Text style={styles.description}>
                        Hymns Collection is a comprehensive digital hymnal that brings together
                        traditional and contemporary Christian hymns. Our mission is to provide
                        easy access to sacred music for worship, personal devotion, and community singing.
                    </Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Features</Text>
                    <Text style={styles.feature}>• Browse hundreds of hymns</Text>
                    <Text style={styles.feature}>• Search by title, number, or author</Text>
                    <Text style={styles.feature}>• Organize favorites</Text>
                    <Text style={styles.feature}>• View recent hymns</Text>
                    <Text style={styles.feature}>• Offline access</Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.copyright}>
                        © 2024 Hymns Collection. All rights reserved.
                    </Text>
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    content: {
        flex: 1,
        padding: 20,
    },
    section: {
        marginBottom: 24,
    },
    appName: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'center',
        marginBottom: 8,
    },
    version: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginBottom: 12,
    },
    description: {
        fontSize: 16,
        lineHeight: 24,
        color: '#666',
    },
    feature: {
        fontSize: 16,
        color: '#666',
        marginBottom: 4,
    },
    copyright: {
        fontSize: 14,
        color: '#999',
        textAlign: 'center',
        fontStyle: 'italic',
    },
});

export default AboutScreen;
