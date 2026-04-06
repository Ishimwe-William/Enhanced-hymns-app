import React, { createContext, useContext, useEffect, useState } from 'react';
import { useUser } from './UserContext';
import { usePreferences } from './PreferencesContext';
import { useNetwork } from './NetworkContext';
import { fetchUpdatedHymns } from '../services/hymnService';
import {
  clearAllHymns,
  getLocalHymnCount,
  getLastSyncTime,
  syncHymns as localSyncHymns,
  fetchHymns as fetchLocalHymns
} from '../services/localHymnService';
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

    loadHymnDetails: (hymnId, callback) => loadHymnDetails(hymnId, isOffline, callback),

    loadAndTrackHymn: (hymnId) => loadHymnDetails(hymnId, isOffline, (hymn) => {
      if (hymn) {
        addToRecent(hymn, recentHymns, setRecentHymns, user?.uid, preferences.syncFavorites, isOffline);
      }
    }),

    // Delta sync explicitly for pulling updated lyrics
    checkAndUpdateLyrics: async () => {
      if (isOffline) {
        return { success: false, message: 'No internet connection available.' };
      }

      setSyncing(true);
      try {
        const lastSync = await getLastSyncTime();
        const updatedHymns = await fetchUpdatedHymns(lastSync);

        if (updatedHymns && updatedHymns.length > 0) {
          await localSyncHymns(updatedHymns);
          const updatedLocalHymns = await fetchLocalHymns();
          setHymns(updatedLocalHymns);

          return { success: true, count: updatedHymns.length, message: `Successfully downloaded ${updatedHymns.length} updated lyric(s).` };
        } else {
          return { success: true, count: 0, message: 'All lyrics are already up to date.' };
        }
      } catch (error) {
        console.error('Error checking for lyric updates:', error);
        return { success: false, message: 'Failed to check for lyric updates.' };
      } finally {
        setSyncing(false);
      }
    },

    toggleFavorite: (hymn) => toggleFavorite(hymn, favorites, setFavorites, user?.uid, preferences.syncFavorites, isOffline),
    isFavorite: (hymnId) => isFavorite(hymnId, favorites),
    updateHymn: (firebaseId, hymnData) => updateHymn(firebaseId, hymnData, setHymns, isOffline),
    getHymnDisplaySettings: () => getHymnDisplaySettings(preferences),
    getLocalHymnCount,
    clearUserData: () => clearUserData(user?.uid, setFavorites, setRecentHymns),
    clearRecentHymns: () => clearRecentHymns(user?.uid, setRecentHymns),
    clearFavorites: () => clearFavorites(user?.uid, setFavorites),

    forceSync: (progressCallback = null, downloadTunes = preferences.offlineTunes) =>
        forceSync(setHymns, setSyncing, isOffline, progressCallback, downloadTunes),

    isLoggedIn: !!user?.uid,
  };

  return <HymnContext.Provider value={value}>{children}</HymnContext.Provider>;
};