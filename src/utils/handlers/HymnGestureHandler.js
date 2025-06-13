import {Dimensions} from 'react-native';
import {
    Extrapolation,
    interpolate,
    runOnJS,
} from 'react-native-reanimated';
import {Gesture} from 'react-native-gesture-handler';

const {width: SCREEN_WIDTH} = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.3; // 30% of screen width
const VELOCITY_THRESHOLD = 500;

export const createHymnPanGesture = (navigationHandler) => {
    const {
        translateX,
        scale,
        opacity,
        canGoNext,
        canGoPrevious,
        handleNext,
        handlePrevious,
        resetAnimations,
    } = navigationHandler;

    return Gesture.Pan()
        .activeOffsetX([-20, 20]) // Only activate when horizontal movement exceeds 20px
        .failOffsetY([-5, 5])     // Fail if vertical movement exceeds 5px first
        .onStart(() => {
            'worklet';
            // Reset any ongoing animations when starting a new gesture
        })
        .onUpdate((event) => {
            'worklet';
            const {translationX, translationY} = event;

            // Only respond to primarily horizontal gestures
            if (Math.abs(translationY) > Math.abs(translationX) * 1.5) {
                return; // This is more of a vertical gesture, ignore it
            }

            // Apply translation with resistance at boundaries
            let resistedTranslation = translationX;

            // Add resistance when trying to swipe beyond available hymns
            if (translationX > 0 && !canGoPrevious.value) {
                resistedTranslation = translationX * 0.3; // Heavy resistance for swipe right when can't go previous
            } else if (translationX < 0 && !canGoNext.value) {
                resistedTranslation = translationX * 0.3; // Heavy resistance for swipe left when can't go next
            }

            translateX.value = resistedTranslation;

            // Add subtle scale effect during drag
            scale.value = interpolate(
                Math.abs(resistedTranslation),
                [0, SCREEN_WIDTH * 0.5],
                [1, 0.95],
                Extrapolation.CLAMP
            );

            // Add subtle opacity effect
            opacity.value = interpolate(
                Math.abs(resistedTranslation),
                [0, SCREEN_WIDTH * 0.5],
                [1, 0.8],
                Extrapolation.CLAMP
            );
        })
        .onEnd((event) => {
            'worklet';
            const {translationX, translationY, velocityX} = event;

            // Only process if this was primarily a horizontal gesture
            if (Math.abs(translationY) > Math.abs(translationX) * 1.5) {
                runOnJS(resetAnimations)();
                return;
            }

            const shouldNavigate = Math.abs(translationX) > SWIPE_THRESHOLD ||
                Math.abs(velocityX) > VELOCITY_THRESHOLD;

            if (shouldNavigate) {
                if (translationX > 0 && canGoPrevious.value) {
                    // Swipe right - go to previous
                    runOnJS(handlePrevious)();
                } else if (translationX < 0 && canGoNext.value) {
                    // Swipe left - go to next
                    runOnJS(handleNext)();
                } else {
                    // Can't navigate in that direction, snap back
                    runOnJS(resetAnimations)();
                }
            } else {
                // Didn't meet threshold, snap back
                runOnJS(resetAnimations)();
            }
        });
};
