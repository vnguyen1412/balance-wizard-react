import React, { useState, useEffect } from 'react';
import { getFirestore, collection, getDocs, getDoc, doc, updateDoc } from 'firebase/firestore';

const EditJournalEntry = ({ entry, onSave, onCancel }) => {
    const [debitEntries, setDebitEntries] = useState(entry?.debitEntries || [{ accountTitle: '', amount: '' }]);
    const [creditEntries, setCreditEntries] = useState(entry?.creditEntries || [{ accountTitle: '', amount: '' }]);
    const [editedEntry, setEditedEntry] = useState({
        debitAccountTitle: entry.debitAccountTitle.slice(),
        debitLedgerRef: entry.debitLedgerRef.slice(),
        debitAmount: entry.debitAmount.slice(),
        creditAccountTitle: entry.creditAccountTitle.slice(),
        creditLedgerRef: entry.creditLedgerRef.slice(),
        creditAmount: entry.creditAmount.slice(),
        explanation: entry.explanation,
        sourceFile: entry.sourceFile
    });

    const [originalEntry, setOriginalEntry] = useState({
        originalDebitAccountTitle: entry.debitAccountTitle.slice(),
        originalDebitLedgerRef: entry.debitLedgerRef.slice(),
        originalDebitAmount: entry.debitAmount.slice(),
        originalCreditAccountTitle: entry.creditAccountTitle.slice(),
        originalCreditLedgerRef: entry.creditLedgerRef.slice(),
        originalCreditAmount: entry.creditAmount.slice(),
    });

    //get accounts name and number for the dropdown in the edit box
    const [accountTitleList, setAccountTitleList] = useState([]);
    const [ledgerRefList, setLedgerRefList] = useState([]);
    const [error, setError] = useState(null);

    //set the "account" variable that contains an array of the accounts that exist based off of what is saved in the database 
    useEffect(() => {
        const fetchAccounts = async () => {
            try {
                const db = getFirestore();
                const accountsCollection = collection(db, 'accounts');
                const accountsSnapshot = await getDocs(accountsCollection);
                const accountsName = accountsSnapshot.docs.map(doc => doc.data().accountName );
                setAccountTitleList(accountsName);
                const accountsNumber = accountsSnapshot.docs.map(doc => doc.data().accountNumber)
                setLedgerRefList(accountsNumber);
            } catch (error) {
                console.log(error.message);
            }
        };

        fetchAccounts();
    }, []); // Empty dependency array ensures the effect runs only once, on component mount

    const handleInputChange = (e, index) => {
        const { name, value } = e.target;
        const updatedEntry = { ...editedEntry };
        if(name === "debitAmount" || name === "creditAmount") {
            updatedEntry[name][index] = parseFloat(parseFloat(value).toFixed(2));
        }
        else if(name === "debitAccountTitle") {
            updatedEntry[name][index] = value;

            const index1 = accountTitleList.indexOf(value)
            updatedEntry["debitLedgerRef"][index] = ledgerRefList[index1]
        }
        else if(name === "creditAccountTitle") {
            updatedEntry[name][index] = value;

            const index1 = accountTitleList.indexOf(value)
            updatedEntry["creditLedgerRef"][index] = ledgerRefList[index1]
        }
        else {
            updatedEntry[name][index] = value;
        }
        setEditedEntry(updatedEntry);
    };

    //gets the list of error messages from the database
    const fetchErrorMessage = async (errorId) => {
        const db = getFirestore();
        const errorDocRef = doc(db, 'errors', errorId);
        const errorDoc = await getDoc(errorDocRef);
    
        if (errorDoc.exists()) {
            return errorDoc.data().errorMessage;
        } else {
            console.log('No such document!');
            return 'An unexpected error occurred';
        }
    };

    const handleSave = async() => {
        try{
            if(editedEntry.explanation === undefined){
                editedEntry.explanation = null;
            }

            //check to make sure that credit and debit amounts are equal
            const totalDebit = editedEntry.debitAmount.reduce((acc, curr) => acc + curr, 0);
            const totalCredit = editedEntry.creditAmount.reduce((acc, curr) => acc + curr, 0);
            if (totalDebit !== totalCredit) {
                const errorMessage = await fetchErrorMessage('totalDebitsCreditsMismatch');
                throw new Error(errorMessage);
            }

            //check to see if the edited account was previously an approved account
            if(entry.status === "approved") {
                removeJournalFromLedger();
            }

            editedEntry.status = "pending";
            onSave(editedEntry);
        }
        catch(error) {
            setError(error.message);
        }
    };

    //if the journal entry that was edited was an approved entry then the respective entry must be removed from the ledgers
    const removeJournalFromLedger = async() => {

        //remove debit related journal entries
        for(let i = 0; i < originalEntry.originalDebitAccountTitle.length; i++) {
            let accountId = originalEntry.originalDebitLedgerRef[i] + " " + originalEntry.originalDebitAccountTitle[i];
            let accountRef = doc(getFirestore(), "accounts", accountId);
            let accountSnapshot = await getDoc(accountRef);
            let accountData = accountSnapshot.data();

            //find which index in the account is the journal entry located at
            let index = accountData.listOfJournalRefs.indexOf(entry.journalId);

            //recalculated the balances after the edited journal entry and if the account's normal balance type is the same then turn the amount to be a negative to subtract
            let amount = originalEntry.originalDebitAmount[i];
            if(accountData.normalBalance === "Debit") {
                amount *= -1;
            }
            for(let j = index + 1; j < accountData.listOfBalances.length; j++) {
                accountData.listOfBalances[j] += amount;
            }

            //removes the corresponding indexes from the list fields in the account
            let updatedAmountTypeList = accountData["listOfAmountType"].filter((_, i) => i !== index);
            let updatedAmountList = accountData["listOfAmounts"].filter((_, i) => i !== index);
            let updatedBalanceList = accountData["listOfBalances"].filter((_, i) => i !== index);
            let updatedDateList = accountData["listOfDates"].filter((_, i) => i !== index);
            let updatedJournalRefList = accountData["listOfJournalRefs"].filter((_, i) => i !== index);

            let newBalance = accountData.balance + amount;

            //update the account
            await updateDoc(accountRef, {
                listOfAmountType: updatedAmountTypeList,
                listOfAmounts: updatedAmountList,
                listOfBalances: updatedBalanceList,
                listOfDates: updatedDateList,
                listOfJournalRefs: updatedJournalRefList,
                balance: newBalance
            });
        }

        //remove credit related journal entries
        for(let i = 0; i < originalEntry.originalCreditAccountTitle.length; i++) {
            let accountId = originalEntry.originalCreditLedgerRef[i] + " " + originalEntry.originalCreditAccountTitle[i];
            let accountRef = doc(getFirestore(), "accounts", accountId);
            let accountSnapshot = await getDoc(accountRef);
            let accountData = accountSnapshot.data();
            //find which index in the account is the journal entry located at
            let index = accountData.listOfJournalRefs.indexOf(entry.journalId);

            //recalculated the balances after the edited journal entry and if the account's normal balance type is the same then turn the amount to be a negative to subtract
            let amount = originalEntry.originalCreditAmount[i];
            if(accountData.normalBalance === "Credit") {
                amount *= -1;
            }
            for(let j = index + 1; j < accountData.listOfBalances.length; j++) {
                accountData.listOfBalances[j] += amount;
            }

            //removes the corresponding indexes from the list fields in the account
            let updatedAmountTypeList = accountData["listOfAmountType"].filter((_, i) => i !== index);
            let updatedAmountList = accountData["listOfAmounts"].filter((_, i) => i !== index);
            let updatedBalanceList = accountData["listOfBalances"].filter((_, i) => i !== index);
            let updatedDateList = accountData["listOfDates"].filter((_, i) => i !== index);
            let updatedJournalRefList = accountData["listOfJournalRefs"].filter((_, i) => i !== index);

            let newBalance = accountData.balance + amount;

            //update the account
            await updateDoc(accountRef, {
                listOfAmountType: updatedAmountTypeList,
                listOfAmounts: updatedAmountList,
                listOfBalances: updatedBalanceList,
                listOfDates: updatedDateList,
                listOfJournalRefs: updatedJournalRefList,
                balance: newBalance
            });
        }
    }

    const handleAddEntry = (field) => {
        setEditedEntry({ ...editedEntry, [field]: [...editedEntry[field], ''] });
    };

    //removes the related account title, ledger reference, and amounts from the respective arrays
    const handleRemoveEntry = (field, index) => {
        const updatedEntries = editedEntry[field].filter((_, i) => i !== index);

        let refField = "debitLedgerRef";
        let amountField = "debitAmount";
        if(field === "creditAccountTitle") {
            refField = "creditLedgerRef";
            amountField = "creditAmount";
        }

        const updatedRefs = editedEntry[refField].filter((_, i) => i !== index);
        const updatedAmounts = editedEntry[amountField].filter((_, i) => i !== index);
        setEditedEntry({ ...editedEntry, [field]: updatedEntries, [refField]: updatedRefs, [amountField]: updatedAmounts});
    };

    return (
        <div className="popup">
            <div className="popup-content">
                <span className="close" onClick={onCancel}>&times;</span>
                <h2>Edit Journal Entry</h2>
                <div>
                    {/* Debit Entries */}
                    <h3>Debit Entry</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>Account Title</th>
                                <th>Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {editedEntry.debitAccountTitle.map((accountTitle, index) => (
                                <tr key={index}>
                                    <td>
                                        <select name="debitAccountTitle" value={accountTitle} onChange={(e) => handleInputChange(e, index)} required>
                                            <option value=""></option>
                                            {accountTitleList.map((accountName, index) => (
                                                <option key={index} value={accountName}>{accountName}</option>
                                            ))}
                                        </select>
                                    </td>
                                    <td>
                                        <input
                                            type="number"
                                            name="debitAmount"
                                            value={editedEntry.debitAmount[index]}
                                            onChange={(e) => handleInputChange(e, index)}
                                        />
                                    </td>
                                    <button onClick={() => handleRemoveEntry('debitAccountTitle', index)}>Remove</button>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <button onClick={() => handleAddEntry('debitAccountTitle')}>Add Debit Entry</button>

                    {/* Credit Entries */}
                    <h3>Credit Entry</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>Account Title</th>
                                <th>Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {editedEntry.creditAccountTitle.map((accountTitle, index) => (
                                <tr key={index}>
                                    <td>
                                        <select name="creditAccountTitle" value={accountTitle} onChange={(e) => handleInputChange(e, index)} required>
                                            <option value=""></option>
                                            {accountTitleList.map((accountName, index) => (
                                                <option key={index} value={accountName}>{accountName}</option>
                                            ))}
                                        </select>
                                    </td>
                                    <td>
                                        <input
                                            type="number"
                                            name="creditAmount"
                                            value={editedEntry.creditAmount[index]}
                                            onChange={(e) => handleInputChange(e, index)}
                                        />
                                    </td>
                                    <button onClick={() => handleRemoveEntry('creditAccountTitle', index)}>Remove</button>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <button onClick={() => handleAddEntry('creditAccountTitle')}>Add Credit Entry</button>

                    {/* Explanation and Source File */}
                    <div>
                        <label>Explanation:</label>
                        <input
                            type="text"
                            name="explanation"
                            value={editedEntry.explanation}
                            onChange={(e) => handleInputChange(e)}
                        />
                    </div>
                </div>
                <button onClick={handleSave}>Save</button>
                <button onClick={onCancel}>Cancel</button>
                {error && <p className="error-message">{error}</p>}
            </div>
        </div>
    );
};

export default EditJournalEntry;
