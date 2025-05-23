import {collection, doc, getDoc, updateDoc, getDocs, orderBy, query} from 'firebase/firestore';
import {Alert} from "react-native";
import {db} from "../config/firebaseConfig";

export const fetchHymns = async () => {
    try {
        const hymnsCollection = collection(db, 'hymns');
        const hymnsQuery = query(hymnsCollection, orderBy('number'));
        const hymnsSnapshot = await getDocs(hymnsQuery);

        return hymnsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }))
    } catch (error) {
        console.error('Error fetching hymns:', error);
        Alert.alert('Error', 'Failed to fetch hymns from database');
    }
};

// Fetch detailed hymn data
export const fetchHymnDetails = async (hymnId) => {
    try {
        const hymnDoc = doc(db, 'hymns', hymnId);
        const hymnSnapshot = await getDoc(hymnDoc);

        if (hymnSnapshot.exists()) {
            return ({
                id: hymnSnapshot.id,
                ...hymnSnapshot.data()
            });
        }
    } catch (error) {
        console.error('Error fetching hymn details:', error);
        Alert.alert('Error', 'Failed to fetch hymn details');
    }
};

// Update hymn data
export const updateHymnData = async (hymnId, hymnData) => {
    try {
        const hymnDoc = doc(db, 'hymns', hymnId);
        await updateDoc(hymnDoc, {
            ...hymnData,
            updatedAt: new Date().toISOString()
        });

        console.log('Hymn updated successfully');
        return true;
    } catch (error) {
        console.error('Error updating hymn:', error);
        Alert.alert('Error', 'Failed to update hymn in database');
        throw error;
    }
};
