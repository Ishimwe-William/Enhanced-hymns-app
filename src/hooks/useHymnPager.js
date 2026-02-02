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

        // SWIPE FORWARD (NEXT)
        if (position === 2 && currentIndex < hymns.length - 1) {
            const newIndex = currentIndex + 1;

            const oldCurrent = hymnPages[1];
            const oldNext = hymnPages[2];

            // 1. INSTANT UPDATE
            setHymnPages([oldCurrent, oldNext, null]);
            setCurrentIndex(newIndex);

            // 2. SNAP PAGER BACK
            requestAnimationFrame(() => {
                pagerRef.current?.setPageWithoutAnimation(1);
            });

            // 3. RECOVERY FETCH
            if (!oldNext) {
                loadHymnDetails(hymns[newIndex].id).then(currData => {
                    setHymnPages(prev => [prev[0], currData, prev[2]]);

                    // CRITICAL FIX: Record to recent only when we have the actual data
                    // and haven't recorded this hymn yet
                    if (currData && currData.id !== lastRecordedHymnRef.current) {
                        lastRecordedHymnRef.current = currData.id;
                    }
                });
            } else {
                // CRITICAL FIX: We already have the data, record it now
                if (oldNext && oldNext.id !== lastRecordedHymnRef.current) {
                    lastRecordedHymnRef.current = oldNext.id;
                }
            }

            // 4. PRELOAD NEXT NEIGHBOR
            if (newIndex < hymns.length - 1) {
                loadHymnDetails(hymns[newIndex + 1].id).then(newNextData => {
                    setHymnPages(prev => [prev[0], prev[1], newNextData]);
                });
            }
        }

        // SWIPE BACKWARD (PREVIOUS)
        else if (position === 0 && currentIndex > 0) {
            const newIndex = currentIndex - 1;

            const oldPrev = hymnPages[0];
            const oldCurrent = hymnPages[1];

            // 1. INSTANT UPDATE
            setHymnPages([null, oldPrev, oldCurrent]);
            setCurrentIndex(newIndex);

            // 2. SNAP PAGER BACK
            requestAnimationFrame(() => {
                pagerRef.current?.setPageWithoutAnimation(1);
            });

            // 3. RECOVERY FETCH
            if (!oldPrev) {
                loadHymnDetails(hymns[newIndex].id).then(currData => {
                    setHymnPages(prev => [prev[0], currData, prev[2]]);

                    // CRITICAL FIX: Record to recent only when we have the actual data
                    if (currData && currData.id !== lastRecordedHymnRef.current) {
                        lastRecordedHymnRef.current = currData.id;
                    }
                });
            } else {
                // CRITICAL FIX: We already have the data, record it now
                if (oldPrev && oldPrev.id !== lastRecordedHymnRef.current) {
                    lastRecordedHymnRef.current = oldPrev.id;
                }
            }

            // 4. PRELOAD PREVIOUS NEIGHBOR
            if (newIndex > 0) {
                loadHymnDetails(hymns[newIndex - 1].id).then(newPrevData => {
                    setHymnPages(prev => [newPrevData, prev[1], prev[2]]);
                });
            }
        }
    }, [currentIndex, hymnPages, hymns, loadHymnDetails]);

    const currentHymn = hymnPages[1];
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