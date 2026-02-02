import React, { useMemo, useCallback } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import HymnListItem from './HymnListItem';
import { useTheme } from "../../../context/ThemeContext";

// 1. Extract GridItem and wrap in React.memo for performance
// This prevents every single button from re-rendering when the list updates
const GridItem = React.memo(({ item, onPress, colors }) => (
    <TouchableOpacity
        style={[styles.gridItem, { backgroundColor: colors.primary }]}
        onPress={onPress}
    >
        <Text style={[styles.gridNumber, { color: colors.text }]}>
            {item.number}
        </Text>
    </TouchableOpacity>
));

const HymnListView = ({ hymns, onHymnSelect, viewMode = 'list' }) => {
    const { colors } = useTheme().theme;
    const isGrid = viewMode === 'grid';

    // 2. Constants for 5-column layout
    const numColumns = isGrid ? 5 : 1;
    const listKey = isGrid ? 'hymn-grid-5' : 'hymn-list-1';

    // 3. Memoized render functions
    const renderItem = useCallback(({ item }) => {
        if (isGrid) {
            return (
                <GridItem
                    item={item}
                    colors={colors}
                    onPress={() => onHymnSelect(item.id)}
                />
            );
        }
        return (
            <HymnListItem
                hymn={item}
                onPress={() => onHymnSelect(item.id)}
            />
        );
    }, [isGrid, colors, onHymnSelect]);

    // 4. getItemLayout (Optional but highly recommended for Grid performance)
    // Helps FlatList calculate size without measuring.
    // Assuming approx height: Grid ~60px, List ~70px
    const getItemLayout = useCallback((data, index) => ({
        length: isGrid ? 60 : 70,
        offset: (isGrid ? 60 : 70) * index,
        index,
    }), [isGrid]);

    return (
        <FlatList
            key={listKey}
            data={hymns}
            renderItem={renderItem}
            keyExtractor={(item) => item.number.toString()}

            // Layout Props
            numColumns={numColumns}
            columnWrapperStyle={isGrid ? styles.row : null}

            // Performance Props
            initialNumToRender={isGrid ? 25 : 10} // Render 5 rows initially
            maxToRenderPerBatch={isGrid ? 25 : 10}
            windowSize={5} // Reduces memory usage (default is 21)
            removeClippedSubviews={true} // Unmounts items off-screen

            style={styles.list}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
        />
    );
};

const styles = StyleSheet.create({
    list: {
        flex: 1,
    },
    listContent: {
        paddingHorizontal: 12, // Reduced padding to fit 5 items better
        paddingBottom: 20,
        paddingTop: 8,
    },
    // Grid Styles
    row: {
        justifyContent: 'flex-start',
        gap: 6, // Slightly tighter gap for 5 columns
    },
    gridItem: {
        flex: 1,
        aspectRatio: 1.2,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 8,
        marginBottom: 6,

        // 5 columns logic:
        // 100% / 5 = 20%. Subtracting a bit for gaps (6px).
        // Using maxWidth prevents the last row from stretching huge.
        maxWidth: '19%',

        // Shadow
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    gridNumber: {
        fontSize: 16, // Slightly smaller font for 5 columns
        fontWeight: 'bold',
    }
});

export default HymnListView;