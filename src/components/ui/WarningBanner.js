import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {Ionicons} from "@expo/vector-icons";

const WarningBanner = ({message, icon = "warning", color = "#FF9500", signIn}) => {
    return (
        <View style={styles.warningBanner}>
            <Ionicons name={icon} size={20} color={color}/>
            <Text style={styles.warningText}>
                {message}
            </Text>
            {signIn && (
                <TouchableOpacity onPress={signIn} style={{marginLeft: 12}}>
                    <Text style={{color: color, fontWeight: 'bold'}}>Sign In</Text>
                </TouchableOpacity>
            )}
        </View>
    );
};

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

export default WarningBanner;
