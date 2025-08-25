import React, { createContext, useContext, useEffect, useState } from 'react';
import { useUser } from './UserContext';
import { usePreferences } from './PreferencesContext';
import { useNetwork } from './NetworkContext';
import {clearAllHymns, getLocalHymnCount} from '../services/localHymnService';
import {
  loadHymns,
  loadHymnDetails,
  updateHymn,
  forceSync, syncHymns,
} from '../utils/hymns/hymnUtils';
import {
    toggleFavorite,
    addToRecent,
    clearRecentHymns,
    clearFavorites,
    clearUserData,
    isFavorite, loadUserData,
} from '../utils/hymns/userHymnUtils';
import { getFilteredHymns, getHymnDisplaySettings } from '../utils/hymns/hymnDisplayUtils';

const HymnContext = createContext();

export const useHymns = () => {
  const context = useContext(HymnContext);
  if (!context) {
    throw new Error('useHymns must be used within a HymnProvider');
  }
  return context;
};

export const HymnProvider = ({ children, dbInitialized }) => {
  const [hymns, setHymns] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [recentHymns, setRecentHymns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const { user, authInitialized } = useUser();
  const { preferences } = usePreferences();
  const { isOffline, isOnWifi } = useNetwork();

  useEffect(() => {
    if (authInitialized && user?.uid) {
      loadUserData(user?.uid, preferences.syncFavorites, isOffline, setFavorites, setRecentHymns);
    }
  }, [user?.uid, preferences.syncFavorites, isOffline, authInitialized]);

  useEffect(() => {
    if (dbInitialized) {
      loadHymns(setHymns, setLoading, isOffline, preferences.offlineDownload);
    }
  }, [dbInitialized, isOffline, preferences.offlineDownload]);

  useEffect(() => {
    if (authInitialized && !user?.uid) {
      clearUserData(user?.uid, setFavorites, setRecentHymns);
    }
  }, [user?.uid, authInitialized]);

  const value = {
    hymns: getFilteredHymns(hymns, preferences),
    favorites,
    recentHymns,
    clearAllHymns,
    loading,
    syncing,
    isOffline,
    isOnWifi,
    syncHymns: () => syncHymns(true, setSyncing, setHymns, preferences.offlineDownload, isOffline),
    loadHymns: () => loadHymns(setHymns, setLoading, isOffline, preferences.offlineDownload),
    loadHymnDetails: (hymnId) => loadHymnDetails(hymnId, isOffline, (hymn) => addToRecent(hymn, recentHymns, setRecentHymns, user?.uid, preferences.syncFavorites, isOffline)),
    toggleFavorite: (hymn) => toggleFavorite(hymn, favorites, setFavorites, user?.uid, preferences.syncFavorites, isOffline),
    isFavorite: (hymnId) => isFavorite(hymnId, favorites),
    updateHymn: (firebaseId, hymnData) => updateHymn(firebaseId, hymnData, setHymns, isOffline),
    getHymnDisplaySettings: () => getHymnDisplaySettings(preferences),
    getLocalHymnCount,
    clearUserData: () => clearUserData(user?.uid, setFavorites, setRecentHymns),
    clearRecentHymns: () => clearRecentHymns(user?.uid, setRecentHymns),
    clearFavorites: () => clearFavorites(user?.uid, setFavorites),
    forceSync: () => forceSync(setHymns, setSyncing, isOffline, null, preferences.offlineTunes),
    isLoggedIn: !!user?.uid,
  };

  return <HymnContext.Provider value={value}>{children}</HymnContext.Provider>;
};
