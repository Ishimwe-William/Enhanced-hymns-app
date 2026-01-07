import {useCallback, useEffect, useState} from 'react';

const useHymnPager = (initialHymnId, hymns, loadHymnDetails) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    // Initialize with 3 empty slots [Prev, Current, Next]
    const [hymnPages, setHymnPages] = useState([null, null, null]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Initial Load (Only happens once on open)
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

                // Load initial 3 pages
                const results = await Promise.all([
                    index > 0 ? loadHymnDetails(hymns[index - 1].id) : Promise.resolve(null),
                    loadHymnDetails(hymns[index].id),
                    index < hymns.length - 1 ? loadHymnDetails(hymns[index + 1].id) : Promise.resolve(null)
                ]);
                setHymnPages(results);
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
        if (position === 1) return; // User didn't swipe, do nothing

        // ---------------------------------------------------------
        // CASE 1: SWIPE FORWARD (NEXT)
        // ---------------------------------------------------------
        if (position === 2 && currentIndex < hymns.length - 1) {
            const newIndex = currentIndex + 1;

            // GRAB DATA WE ALREADY HAVE
            const oldCurrent = hymnPages[1]; // Becomes Previous
            const oldNext = hymnPages[2];    // Becomes Current (TARGET)

            // 1. INSTANT UPDATE:
            setHymnPages([oldCurrent, oldNext, null]);
            setCurrentIndex(newIndex);

            // 2. SNAP PAGER BACK:
            requestAnimationFrame(() => {
                pagerRef.current?.setPageWithoutAnimation(1);
            });

            // 3. RECOVERY FETCH (The Fix):
            // If the page we landed on (oldNext) was empty/null, fetch it now.
            if (!oldNext) {
                loadHymnDetails(hymns[newIndex].id).then(currData => {
                    setHymnPages(prev => [prev[0], currData, prev[2]]);
                });
            }

            // 4. PRELOAD NEXT NEIGHBOR:
            if (newIndex < hymns.length - 1) {
                loadHymnDetails(hymns[newIndex + 1].id).then(newNextData => {
                    setHymnPages(prev => [prev[0], prev[1], newNextData]);
                });
            }
        }

            // ---------------------------------------------------------
            // CASE 2: SWIPE BACKWARD (PREVIOUS)
        // ---------------------------------------------------------
        else if (position === 0 && currentIndex > 0) {
            const newIndex = currentIndex - 1;

            const oldPrev = hymnPages[0];    // Becomes Current (TARGET)
            const oldCurrent = hymnPages[1]; // Becomes Next

            // 1. INSTANT UPDATE
            setHymnPages([null, oldPrev, oldCurrent]);
            setCurrentIndex(newIndex);

            // 2. SNAP PAGER BACK
            requestAnimationFrame(() => {
                pagerRef.current?.setPageWithoutAnimation(1);
            });

            // 3. RECOVERY FETCH (The Fix):
            // If the page we landed on (oldPrev) was empty/null, fetch it now.
            if (!oldPrev) {
                loadHymnDetails(hymns[newIndex].id).then(currData => {
                    setHymnPages(prev => [prev[0], currData, prev[2]]);
                });
            }

            // 4. PRELOAD PREVIOUS NEIGHBOR:
            if (newIndex > 0) {
                loadHymnDetails(hymns[newIndex - 1].id).then(newPrevData => {
                    setHymnPages(prev => [newPrevData, prev[1], prev[2]]);
                });
            }
        }
    }, [currentIndex, hymnPages, hymns, loadHymnDetails]);

    // Helpers
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