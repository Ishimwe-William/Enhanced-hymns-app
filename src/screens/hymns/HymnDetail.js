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
// NEW: Import useUser to check for admin status
import {useUser} from '../../context/UserContext';
import {HymnDetailModal} from '../../components/modals/HymnDetailModal';
import {HymnShareCapture} from '../../components/hymns/detail/HymnShareCapture';
import {HymnShareHandler} from '../../utils/handlers/HymnShareHandler';
import WarningBanner from "../../components/ui/WarningBanner";
import useHymnPager from '../../hooks/useHymnPager';

const HymnDetail = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const initialHymnId = route.params?.hymnId;

    const {hymns, loadHymnDetails, loadAndTrackHymn} = useHymns();
    const {colors} = useTheme().theme;

    // NEW: Destructure isAdmin from user context
    const {isAdmin} = useUser();

    const pagerRef = useRef(null);
    const viewShotRef = useRef(null);
    const trackedInitialRef = useRef(false);

    if (!initialHymnId) {
        return (
            <View style={{ flex: 1, backgroundColor: colors.card }}>
                <Header title="Error" showBack onBack={() => navigation.goBack()} />
                <WarningBanner message="No hymn selected." />
            </View>
        );
    }

    const loadHymnDetailsWrapper = React.useCallback((hymnId) => {
        return new Promise((resolve) => {
            if (!trackedInitialRef.current && hymnId === initialHymnId) {
                trackedInitialRef.current = true;
                loadAndTrackHymn(hymnId);
                loadHymnDetails(hymnId, (hymn) => resolve(hymn));
            } else {
                loadHymnDetails(hymnId, (hymn) => resolve(hymn));
            }
        });
    }, [initialHymnId, loadAndTrackHymn, loadHymnDetails]);

    const {
        hymnPages,
        currentHymn,
        loading,
        error,
        canGoNext,
        canGoPrevious,
        handlePageChange,
    } = useHymnPager(initialHymnId, hymns, loadHymnDetailsWrapper);

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

    // NEW: Handle navigating to the Edit screen
    const handleEdit = () => {
        if (currentHymn && currentHymn.id) {
            navigation.navigate('EditHymn', { hymnId: currentHymn.id });
        }
    };

    const renderModalContent = ({closeModal}) => (
        <HymnDetailModal
            onShare={shareHandler?.handleShare}
            onFeedback={shareHandler?.handleFeedback}
            onClose={closeModal}
        />
    );

    const headerTitle = currentHymn
        ? `${currentHymn.number} - ${currentHymn.title}`
        : "Loading...";

    if (loading) {
        return <LoadingScreen message="Loading hymn..."/>;
    }

    if (error) {
        return (
            <View style={styles.container}>
                <Header title="Error" showBack onBack={handleBack} />
                <WarningBanner message={error} />
            </View>
        );
    }

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
                showEdit={isAdmin} // NEW: Only show if user is admin
                onEdit={handleEdit} // NEW: Call handleEdit when pressed
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