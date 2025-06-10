export const getFilteredHymns = (hymns, preferences) => {
    let filteredHymns = [...hymns];
    if (preferences.display && preferences.display.hiddenCategories) {
        filteredHymns = filteredHymns.filter(
            (hymn) => !preferences.display.hiddenCategories.includes(hymn.category)
        );
    }
    return filteredHymns;
};

export const getHymnDisplaySettings = (preferences) => {
    return {
        fontSize: preferences.fontSize || 'medium',
        showChords: preferences.display?.showChords !== false,
        showVerseNumbers: preferences.display?.showVerseNumbers !== false,
        lineSpacing: preferences.display?.lineSpacing || 'normal',
        theme: preferences.theme || 'light',
    };
};
