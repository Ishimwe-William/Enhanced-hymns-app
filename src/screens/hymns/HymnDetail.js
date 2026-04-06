import React, {useRef} from 'react';
import {StyleSheet, View, Text, TouchableOpacity} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import PagerView from 'react-native-pager-view';
import {Ionicons} from '@expo/vector-icons';
import Header from '../../components/ui/Header';
import HymnContent from '../../components/hymns/detail/HymnContent';
import HymnControls from '../../components/hymns/detail/HymnControls';
import LoadingScreen from '../../components/LoadingScreen';
import {useHymns} from '../../context/HymnContext';
import {useTheme} from '../../context/ThemeContext';
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
        adminBar: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            paddingHorizontal: 16,
            paddingVertical: 7,
            backgroundColor: colors.header + '15',
            borderBottomWidth: 1,
            borderBottomColor: colors.header + '30',
        },
        adminBarText: {
            fontSize: 12,
            fontWeight: '600',
            letterSpacing: 0.3,
            color: colors.header,
        },
    });

    const handlePageSelected = (e) => {
        handlePageChange(e.nativeEvent.position, pagerRef);
    };

    const handleNext = () => {
        if (canGoNext) pagerRef.current?.setPage(2);
    };

    const handlePrevious = () => {
        if (canGoPrevious) pagerRef.current?.setPage(0);
    };

    const handleEdit = () => {
        if (currentHymn?.id) {
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

    if (loading) return <LoadingScreen message="Loading hymn..."/>;

    if (error) {
        return (
            <View style={styles.container}>
                <Header title="Error" showBack onBack={() => navigation.goBack()} />
                <WarningBanner message={error} />
            </View>
        );
    }

    if (!currentHymn) return <LoadingScreen message="Loading..." />;

    return (
        <View style={styles.container}>
            <Header
                title={headerTitle}
                showBack
                onBack={() => navigation.goBack()}
                showMore={true}
                modalContent={renderModalContent}
            />

            {isAdmin && (
                <TouchableOpacity style={styles.adminBar} onPress={handleEdit}>
                    <Ionicons name="pencil-outline" size={14} color={colors.header} />
                    <Text style={styles.adminBarText}>Admin · Edit this hymn</Text>
                </TouchableOpacity>
            )}

            <PagerView
                ref={pagerRef}
                style={styles.pagerContainer}
                initialPage={1}
                onPageSelected={handlePageSelected}
            >
                {hymnPages.map((hymn, index) => (
                    <View key={index} style={styles.page}>
                        {hymn ? (
                            <HymnContent hymn={hymn} showTitle={false} />
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
                <HymnShareCapture ref={viewShotRef} hymn={currentHymn} />
            )}
        </View>
    );
};

export default HymnDetail;