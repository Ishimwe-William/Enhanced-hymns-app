import React, {useEffect, useRef, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import Header from '../../components/ui/Header';
import HymnContent from '../../components/hymns/detail/HymnContent';
import HymnControls from '../../components/hymns/detail/HymnControls';
import LoadingScreen from '../../components/LoadingScreen';
import {useHymns} from '../../context/HymnContext';
import {useTheme} from '../../context/ThemeContext';
import {HymnDetailModal} from '../../components/modals/HymnDetailModal';
import {HymnShareCapture} from '../../components/hymns/detail/HymnShareCapture';
import {HymnShareHandler} from '../../utils/handlers/HymnShareHandler';
import WarningBanner from "../../components/ui/WarningBanner";
import Animated, {useAnimatedStyle} from 'react-native-reanimated';
import {GestureDetector} from "react-native-gesture-handler";
import useHymnNavigation from '../../hooks/useHymnNavigation';
import {createHymnPanGesture} from '../../utils/handlers/HymnGestureHandler';

const HymnDetail = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const initialHymnId = route.params?.hymnId;

    const {hymns, loadHymnDetails} = useHymns();
    const {colors} = useTheme().theme;

    // Use internal state to track current hymn
    const [currentHymnId, setCurrentHymnId] = useState(initialHymnId);
    const [hymn, setHymn] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isCapturing, setIsCapturing] = useState(false);
    const [error, setError] = useState(null);

    const viewShotRef = useRef(null);

    // Initialize navigation handler
    const navigationHandler = useHymnNavigation(
        hymn,
        hymns,
        (newHymn) => setHymn(newHymn)
    );

    // Create gesture handler
    const panGesture = createHymnPanGesture(navigationHandler);

    // Initialize share handler
    const shareHandler = hymn ? new HymnShareHandler(hymn, viewShotRef, setIsCapturing) : null;

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.card,
        },
        contentContainer: {
            flex: 1,
        },
    });

    // Load hymn whenever currentHymnId changes
    useEffect(() => {
        const loadHymn = async () => {
            if (!currentHymnId) return;

            try {
                setLoading(true);
                const hymnData = await loadHymnDetails(currentHymnId);
                setHymn(hymnData);
            } catch (error) {
                console.error('Error loading hymn:', error);
                setError('Failed to load hymn. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        loadHymn();
    }, [currentHymnId]);

    const handleBack = () => {
        navigation.goBack();
    };

    const renderModalContent = ({closeModal}) => (
        <HymnDetailModal
            onShare={shareHandler?.handleShare}
            onFeedback={shareHandler?.handleFeedback}
            onClose={closeModal}
        />
    );

    // Animated styles
    const animatedContentStyle = useAnimatedStyle(() => {
        return {
            transform: [
                {translateX: navigationHandler.translateX.value},
                {scale: navigationHandler.scale.value}
            ],
            opacity: navigationHandler.opacity.value,
        };
    });

    // Show loading while loading
    if (loading) {
        return <LoadingScreen message="Loading hymn..."/>;
    }

    // Show loading if hymn hasn't loaded yet
    if (!hymn) {
        return <LoadingScreen message="Loading hymn data..."/>;
    }

    if (error) {
        return (
            <View>
                <WarningBanner message={error || "Unknown error! Please try again."}/>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Header
                title={`${hymn.number} - ${hymn.title}` || 'Hymn'}
                showBack
                onBack={handleBack}
                showMore={true}
                modalContent={renderModalContent}
            />

            <GestureDetector gesture={panGesture}>
                <Animated.View style={[styles.contentContainer, animatedContentStyle]}>
                    <HymnContent hymn={hymn}/>

                    <HymnControls
                        hymn={hymn}
                        onNext={navigationHandler.handleNext}
                        onPrevious={navigationHandler.handlePrevious}
                        onShare={shareHandler?.handleShare}
                        disabled={navigationHandler.isTransitioning}
                    />
                </Animated.View>
            </GestureDetector>

            {isCapturing && (
                <HymnShareCapture
                    ref={viewShotRef}
                    hymn={hymn}
                />
            )}
        </View>
    );
};

export default HymnDetail;
