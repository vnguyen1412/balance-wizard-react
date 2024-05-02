import { useEffect, useState } from 'react';
import { collection, getDocs, getFirestore } from 'firebase/firestore';

export const usePendingJournals = () => {
    const [pendingJournals, setPendingJournals] = useState([]);

    useEffect(() => {
        const fetchJournals = async () => {
            try {
                const db = getFirestore();
                const journalRef = collection(db, 'journalEntries');
                const journalsSnapshot = await getDocs(journalRef);
                const journalsData = journalsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                
                // Filter to get only pending journals and sort them by date
                const pending = journalsData.filter(journal => journal.status === 'pending');
                setPendingJournals(pending);
            } catch (err) {
                console.error('Error fetching journals:', err);
            }
        };

        fetchJournals();
    }, []);

    return { pendingJournals};
};
