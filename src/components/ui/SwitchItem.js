import {StyleSheet, Switch, Text, View} from "react-native";
import {Ionicons} from "@expo/vector-icons";
import React from "react";

export const SwitchItem = ({icon, title, subtitle, value, onValueChange}) => (
    <View style={styles.settingItem}>
        <View style={styles.settingIcon}>
            <Ionicons name={icon} size={22} color="#007AFF"/>
        </View>
        <View style={styles.settingContent}>
            <Text style={styles.settingTitle}>{title}</Text>
            {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
        </View>
        <Switch
            value={value}
            onValueChange={onValueChange}
            trackColor={{false: '#E5E5EA', true: '#34C759'}}
            thumbColor={value ? '#FFFFFF' : '#FFFFFF'}
        />
    </View>
);

const styles = StyleSheet.create({
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        padding: 16,
        marginBottom: 1,
    },
    settingIcon: {
        width: 32,
        height: 32,
        borderRadius: 6,
        backgroundColor: '#F0F8FF',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    settingContent: {
        flex: 1,
    },
    settingTitle: {
        fontSize: 16,
        fontWeight: '500',
        color: '#333',
    },
    settingSubtitle: {
        fontSize: 14,
        color: '#666',
        marginTop: 2,
    },
});
