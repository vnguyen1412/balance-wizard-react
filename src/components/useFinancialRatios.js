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

                currentRatios.push(parseFloat(parseFloat(currentAssets / currentLiabilities).toFixed(2)));
                //setRatios([...ratios, currentAssets / currentLiabilities]);
                console.log("the current ratio is: " + currentAssets / currentLiabilities);


                //calculate "Asset Turnover Ratio"
                //calculate the Net Sales by adding Sales Revenue and Service Revenue
                let netSales = 0;
                const netSalesQuery = query (accountRef, where("accountName", "in", ["Sales Revenue", "Service Revenue"]));
                const netSalesSnapshot = await getDocs(netSalesQuery);

                netSalesSnapshot.forEach((doc) => {
                    netSales += doc.data().balance;
                });
                console.log("The current net sales are: " + netSales);

                //calulating current assets
                let totalAssets = 0;
                const totalAssetQuery = query (accountRef, where("accountCategory", "==", "Asset"));
                const totalAssetSnapshot = await getDocs(totalAssetQuery);

                totalAssetSnapshot.forEach((doc) => {
                    totalAssets += doc.data().balance;
                });
                currentRatios.push(parseFloat(parseFloat(netSales / totalAssets).toFixed(2)));

                console.log("The asset turnover is: " + netSales / totalAssets)

                //calculate "Debit to Asset Ratio"
                //already calculated total assets from above
                //calculating current liabilities
                let totalLiabilities = 0;
                const totalLiabilityQuery = query (accountRef, where("accountCategory", "==", "Liability"));
                const totalLiabilitiesSnapshot = await getDocs(totalLiabilityQuery);

                totalLiabilitiesSnapshot.forEach((doc) => {
                    totalLiabilities += doc.data().balance;
                });

                currentRatios.push(parseFloat(parseFloat(totalLiabilities / totalAssets).toFixed(2)));
                console.log("the debt to asset ratio is: " + totalLiabilities / totalAssets);

                setRatios(currentRatios);
                console.log("here are the current ratios is the array: " + ratios);

            } catch (err) {
                console.error('Error fetching journals:', err);
            }
        };

        fetchRatios();
    }, []);

    return { ratios };
};