import {collection, doc, getDoc, updateDoc, getDocs, orderBy, query, where, limit} from 'firebase/firestore';
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
        // Check network connectivity first
            const isConnected = await checkNetworkConnection();
        if (!isConnected) {
            console.log('No internet connection for sync');
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
        // hymnId = String(hymnId).padStart(3, '0');

        console.log('Fetching hymn details for ID:', hymnId);

        // Check network connectivity first
            const isConnected = await checkNetworkConnection();

        if (!isConnected) {
            console.log('No internet connection, fetching from local storage');
            const localHymn = await fetchHymnById(hymnId);

            if (localHymn) {
                return localHymn;
            } else {
                throw new Error('Hymn not available offline. Please connect to the internet to download this hymn.');
            }
        }

        try {
            const hymnDoc = doc(db, 'hymns', hymnId);
            const hymnSnapshot = await getDoc(hymnDoc);

            if (hymnSnapshot.exists()) {
                return {
                    id: hymnSnapshot.id,
                    ...hymnSnapshot.data()
                };
            } else {
                // If not found on Firebase, check local storage as fallback
                console.log('Hymn not found on Firebase, checking local storage');
                const localHymn = await fetchHymnById(hymnId);

                if (localHymn) {
                    return localHymn;
                } else {
                    throw new Error('Hymn not found');
                }
            }
        } catch (firebaseError) {
            console.log('Firebase fetch failed, trying local storage:', firebaseError.message);

            // If Firebase fails but we have internet, still try local storage
            const localHymn = await fetchHymnById(hymnId);

            if (localHymn) {
                console.log('Found hymn in local storage');
                return localHymn;
            } else {
                throw firebaseError; // Re-throw original Firebase error
            }
        }

    } catch (error) {
        console.error('Error fetching hymn details:', error);
        throw error;
    }
};

export const updateHymnData = async (hymnId, hymnData) => {
    try {
        // Validate input
        if (!hymnId || typeof hymnId !== 'string') {
            throw new Error('Invalid hymn ID provided');
        }

        // Check network connectivity first
            const isConnected = await checkNetworkConnection();
        if (!isConnected) {
            throw new Error('No internet connection');
        }

        const hymnDoc = doc(db, 'hymns', hymnId);

        // Add updatedAt timestamp
        const updateData = {
            ...hymnData,
            updatedAt: new Date().toISOString()
        };

        await updateDoc(hymnDoc, updateData);

        console.log('Hymn updated successfully');
        return true;
    } catch (error) {
        console.error('Error updating hymn:', error);

        // Don't show alert here, let the calling function handle it
        if (error.message === 'No internet connection') {
            throw new Error('No internet connection available');
        } else {
            throw new Error('Failed to update hymn in database');
        }
    }
};

// Additional utility function to test connection to Firebase
export const testFirebaseConnection = async () => {
    try {
            const isConnected = await checkNetworkConnection();
        if (!isConnected) {
            return { connected: false, error: 'No internet connection' };
        }

        // Try to fetch a single document to test Firebase connection
        const hymnsCollection = collection(db, 'hymns');
        const testQuery = query(hymnsCollection, orderBy('number'), limit(1));
        const testSnapshot = await getDocs(testQuery);

        return {
            connected: true,
            documentsFound: testSnapshot.size,
            message: 'Firebase connection successful'
        };
    } catch (error) {
        console.error('Firebase connection test failed:', error);
        return {
            connected: false,
            error: error.message || 'Firebase connection failed'
        };
    }
};
