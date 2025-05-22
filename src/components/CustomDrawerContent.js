import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {DrawerContentScrollView, DrawerItemList} from '@react-navigation/drawer';
import {Ionicons} from '@expo/vector-icons';

const CustomDrawerContent = (props) => {
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.profileSection}>
                    <View style={styles.avatar}>
                        <Ionicons name="musical-notes" size={32} color="white"/>
                    </View>
                    <Text style={styles.appName}>Hymns Collection</Text>
                    <Text style={styles.subtitle}>Sacred Music Library</Text>
                </View>
            </View>

            <DrawerContentScrollView {...props} style={styles.drawerContent}>
                <DrawerItemList {...props} />
            </DrawerContentScrollView>

            <View style={styles.footer}>
                <TouchableOpacity style={styles.footerItem}>
                    <Ionicons name="help-circle-outline" size={20} color="#666"/>
                    <Text style={styles.footerText}>Help & Support</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.footerItem}>
                    <Ionicons name="star-outline" size={20} color="#666"/>
                    <Text style={styles.footerText}>Rate App</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        backgroundColor: '#007AFF',
        paddingTop: 20,
        paddingBottom: 20,
        paddingHorizontal: 20,
    },
    profileSection: {
        alignItems: 'center',
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    appName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.8)',
    },
    drawerContent: {
        flex: 1,
        paddingBottom: 20,
    },
    footer: {
        paddingHorizontal: 20,
        paddingVertical: 20,
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
    },
    footerItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
    },
    footerText: {
        marginLeft: 12,
        fontSize: 16,
        color: '#666',
    },
});

export default CustomDrawerContent;
