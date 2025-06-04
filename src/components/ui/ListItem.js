import {StyleSheet, Text, TouchableOpacity, View} from "react-native";
import {Ionicons} from "@expo/vector-icons";
import React from "react";

export  const ListItem = ({icon, title, subtitle, onPress, rightElement}) => (
    <TouchableOpacity style={styles.ListItem} onPress={onPress}>
        <View style={styles.ListIcon}>
            <Ionicons name={icon} size={22} color="#007AFF"/>
        </View>
        <View style={styles.ListContent}>
            <Text style={styles.ListTitle}>{title}</Text>
            {subtitle && <Text style={styles.ListSubtitle}>{subtitle}</Text>}
        </View>
        {rightElement || <Ionicons name="chevron-forward" size={20} color="#C7C7CC"/>}
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    ListItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        padding: 16,
        marginBottom: 1,
    },
    ListIcon: {
        width: 32,
        height: 32,
        borderRadius: 6,
        backgroundColor: '#F0F8FF',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    ListContent: {
        flex: 1,
    },
    ListTitle: {
        fontSize: 16,
        fontWeight: '500',
        color: '#333',
    },
    ListSubtitle: {
        fontSize: 14,
        color: '#666',
        marginTop: 2,
    },
});
