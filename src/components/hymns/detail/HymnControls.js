import React, {useState, useRef} from 'react';
import {
    View,
    StyleSheet,
    Alert,
    Animated,
} from 'react-native';
import {useHymns} from '../../../context/HymnContext';
import FloatingButton from '../../ui/FloatingButton';
import {useTheme} from "../../../context/ThemeContext";

const HymnControls = ({hymn, onNext, onPrevious, onShare}) => {
    const {toggleFavorite, isFavorite} = useHymns();
    const [isExpanded, setIsExpanded] = useState(false);
    const animatedHeight = useRef(new Animated.Value(0)).current;
    const rotateAnim = useRef(new Animated.Value(0)).current;
    const playButtonTranslateY = useRef(new Animated.Value(0)).current;

    const {colors} = useTheme().theme;

    const styles = StyleSheet.create({
        container: {
            backgroundColor: colors.primary,
            borderTopWidth: 1,
            borderTopColor: colors.border,
            position: 'relative',
        },
        expandedContainer: {
            overflow: 'hidden',
            backgroundColor: colors.card,
        },
        controlsGrid: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'space-around',
            alignItems: 'center',
            paddingHorizontal: 20,
            paddingVertical: 16,
            height: 80,
        },
        alwaysVisibleContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            position: 'absolute',
            bottom: 18,
            right: 12,
        },
        playButtonContainer: {
            marginRight: 16,
            width: 43,
            height: 43,
            borderRadius: 30,
            backgroundColor: colors.text,
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: '#000',
            shadowOffset: {
                width: 0,
                height: 2,
            },
            shadowOpacity: 0.15,
            shadowRadius: 3,
            elevation: 3,
            borderWidth: 1,
            borderColor: colors.textSecondary,
        },
        toggleButton: {
            width: 43,
            height: 43,
            borderRadius: 30,
            backgroundColor: colors.primary,
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: '#000',
            shadowOffset: {
                width: 0,
                height: 2,
            },
            shadowOpacity: 0.15,
            shadowRadius: 3,
            elevation: 3,
            borderWidth: 1,
            borderColor: colors.textSecondary,
        },
        chevronContainer: {
            alignItems: 'center',
            justifyContent: 'center',
        },
    });


    const isHymnFavorite = isFavorite(hymn?.id);

    const toggleExpand = () => {
        const toValue = isExpanded ? 0 : 1;

        Animated.parallel([
            Animated.timing(animatedHeight, {
                toValue: toValue,
                duration: 300,
                useNativeDriver: false,
            }),
            Animated.timing(rotateAnim, {
                toValue: toValue,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.timing(playButtonTranslateY, {
                toValue: isExpanded ? 0 : -55, // Move Play button up when expanded
                duration: 300,
                useNativeDriver: true,
            }),
        ]).start();

        setIsExpanded(!isExpanded);
    };

    const handlePlay = () => {
        Alert.alert('Play', 'Audio playback feature coming soon!');
    };

    const handleFavorite = () => {
        if (hymn) {
            toggleFavorite(hymn);
        }
    };

    const handleFont = () => {
        Alert.alert('Font Size', 'Font size adjustment coming soon!');
    };

    // Interpolate animations
    const expandedHeight = animatedHeight.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 80], // Height of the expanded controls
    });

    const controlButtons = [
        {
            name: 'chevron-back-outline',
            size: 28,
            color: colors.text,
            onPress: onPrevious,
            label: 'More',
        },
        {
            name: 'text-outline',
            size: 28,
            color: colors.text,
            onPress: handleFont,
            label: 'Font',
        },
        {
            name: isHymnFavorite ? 'heart' : 'heart-outline',
            size: 28,
            color: isHymnFavorite ? colors.danger : colors.text,
            onPress: handleFavorite,
            label: 'Favorite',
        },
        {
            name: 'share-social-outline',
            size: 28,
            color: colors.text,
            onPress: onShare,
            label: 'Share',
        },
        {
            name: 'chevron-forward-outline',
            size: 28,
            color: colors.text,
            onPress: onNext,
            label: 'More',
        },
    ];

    return (
        <View style={styles.container}>
            {/* Expanded Controls */}
            <Animated.View
                style={[styles.expandedContainer, {height: expandedHeight}]}
            >
                <View style={styles.controlsGrid}>
                    {controlButtons.map((button, index) => (
                        <FloatingButton
                            key={index}
                            name={button.name}
                            size={button.size}
                            color={button.color}
                            onPress={button.onPress}
                        />
                    ))}
                </View>
            </Animated.View>

            {/* Always Visible Controls: Play Button and Chevron */}
            <View style={styles.alwaysVisibleContainer}>
                <Animated.View
                    style={[
                        styles.playButtonContainer,
                        {transform: [{translateY: playButtonTranslateY}]},
                    ]}
                >
                    <FloatingButton
                        name="play"
                        size={28}
                        color={colors.notification}
                        onPress={handlePlay}
                    />
                </Animated.View>

                <Animated.View
                    style={[
                        styles.playButtonContainer,
                        {transform: [{translateY: playButtonTranslateY}]},
                    ]}
                >
                    <FloatingButton
                        name={isExpanded ? "chevron-up" : "chevron-down"}
                        size={28}
                        color={colors.text}
                        onPress={toggleExpand}
                    />
                </Animated.View>
            </View>
        </View>
    );
};


export default HymnControls;
