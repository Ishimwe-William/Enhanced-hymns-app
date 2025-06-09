import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {useTheme} from "../../context/ThemeContext";

const SearchBar = ({ value, onChangeText, placeholder, autoFocus = false }) => {
    const {colors} = useTheme().theme;

    const styles = StyleSheet.create({
        searchContainer: {
            paddingHorizontal: 16,
            paddingVertical: 12,
            backgroundColor:  colors.card,
        },
        searchBar: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: colors.primary,
            borderRadius: 10,
            paddingHorizontal: 12,
            // paddingVertical: 8,
        },
        searchIcon: {
            marginRight: 8,
        },
        searchInput: {
            flex: 1,
            fontSize: 16,
            color: colors.text,
        },
    });

    return (
        <View style={styles.searchContainer}>
            <View style={styles.searchBar}>
                <Ionicons name="search" size={20} color={colors.textSecondary} style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    value={value}
                    onChangeText={onChangeText}
                    placeholder={placeholder}
                    placeholderTextColor={colors.textSecondary}
                    autoFocus={autoFocus}
                />
            </View>
        </View>
    );
};

export default SearchBar;
