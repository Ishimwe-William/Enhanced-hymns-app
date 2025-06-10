import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {MaterialCommunityIcons} from "@expo/vector-icons";
import {useTheme} from "../../context/ThemeContext";

const WarningBanner = ({message, icon = "alert", signIn, type = "warning"}) => {
    const {colors} = useTheme().theme;

    const styles = StyleSheet.create({
        warningBanner: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: '#FFF9E6',
            padding: 16,
            marginHorizontal: 16,
            marginTop: 16,
            borderRadius: 8,
            borderLeftWidth: 4,
            borderLeftColor: '#FF9500',
        },
        warningText: {
            flex: 1,
            marginLeft: 12,
            fontSize: 14,
            color: '#8B5A00',
        },
    });

    return (
        <View style={styles.warningBanner}>
            <MaterialCommunityIcons name={icon} size={20} color={type === "warning" ? colors.warning : colors.notification}/>
            <Text style={styles.warningText}>
                {message}
            </Text>
            {signIn && (
                <TouchableOpacity onPress={signIn} style={{marginLeft: 12}}>
                    <Text
                        style={{color: type === "warning" ? colors.warning : colors.notification, fontWeight: 'bold'}}>
                        Sign In
                    </Text>
                </TouchableOpacity>
            )}
        </View>
    );
};

export default WarningBanner;
