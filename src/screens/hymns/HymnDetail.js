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

    // Optimized hook handles the "Current" hymn logic for us
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

    // 1. DYNAMIC HEADER TITLE
    // Updates instantly as you slide because currentHymn updates instantly
    const headerTitle = currentHymn
        ? `${currentHymn.number} - ${currentHymn.title}`
        : "Loading...";

    if (loading) {
        return <LoadingScreen message="Loading hymn..."/>;
    }

    if (error || !currentHymn) {
        return (
            <View style={styles.container}>
                <Header
                    title="Error"
                    showBack
                    onBack={handleBack}
                />
                <WarningBanner message={error || "Failed to load hymn"}/>
            </View>
        );
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
                                showTitle={false} // Hidden here since it's in the Header now
                            />
                        ) : (
                            <View style={styles.page} />
                        )}
                    </View>
                ))}
            </PagerView>

            {/* Controls detached from pager - always visible and reactive */}
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