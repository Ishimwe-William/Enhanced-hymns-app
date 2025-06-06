import {StyleSheet, Switch, Text, View} from "react-native";
import {Ionicons} from "@expo/vector-icons";
import React from "react";
import {useTheme} from "../../context/ThemeContext";

export const SwitchItem = ({icon, title, subtitle, value, onValueChange}) => {
    const {colors} = useTheme().theme;

    const styles = StyleSheet.create({
        settingItem: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: colors.primary,
            padding: 16,
            marginBottom: 1,
            borderRadius: 8,
        },
        settingIcon: {
            width: 32,
            height: 32,
            borderRadius: 6,
            backgroundColor: colors.background,
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
            color: colors.text,
        },
        settingSubtitle: {
            fontSize: 14,
            color: colors.textSecondary,
            marginTop: 2,
        },
    });

    return (
        <View style={styles.settingItem}>
            <View style={styles.settingIcon}>
                <Ionicons name={icon} size={22} color={colors.header}/>
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
    )
}
