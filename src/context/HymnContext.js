import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchHymns, fetchHymnDetails } from '../services/hymnService';

const HymnContext = createContext();

export const useHymns = () => {
    const context = useContext(HymnContext);
    if (!context) {
        throw new Error('useHymns must be used within a HymnProvider');
    }
    return context;
};

export const HymnProvider = ({ children }) => {
    const [hymns, setHymns] = useState([]);
    const [favorites, setFavorites] = useState([]);
    const [recentHymns, setRecentHymns] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadHymns = async () => {
        try {
            setLoading(true);
            const hymnsData = await fetchHymns();
            setHymns(hymnsData);
        } catch (error) {
            console.error('Error loading hymns:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadHymnDetails = async (hymnId) => {
        try {
            const hymnData = await fetchHymnDetails(hymnId);
            addToRecent(hymnData);
            return hymnData;
        } catch (error) {
            console.error('Error loading hymn details:', error);
            throw error;
        }
    };

    const toggleFavorite = (hymn) => {
        setFavorites(prev => {
            const exists = prev.find(fav => fav.id === hymn.id);
            if (exists) {
                return prev.filter(fav => fav.id !== hymn.id);
            } else {
                return [...prev, hymn];
            }
        });
    };

    const addToRecent = (hymn) => {
        setRecentHymns(prev => {
            const filtered = prev.filter(recent => recent.id !== hymn.id);
            return [hymn, ...filtered].slice(0, 20); // Keep only last 20
        });
    };

    const isFavorite = (hymnId) => {
        return favorites.some(fav => fav.id === hymnId);
    };

    useEffect(() => {
        loadHymns();
    }, []);

    const value = {
        hymns,
        favorites,
        recentHymns,
        loading,
        loadHymns,
        loadHymnDetails,
        toggleFavorite,
        isFavorite,
    };

    return (
        <HymnContext.Provider value={value}>
            {children}
        </HymnContext.Provider>
    );
};
