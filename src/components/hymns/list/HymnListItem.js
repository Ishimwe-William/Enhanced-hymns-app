import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {useTheme} from "../../../context/ThemeContext";

const HymnListItem = ({hymn, onPress}) => {
    const {colors} = useTheme().theme;

    const styles = StyleSheet.create({
        item: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: colors.card,
            paddingVertical: 14,
            paddingHorizontal: 16,
            marginVertical: 2,
            marginHorizontal: 12,
            borderRadius: 10,
            borderWidth: 1,
            borderColor: colors.border,
        },
        numberBadge: {
            width: 36,
            height: 36,
            borderRadius: 10,
            backgroundColor: colors.primary,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 14,
        },
        number: {
            fontSize: 13,
            fontWeight: '700',
            color: colors.header,
        },
        title: {
            flex: 1,
            fontSize: 16,
            fontWeight: '500',
            color: colors.text,
        },
    });

    return (
        <TouchableOpacity style={styles.item} onPress={onPress} activeOpacity={0.7}>
            <View style={styles.numberBadge}>
                <Text style={styles.number}>{hymn.number}</Text>
            </View>
            <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">
                {hymn.title}
            </Text>
        </TouchableOpacity>
    );
};

export default HymnListItem;