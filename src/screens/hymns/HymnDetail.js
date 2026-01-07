import React, {useRef} from 'react';
import {StyleSheet, View} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import PagerView from 'react-native-pager-view';
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
import useHymnPager from '../../hooks/useHymnPager';

const HymnDetail = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const initialHymnId = route.params?.hymnId;

    const {hymns, loadHymnDetails} = useHymns();
    const {colors} = useTheme().theme;

    const pagerRef = useRef(null);
    const viewShotRef = useRef(null);

    const {
        hymnPages,
        currentHymn,
        loading,
        error,
        canGoNext,
        canGoPrevious,
        handlePageChange,
    } = useHymnPager(initialHymnId, hymns, loadHymnDetails);

    const [isCapturing, setIsCapturing] = React.useState(false);

    const shareHandler = currentHymn ?
        new HymnShareHandler(currentHymn, viewShotRef, setIsCapturing) : null;

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.card,
        },
        pagerContainer: {
            flex: 1,
        },
        page: {
            flex: 1,
        },
        controlsContainer: {
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: colors.card,
            zIndex: 10,
        },
    });

    const handlePageSelected = (e) => {
        const position = e.nativeEvent.position;
        handlePageChange(position, pagerRef);
    };

    const handleNext = () => {
        if (canGoNext) {
            pagerRef.current?.setPage(2);
        }
    };

    const handlePrevious = () => {
        if (canGoPrevious) {
            pagerRef.current?.setPage(0);
        }
    };

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

    // Dynamic header title
    const headerTitle = currentHymn
        ? `${currentHymn.number} - ${currentHymn.title}`
        : "Loading...";

    // 1. Initial full-screen load
    if (loading) {
        return <LoadingScreen message="Loading hymn..."/>;
    }

    // 2. Explicit Error State (Only if the API actually failed)
    if (error) {
        return (
            <View style={styles.container}>
                <Header title="Error" showBack onBack={handleBack} />
                <WarningBanner message={error} />
            </View>
        );
    }

    // 3. Race Condition Loading State (Fix for "Failed to load hymn" on fast swipe)
    // If we have no error, but also no hymn data yet, we are simply waiting for the fetch.
    if (!currentHymn) {
        return <LoadingScreen message="Loading..." />;
    }

    return (
        <View style={styles.container}>
            <Header
                title={headerTitle}
                showBack
                onBack={handleBack}
                showMore={true}
                modalContent={renderModalContent}
            />

            <PagerView
                ref={pagerRef}
                style={styles.pagerContainer}
                initialPage={1}
                onPageSelected={handlePageSelected}
            >
                {hymnPages.map((hymn, index) => (
                    <View key={index} style={styles.page}>
                        {hymn ? (
                            <HymnContent
                                hymn={hymn}
                                showTitle={false}
                            />
                        ) : (
                            <View style={styles.page} />
                        )}
                    </View>
                ))}
            </PagerView>

            <View style={styles.controlsContainer}>
                <HymnControls
                    hymn={currentHymn}
                    onNext={handleNext}
                    onPrevious={handlePrevious}
                    onShare={shareHandler?.handleShare}
                    disabled={false}
                />
            </View>

            {isCapturing && (
                <HymnShareCapture
                    ref={viewShotRef}
                    hymn={currentHymn}
                />
            )}
        </View>
    );
};

export default HymnDetail;