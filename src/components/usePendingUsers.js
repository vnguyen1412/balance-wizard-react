import { useEffect, useState } from 'react';
import { collection, getDocs, getFirestore } from 'firebase/firestore';

export const usePendingUsers = () => {
    const [pendingUsers, setPendingUsers] = useState([]);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const db = getFirestore();
                const usersRef = collection(db, 'users');
                const usersSnapshot = await getDocs(usersRef);
                const usersData = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

                
                // Filter to get only pending users and sort them by firstName
                const pending = usersData.filter(user => user.status === 'Pending');
                setPendingUsers(pending);
            } catch (err) {
                console.error('Error fetching users:', err);
            }
        };

        fetchUsers();
    }, []);

    return { pendingUsers };
};
