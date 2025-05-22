import {collection, doc, getDoc, getDocs, orderBy, query} from 'firebase/firestore';
import {Alert} from "react-native";
import {db} from "../config/firebaseConfig";

// export const fetchHymns = async () => {
//     // Simulate API delay
//     await new Promise(resolve => setTimeout(resolve, 1000));
//
//     return [
//         {id: '1', number: 1, title: 'Holy, Holy, Holy!', origin: 'Traditional'},
//         {id: '2', number: 2, title: 'How Great Thou Art', origin: 'Swedish Folk Melody'},
//         {id: '3', number: 3, title: 'To God Be the Glory', origin: 'Fanny Crosby'},
//         {id: '4', number: 4, title: 'Great Is Thy Faithfulness', origin: 'Thomas Chisholm'},
//         {id: '5', number: 5, title: 'Blessed Assurance', origin: 'Fanny Crosby'},
//         {id: '6', number: 6, title: 'Amazing Grace', origin: 'John Newton'},
//         {id: '7', number: 7, title: 'Be Thou My Vision', origin: 'Irish Traditional'},
//         {id: '8', number: 8, title: 'Jesus Loves Me', origin: 'Anna B. Warner'},
//     ];
// };

// export const fetchHymnDetails = async (hymnId) => {
//     // Simulate API delay
//     await new Promise(resolve => setTimeout(resolve, 800));
//
//     // Mock hymn data
//     return {
//         id: hymnId,
//         number: 1,
//         title: 'Holy, Holy, Holy!',
//         origin: 'Traditional',
//         doh: 'Eb',
//         stanzas: [
//             {
//                 stanzaNumber: 1,
//                 text: `Holy, holy, holy! Lord God Almighty!
// Early in the morning our song shall rise to thee!
// holy, holy! holy! merciful and mighty!
// God in three persons, blessed Trinity!`
//             },
//             {
//                 stanzaNumber: 2,
//                 text: `Holy, holy, holy! All the saints adore thee,
// casting down their golden crowns
// around the glassy sea;
// cherubim and seraphim falling down
// before thee, which wert, and art, and
// evermore shalt be.`
//             },
//             {
//                 stanzaNumber: 3,
//                 text: `Holy, holy, holy! Though the darkness hide thee,
// though the eye of sinful man thy glory may not see,
// only thou art holy; there is none beside thee
// perfect in power, in love, and purity.`
//             }
//         ],
//         refrains: [
//             {
//                 refrainNumber: 1,
//                 text: `Holy, holy, holy! Merciful and mighty!
// God in three persons, blessed Trinity!`
//             }
//         ]
//     };
// };
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
