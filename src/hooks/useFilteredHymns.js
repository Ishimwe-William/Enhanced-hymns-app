import {useMemo} from 'react';

export const useFilteredHymns = (hymns = [], searchQuery = '') => {
    return useMemo(() => {
        const query = searchQuery.trim().toLowerCase();
        if (!query) return hymns;


        return hymns.filter(hymn =>
            hymn.title?.toLowerCase().includes(query) ||
            hymn.number?.toString().includes(query) ||
            hymn.origin?.toLowerCase().includes(query) ||
            hymn.stanzas?.some(stanza =>
                stanza.text.toLowerCase().includes(query)
            ) ||
            hymn.refrains?.some(refrain =>
                refrain.text.toLowerCase().includes(query)
            )
        );
    }, [hymns, searchQuery]);
};
