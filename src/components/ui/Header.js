import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import {Colors} from "../../utils/colors";

const Header = ({title, showBack, showRefresh, showMenu, onBack, onRefresh, onMenu}) => {
    return (
        <View style={styles.header}>
            <View style={styles.leftSection}>
                {showMenu && (
                    <TouchableOpacity style={styles.iconButton} onPress={onMenu}>
                        <Ionicons name="menu" size={24} color="white"/>
                    </TouchableOpacity>
                )}
                {showBack && (
                    <TouchableOpacity style={styles.backButton} onPress={onBack}>
                        <Ionicons name="arrow-back" size={24} color="white"/>
                    </TouchableOpacity>
                )}
            </View>

            <Text ellipsizeMode='tail' numberOfLines={2} style={styles.title}>{title}</Text>

            <View style={styles.rightSection}>
                {showRefresh && (
                    <TouchableOpacity style={styles.iconButton} onPress={onRefresh}>
                        <Ionicons name="refresh" size={24} color="white"/>
                    </TouchableOpacity>
                )}
                <TouchableOpacity style={styles.iconButton}>
                    <Ionicons name="ellipsis-vertical" size={24} color="white"/>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    header: {
        backgroundColor: Colors.primary500,
        paddingHorizontal: 16,
        paddingVertical: 8,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    leftSection: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    rightSection: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        justifyContent: 'flex-end',
    },
    title: {
        color: 'white',
        fontSize: 20,
        flex: 4,
        fontWeight: '600',
        textAlign: 'center',
    },
    iconButton: {
        padding: 8,
    },
    backButton: {
        padding: 8,
        marginRight: 8,
    },
});

export default Header;
