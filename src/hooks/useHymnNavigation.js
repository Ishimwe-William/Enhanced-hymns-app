import React, {useCallback, useState} from 'react';
import {Dimensions} from 'react-native';
import {
    runOnJS,
    useSharedValue,
    withSpring,
    withTiming,
} from 'react-native-reanimated';

const {width: SCREEN_WIDTH} = Dimensions.get('window');

const useHymnNavigation = (hymn, hymns, onHymnChange) => {
    const [isTransitioning, setIsTransitioning] = useState(false);

    // Gesture animation values
    const translateX = useSharedValue(0);
    const scale = useSharedValue(1);
    const opacity = useSharedValue(1);

    // Shared values for navigation state (for use in worklets)
    const canGoNext = useSharedValue(false);
    const canGoPrevious = useSharedValue(false);

    // Helper function to check if navigation is possible
    const canNavigateNext = useCallback(() => {
        if (!hymn || !hymns || hymns.length === 0) return false;
        const currentIndex = hymns.findIndex(h => h.id === hymn.id);
        return currentIndex >= 0 && currentIndex < hymns.length - 1;
    }, [hymn, hymns]);

    const canNavigatePrevious = useCallback(() => {
        if (!hymn || !hymns || hymns.length === 0) return false;
        const currentIndex = hymns.findIndex(h => h.id === hymn.id);
        return currentIndex > 0;
    }, [hymn, hymns]);

    // Update shared values when navigation state changes
    React.useEffect(() => {
        canGoNext.value = canNavigateNext();
        canGoPrevious.value = canNavigatePrevious();
    }, [hymn, hymns, canNavigateNext, canNavigatePrevious]);

    // Animated page transition
    const animatePageTransition = useCallback((direction, onComplete) => {
        setIsTransitioning(true);

        // Exit animation
        const exitTranslateX = direction === 'next' ? -SCREEN_WIDTH : SCREEN_WIDTH;

        translateX.value = withTiming(exitTranslateX, {duration: 100});
        scale.value = withTiming(0.8, {duration: 300});
        opacity.value = withTiming(0.3, {duration: 300}, () => {
            runOnJS(onComplete)();

            // Reset position for entrance
            translateX.value = direction === 'next' ? SCREEN_WIDTH : -SCREEN_WIDTH;
            scale.value = 0.8;
            opacity.value = 0.3;

            // Enter animation
            translateX.value = withSpring(0, {
                damping: 100,
                stiffness: 300,
            });
            scale.value = withSpring(1, {
                damping: 100,
                stiffness: 300,
            });
            opacity.value = withTiming(1, {duration: 100}, () => {
                runOnJS(setIsTransitioning)(false);
            });
        });
    }, [translateX, scale, opacity]);

    // Navigation handlers with animation
    const handleNext = useCallback(() => {
        if (!canNavigateNext() || isTransitioning) return;

        const currentIndex = hymns.findIndex(h => h.id === hymn.id);
        const nextHymn = hymns[currentIndex + 1];

        animatePageTransition('next', () => {
            onHymnChange(nextHymn);
        });
    }, [hymn, hymns, canNavigateNext, isTransitioning, animatePageTransition, onHymnChange]);

    const handlePrevious = useCallback(() => {
        if (!canNavigatePrevious() || isTransitioning) return;

        const currentIndex = hymns.findIndex(h => h.id === hymn.id);
        const prevHymn = hymns[currentIndex - 1];

        animatePageTransition('previous', () => {
            onHymnChange(prevHymn);
        });
    }, [hymn, hymns, canNavigatePrevious, isTransitioning, animatePageTransition, onHymnChange]);

    // Reset animations when transitioning stops
    const resetAnimations = useCallback(() => {
        translateX.value = withSpring(0, {damping: 20, stiffness: 300});
        scale.value = withSpring(1, {damping: 20, stiffness: 300});
        opacity.value = withTiming(1, {duration: 200});
    }, [translateX, scale, opacity]);

    return {
        // State
        isTransitioning,

        // Animation values
        translateX,
        scale,
        opacity,

        // Navigation state (for worklets)
        canGoNext,
        canGoPrevious,

        // Navigation functions
        handleNext,
        handlePrevious,
        canNavigateNext,
        canNavigatePrevious,
        resetAnimations,

        // Internal functions (for gesture handler)
        animatePageTransition,
    };
};

export default useHymnNavigation;
