import {
    fetchHymnDetails,
    fetchHymns as fetchRemoteHymns,
    fetchUpdatedHymns,
    updateHymnData,
} from '../../services/hymnService';
import {
    fetchHymnById,
    fetchHymns as fetchLocalHymns,
    getLastSyncTime,
    hasLocalHymns,
    syncHymns as syncLocalHymns,
    updateHymnByFirebaseId,
} from '../../services/localHymnService';
import { Alert } from 'react-native';
import { saveLastSyncTime, loadLastSyncTime, deleteLastSyncTime } from './secureStoreUtils';

export const loadHymns = async (setHymns, setLoading, isOffline, offlineDownload) => {
    try {
        setLoading(true);
        let hymnsData = await fetchLocalHymns();
        const hasLocal = await hasLocalHymns();
        if (!hasLocal) {
            if (!offlineDownload || isOffline) {
                setHymns([]);
                if (!isOffline && !offlineDownload) {
                    try {
                        hymnsData = await fetchRemoteHymns();
                        setHymns(hymnsData || []);
                    } catch (remoteError) {
                        console.error('Failed to fetch remote hymns for display:', remoteError);
                        Alert.alert('Error', 'Failed to load hymns. Please enable offline download or check your connection.');
                    }
                } else if (isOffline) {
                    Alert.alert('No Hymns Available', 'Please connect to the internet or enable offline downloads to view hymns.', [
                        { text: 'OK' },
                    ]);
                }
            }
        } else {
            setHymns(hymnsData || []);
        }
    } catch (error) {
        console.error('Error loading hymns:', error);
        Alert.alert('Error', 'Failed to load hymns');
    } finally {
        setLoading(false);
    }
};

export const syncHymns = async (showLoadingState = true, setSyncing, setHymns, offlineDownload, isOffline, setProgress) => {
    if (isOffline) {
        if (showLoadingState) {
            Alert.alert('Offline', 'Cannot sync while offline.');
        }
        return false;
    }
    if (!offlineDownload) {
        if (showLoadingState) {
            Alert.alert('Offline Download Disabled', 'Please enable offline download to sync hymns.');
        }
        return false;
    }
    try {
        if (showLoadingState && setSyncing) setSyncing(true);
        if (setProgress) setProgress('Checking for updates...');
        const lastSyncTime = await loadLastSyncTime();
        const localLastSync = await getLastSyncTime();
        const syncFrom =
            lastSyncTime && localLastSync
                ? new Date(lastSyncTime) > new Date(localLastSync)
                    ? lastSyncTime
                    : localLastSync
                : lastSyncTime || localLastSync;
        if (setProgress) setProgress('Fetching updated hymns...');
        const updatedHymns = await fetchUpdatedHymns(syncFrom);
        if (updatedHymns && updatedHymns.length > 0) {
            if (setProgress) setProgress(`Updating ${updatedHymns.length} hymns...`);
            await syncLocalHymns(updatedHymns);
            const hymnsData = await fetchLocalHymns();
            setHymns(hymnsData);
            if (showLoadingState) {
                Alert.alert('Hymns Updated', `${updatedHymns.length} hymns have been updated.`);
            }
        } else if (showLoadingState) {
            Alert.alert('No Updates', 'Your offline hymns are up to date.');
        }
        const newSyncTime = new Date().toISOString();
        await saveLastSyncTime(newSyncTime);
        if (setProgress) setProgress('Sync complete!');
        return true;
    } catch (error) {
        console.error('Error syncing hymns:', error);
        if (showLoadingState) {
            Alert.alert('Sync Error', 'Failed to sync hymns. Please try again later.');
        }
        if (setProgress) setProgress(null);
        throw error;
    } finally {
        if (showLoadingState && setSyncing) setSyncing(false);
    }
};

export const forceSync = async (setHymns, setSyncing, isOffline, setProgress) => {
    if (isOffline) {
        Alert.alert('Offline', 'Cannot sync while offline.');
        return false;
    }
    try {
        setSyncing(true);
        if (setProgress) setProgress('Preparing to sync...');
        await deleteLastSyncTime();
        if (setProgress) setProgress('Fetching hymns from server...');
        const allHymns = await fetchRemoteHymns();
        if (allHymns && allHymns.length > 0) {
            if (setProgress) setProgress(`Downloading ${allHymns.length} hymns...`);
            await syncLocalHymns(allHymns);
            if (setProgress) setProgress('Updating local database...');
            const hymnsData = await fetchLocalHymns();
            setHymns(hymnsData);
            const newSyncTime = new Date().toISOString();
            await saveLastSyncTime(newSyncTime);
            if (setProgress) setProgress('Sync complete!');
            return true;
        } else {
            throw new Error('No hymns found on server');
        }
    } catch (error) {
        console.error('Error force syncing:', error);
        if (setProgress) setProgress(null);
        Alert.alert('Error', 'Failed to sync hymns.');
        return false;
    } finally {
        setSyncing(false);
    }
};

export const loadHymnDetails = async (hymnId, isOffline, addToRecent) => {
    try {
        let hymnData = await fetchHymnById(hymnId);
        if (!hymnData && !isOffline) {
            try {
                hymnData = await fetchHymnDetails(hymnId);
            } catch (remoteError) {
                console.error('Failed to fetch hymn details from remote:', remoteError);
            }
        }
        if (!hymnData) {
            throw new Error('Hymn not found');
        }
        await addToRecent(hymnData);
        return hymnData;
    } catch (error) {
        console.error('Error loading hymn details:', error);
        if (isOffline) {
            Alert.alert('Offline', 'This hymn is not available offline.');
        } else {
            Alert.alert('Error', 'Failed to load hymn details.');
        }
        throw error;
    }
};

export const updateHymn = async (firebaseId, hymnData, setHymns, isOffline) => {
    if (isOffline) {
        Alert.alert('Offline', 'Cannot update hymns while offline.');
        return false;
    }
    try {
        const updatedAt = new Date().toISOString();
        const updateData = { ...hymnData, updatedAt };
        await updateHymnData(firebaseId, updateData);
        await updateHymnByFirebaseId(firebaseId, updateData);
        setHymns((prevHymns) =>
            prevHymns.map((hymn) => (hymn.firebaseId === firebaseId ? { ...hymn, ...updateData } : hymn))
        );
        return true;
    } catch (error) {
        console.error('Error updating hymn:', error);
        Alert.alert('Error', 'Failed to update hymn.');
        throw error;
    }
};
