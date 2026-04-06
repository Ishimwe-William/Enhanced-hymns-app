import {collection, doc, getDoc, updateDoc, getDocs, orderBy, query, where} from 'firebase/firestore';
import {db} from "../config/firebaseConfig";
import {fetchHymnById} from "./localHymnService";
import NetInfo from "@react-native-community/netinfo";

const checkNetworkConnection = async () => {
    const netInfo = await NetInfo.fetch();
    return netInfo.isConnected;
};
export const fetchHymns = async () => {
        const isConnected = await checkNetworkConnection();
    try {
        // Check network connectivity first
        if (!isConnected) {
            throw new Error('No internet connection');
        }

        const hymnsCollection = collection(db, 'hymns');
        const hymnsQuery = query(hymnsCollection, orderBy('number')); // Fixed: use 'number' instead of 'hymn_number'
        const hymnsSnapshot = await getDocs(hymnsQuery);

        return hymnsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error('Error fetching hymns:', error);

        // Don't show alert here, let the calling function handle it
        if (error.message === 'No internet connection') {
            throw new Error('No internet connection available');
        } else {
            throw new Error('Failed to fetch hymns from database');
        }
    }
};
export const fetchUpdatedHymns = async (since) => {
    try {
            const isConnected = await checkNetworkConnection();
        if (!isConnected) {
            return [];
        }

        const hymnsCollection = collection(db, 'hymns');
        let q;

        if (since) {
            // Convert string to Firestore timestamp if needed
            const sinceDate = typeof since === 'string' ? new Date(since) : since;
            q = query(
                hymnsCollection,
                where('updatedAt', '>', sinceDate.toISOString()),
                orderBy('updatedAt')
            );
        } else {
            q = query(hymnsCollection, orderBy('number')); // Fixed: use 'number'
        }

        const hymnsSnapshot = await getDocs(q);
        return hymnsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error('Error fetching updated hymns:', error);

        // Return empty array instead of throwing to allow graceful degradation
        if (error.message.includes('No internet')) {
            return [];
        }
        throw error;
    }
};
export const fetchHymnDetails = async (hymnId) => {
    try {
        // CRITICAL FIX: Ensure ID exists and is strictly a string to prevent Firebase indexOf crashes
        if (!hymnId) throw new Error('No hymn ID provided');
        const safeHymnId = String(hymnId);

        // Check network connectivity first
        const isConnected = await checkNetworkConnection();

        if (!isConnected) {
            const localHymn = await fetchHymnById(safeHymnId);

            if (localHymn) {
                return localHymn;
            } else {
                throw new Error('Hymn not available offline. Please connect to the internet to download this hymn.');
            }
        }

        try {
            // Firebase call now safely uses the forced string
            const hymnDoc = doc(db, 'hymns', safeHymnId);
            const hymnSnapshot = await getDoc(hymnDoc);

            if (hymnSnapshot.exists()) {
                return {
                    id: hymnSnapshot.id,
                    ...hymnSnapshot.data()
                };
            } else {
                const localHymn = await fetchHymnById(safeHymnId);
                if (localHymn) return localHymn;
                throw new Error('Hymn not found');
            }
        } catch (firebaseError) {
            const localHymn = await fetchHymnById(safeHymnId);
            if (localHymn) return localHymn;
            throw firebaseError;
        }

    } catch (error) {
        console.error('Error fetching hymn details:', error);
        throw error;
    }
};

export const updateHymnData = async (hymnId, hymnData) => {
    try {
        if (!hymnId) throw new Error('Invalid hymn ID provided');

        // CRITICAL FIX: Force string
        const safeHymnId = String(hymnId);

        const isConnected = await checkNetworkConnection();
        if (!isConnected) {
            throw new Error('No internet connection');
        }

        const hymnDoc = doc(db, 'hymns', safeHymnId);

        const updateData = {
            ...hymnData,
            updatedAt: new Date().toISOString()
        };

        await updateDoc(hymnDoc, updateData);
        return true;
    } catch (error) {
        console.error('Error updating hymn:', error);
        if (error.message === 'No internet connection') {
            throw new Error('No internet connection available');
        } else {
            throw new Error('Failed to update hymn in database');
        }
    }
};