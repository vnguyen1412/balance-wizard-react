import { useEffect, useState } from 'react';
import { collection, getDocs, query, where, getFirestore } from 'firebase/firestore';

export const useFinancialRatios = () => {
    const [ratios, setRatios] = useState([]);

    useEffect(() => {
        const fetchRatios = async () => {
            try {
                let currentRatios = [];

                const db = getFirestore();
                const accountRef = collection(db, 'accounts');

                //this is just for reference and will be deleted later
                /*
                const accountCheckRef = collection(db, "accounts");
                const q = query(accountCheckRef, where("accountNumber", "==", finalAccountNumber));
                const querySnapshot = await getDocs(q);*/

                //calculate "Current Ratio"
                //calculating current assets
                let currentAssets = 0;
                const currentAssetQuery = query (accountRef, where("accountSubcategory", "==", "Current Asset"));
                const currentAssetSnapshot = await getDocs(currentAssetQuery);

                currentAssetSnapshot.forEach((doc) => {
                    currentAssets += doc.data().balance;
                });

                //calculating current liabilities
                let currentLiabilities = 0;
                const currentLiabilityQuery = query (accountRef, where("accountSubcategory", "==", "Current Liability"));
                const currentLiabilitiesSnapshot = await getDocs(currentLiabilityQuery);

                currentLiabilitiesSnapshot.forEach((doc) => {
                    currentLiabilities += doc.data().balance;
                });

                currentRatios.push(currentAssets / currentLiabilities);
                //setRatios([...ratios, currentAssets / currentLiabilities]);
                console.log("the current ratio is: " + currentAssets / currentLiabilities);


                //calculate "Asset Turnover Ratio"
                currentRatios.push(0);

                //calculate "Debit to Asset Ratio"
                let totalAssets = 0;
                const totalAssetQuery = query (accountRef, where("accountCategory", "==", "Asset"));
                const totalAssetSnapshot = await getDocs(totalAssetQuery);

                totalAssetSnapshot.forEach((doc) => {
                    totalAssets += doc.data().balance;
                });

                //calculating current liabilities
                let totalLiabilities = 0;
                const totalLiabilityQuery = query (accountRef, where("accountCategory", "==", "Liability"));
                const totalLiabilitiesSnapshot = await getDocs(totalLiabilityQuery);

                totalLiabilitiesSnapshot.forEach((doc) => {
                    totalLiabilities += doc.data().balance;
                });

                currentRatios.push(currentAssets / currentLiabilities);
                //setRatios([...ratios, totalLiabilities / totalAssets]);
                console.log("the debt to asset ratio is: " + totalLiabilities / totalAssets);

                console.log("here are the current ratios is the array: " + ratios);

                setRatios(currentRatios);
            } catch (err) {
                console.error('Error fetching journals:', err);
            }
        };

        fetchRatios();
    }, []);

    return { ratios };
};