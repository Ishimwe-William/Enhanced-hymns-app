import {StyleSheet, Text, TouchableOpacity, View} from "react-native";
import {Ionicons} from "@expo/vector-icons";
import React from "react";
import {useTheme} from "../../context/ThemeContext";

export  const ListItem = ({icon, title, subtitle, onPress, rightElement}) => {
    const {colors} = useTheme().theme;

    const styles = StyleSheet.create({
        ListItem: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: colors.primary,
            padding: 16,
            marginBottom: 1,
            borderRadius: 8,
        },
        ListIcon: {
            width: 32,
            height: 32,
            borderRadius: 6,
            backgroundColor: colors.background,
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
            color: colors.text,
        },
        ListSubtitle: {
            fontSize: 14,
            color: colors.textSecondary,
            marginTop: 2,
        },
    });

    return(
    <TouchableOpacity style={styles.ListItem} onPress={onPress}>
        <View style={styles.ListIcon}>
            <Ionicons name={icon} size={22} color={colors.header}/>
        </View>
        <View style={styles.ListContent}>
            <Text style={styles.ListTitle}>{title}</Text>
            {subtitle && <Text style={styles.ListSubtitle}>{subtitle}</Text>}
        </View>
        {rightElement || <Ionicons name="chevron-forward" size={20} color={colors.header}/>}
    </TouchableOpacity>
    );
};
