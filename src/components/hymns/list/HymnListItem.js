import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import {useTheme} from "../../../context/ThemeContext";

const HymnListItem = ({ hymn, onPress }) => {
    const {colors } = useTheme().theme;

    const styles = StyleSheet.create({
        item: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: colors.primary,
            paddingVertical: 16,
            paddingHorizontal: 20,
            marginVertical: 4,
            borderRadius: 8,
            shadowColor: '#000',
            shadowOffset: {
                width: 0,
                height: 1,
            },
            shadowOpacity: 0.1,
            shadowRadius: 2,
            elevation: 2,
        },
        numberContainer: {
            marginRight: 16,
        },
        number: {
            fontSize: 16,
            fontWeight: '600',
            color: colors.textSecondary,
            minWidth: 20,
        },
        content: {
            flex: 1,
        },
        title: {
            fontSize: 18,
            fontWeight: '500',
            color: colors.text,
        },
    });

    return (
        <TouchableOpacity style={styles.item} onPress={onPress}>
            <View style={styles.numberContainer}>
                <Text style={styles.number}>{hymn.number}</Text>
            </View>
            <View style={styles.content}>
                <Text style={styles.title}>{hymn.title}</Text>
            </View>
        </TouchableOpacity>
    );
};


export default HymnListItem;
