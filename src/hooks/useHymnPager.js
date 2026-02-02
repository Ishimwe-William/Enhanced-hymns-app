import {useCallback, useEffect, useState, useRef} from 'react';

const useHymnPager = (initialHymnId, hymns, loadHymnDetails) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [hymnPages, setHymnPages] = useState([null, null, null]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Track which hymn we've already recorded as recent
    const lastRecordedHymnRef = useRef(null);

    // Initial Load
    useEffect(() => {
        const initialize = async () => {
            if (!initialHymnId || !hymns.length) return;
            try {
                setLoading(true);
                const index = hymns.findIndex(h => h.id === initialHymnId);
                if (index === -1) {
                    setError('Hymn not found');
                    return;
                }
                setCurrentIndex(index);

                const results = await Promise.all([
                    index > 0 ? loadHymnDetails(hymns[index - 1].id) : Promise.resolve(null),
                    loadHymnDetails(hymns[index].id),
                    index < hymns.length - 1 ? loadHymnDetails(hymns[index + 1].id) : Promise.resolve(null)
                ]);

                setHymnPages(results);

                // Mark initial hymn as recorded
                if (results[1]) {
                    lastRecordedHymnRef.current = results[1].id;
                }
            } catch (err) {
                console.error('Error initializing:', err);
                setError('Failed to load hymn');
            } finally {
                setLoading(false);
            }
        };
        initialize();
    }, [initialHymnId]);

    const handlePageChange = useCallback((position, pagerRef) => {
        if (position === 1) return;

        const isLastHymn = currentIndex >= hymns.length - 1;
        const isFirstHymn = currentIndex <= 0;

        // SWIPE FORWARD (NEXT)
        if (position === 2) {
            // 1. BOUNDARY CHECK: If at last hymn, snap back immediately
            if (isLastHymn) {
                requestAnimationFrame(() => {
                    pagerRef.current?.setPageWithoutAnimation(1);
                });
                return;
            }

            // 2. Normal Valid Swipe Logic
            const newIndex = currentIndex + 1;
            const oldCurrent = hymnPages[1];
            const oldNext = hymnPages[2];

            setHymnPages([oldCurrent, oldNext, null]);
            setCurrentIndex(newIndex);

            requestAnimationFrame(() => {
                pagerRef.current?.setPageWithoutAnimation(1);
            });

            if (!oldNext) {
                loadHymnDetails(hymns[newIndex].id).then(currData => {
                    setHymnPages(prev => [prev[0], currData, prev[2]]);
                    if (currData && currData.id !== lastRecordedHymnRef.current) {
                        lastRecordedHymnRef.current = currData.id;
                    }
                });
            } else {
                if (oldNext && oldNext.id !== lastRecordedHymnRef.current) {
                    lastRecordedHymnRef.current = oldNext.id;
                }
            }

            if (newIndex < hymns.length - 1) {
                loadHymnDetails(hymns[newIndex + 1].id).then(newNextData => {
                    setHymnPages(prev => [prev[0], prev[1], newNextData]);
                });
            }
        }

        // SWIPE BACKWARD (PREVIOUS)
        else if (position === 0) {
            // 1. BOUNDARY CHECK: If at first hymn, snap back immediately
            if (isFirstHymn) {
                requestAnimationFrame(() => {
                    pagerRef.current?.setPageWithoutAnimation(1);
                });
                return;
            }

            // 2. Normal Valid Swipe Logic
            const newIndex = currentIndex - 1;
            const oldPrev = hymnPages[0];
            const oldCurrent = hymnPages[1];

            setHymnPages([null, oldPrev, oldCurrent]);
            setCurrentIndex(newIndex);

            requestAnimationFrame(() => {
                pagerRef.current?.setPageWithoutAnimation(1);
            });

            if (!oldPrev) {
                loadHymnDetails(hymns[newIndex].id).then(currData => {
                    setHymnPages(prev => [prev[0], currData, prev[2]]);
                    if (currData && currData.id !== lastRecordedHymnRef.current) {
                        lastRecordedHymnRef.current = currData.id;
                    }
                });
            } else {
                if (oldPrev && oldPrev.id !== lastRecordedHymnRef.current) {
                    lastRecordedHymnRef.current = oldPrev.id;
                }
            }

            if (newIndex > 0) {
                loadHymnDetails(hymns[newIndex - 1].id).then(newPrevData => {
                    setHymnPages(prev => [newPrevData, prev[1], prev[2]]);
                });
            }
        }
    }, [currentIndex, hymnPages, hymns, loadHymnDetails]);

    const currentHymn = hymnPages[1];

    // Helper booleans if you want to disable buttons in the UI
    const canGoNext = currentIndex < hymns.length - 1;
    const canGoPrevious = currentIndex > 0;

    return {
        hymnPages,
        currentHymn,
        currentIndex,
        loading,
        error,
        canGoNext,
        canGoPrevious,
        handlePageChange,
    };
};

export default useHymnPager;