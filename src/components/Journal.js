import React, { useState, useEffect } from 'react';
import { getFirestore, setDoc, collection, getDocs, doc, query, where, updateDoc, getDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { auth } from "../config/firebase";

const Journal = () => {
    const [addJournalEntry, setAddJournalEntry] = useState(false);
    const [newJournalData, setNewJournalData] = useState({
        /*debitAccountTitle: [null],
        debitLedgerRef: [null],
        debitAmount: [null],
        creditAccountTitle: [null],
        creditLedgerRef: [null],
        creditAmount: [null],
        explanation: ""*/
    });
    const [debitAccountTitle, setDebitAccountTitle] = useState([null]);
    const [debitLedgerRef, setDebitLedgerRef] = useState([null]);
    const [debitAmount, setDebitAmount] = useState([null]);
    const [creditAccountTitle, setCreditAccountTitle] = useState([null]);
    const [creditLedgerRef, setCreditLedgerRef] = useState([null]);
    const [creditAmount, setCreditAmount] = useState([null]);
    const [explanation, setexplanation] = useState("");
    const [sourceFile, setSourceFile] = useState(null);
    const [downloadURL, setDownloadURL] = useState(null);

    //array that will hold a list of the current accounts in the chart of accounts with their respective account number that will be used to reference the ledger(account)
    const [accountTitleList, setAccountTitleList] = useState([]);
    const [ledgerRefList, setLedgerRefList] = useState([]);
    const currentDate = new Date();

    // Get date components
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed, so we add 1
    const day = String(currentDate.getDate()).padStart(2, '0');

    // Get time components
    const hours = String(currentDate.getHours()).padStart(2, '0');
    const minutes = String(currentDate.getMinutes()).padStart(2, '0');
    const seconds = String(currentDate.getSeconds()).padStart(2, '0');

    // Format date and time as a string
    const currentDateTimeString = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
    const [error, setError] = useState(null)

    //set the "account" variable that contains an array of the accounts that exist based off of what is saved in the database 
    useEffect(() => {
        const fetchAccounts = async () => {
            try {
                const db = getFirestore();
                const accountsCollection = collection(db, 'accounts');
                const accountsSnapshot = await getDocs(accountsCollection);
                //potential issue that the two arrays will not line up correctly since they may not record the doc data in order
                const accountsName = accountsSnapshot.docs.map(doc => doc.data().accountName );
                setAccountTitleList(accountsName);
                const accountsNumber = accountsSnapshot.docs.map(doc => doc.data().accountNumber)
                setLedgerRefList(accountsNumber);

                console.log("here's the list of account names: " + accountTitleList);
                console.log("here's the list of account numbers: " + ledgerRefList);
            } catch (error) {
                setError(error.message);
            }
        };

        fetchAccounts();
    }, []); // Empty dependency array ensures the effect runs only once, on component mount

    const handleSubmitCreate = async (event) => {
        event.preventDefault(); // Prevent default form submission behavior
        
        // Calls your create journalEntry
        createJournalEntry();
    };

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

    const createJournalEntry = async () => {
        try {
            const db = getFirestore();
            setError(null)

            // Check for Negative Amounts
            if (debitAmount.some(amount => amount < 0) || creditAmount.some(amount => amount < 0)) {
                const errorMessage = await fetchErrorMessage('negativeAmount');
                throw new Error(errorMessage);
            }

            // Adjusted Check for Duplicate Entries
            const hasDuplicateDebit = new Set(debitAccountTitle.filter(title => title !== null)).size !== debitAccountTitle.filter(title => title !== null).length;
            const hasDuplicateCredit = new Set(creditAccountTitle.filter(title => title !== null)).size !== creditAccountTitle.filter(title => title !== null).length;
            if (hasDuplicateDebit || hasDuplicateCredit) {
                const errorMessage = await fetchErrorMessage('duplicateEntry');
                throw new Error(errorMessage);
            }

            // Check for Total Debits and Credits Mismatch
            const totalDebit = debitAmount.reduce((acc, curr) => acc + curr, 0);
            const totalCredit = creditAmount.reduce((acc, curr) => acc + curr, 0);
            if (totalDebit !== totalCredit) {
                const errorMessage = await fetchErrorMessage('totalDebitsCreditsMismatch');
                throw new Error(errorMessage);
            }

            //  Original Credit/Debit mismatch check
            /*

            //check to make sure that debit and credit are equal to each other
            let totalDebit = 0;
            let totalCredit = 0;
            for (const number of debitAmount) {
                totalDebit += number;
            }
            for (const number of creditAmount) {
                totalCredit += number;
            }
            if(totalCredit !== totalDebit) {
                throw new Error("debit and credit are not equal to each other!");
            }

            */

            //calls the method that deals with uploading the document to Firebase Storage
            //uploadSourceFile();

            console.log("here is the final debit account title array: " + debitAccountTitle)
            console.log("here is the final debit refs: " + debitLedgerRef)
            console.log("here is the final debit amount array: " + debitAmount)
            console.log("here is the final credit account title array: " + creditAccountTitle)
            console.log("here is the final credit refs: " + creditLedgerRef)
            console.log("here is the final credit amount array: " + creditAmount)
            console.log("here is the final explanation: " + explanation)

            const collectionRef = collection(db, "journalEntries");
            const docRef = await addDoc(collectionRef, {
                journalId: "J1",
                date: currentDateTimeString,
                debitAccountTitle: debitAccountTitle,
                debitLedgerRef: debitLedgerRef,
                debitAmount: debitAmount,
                creditAccountTitle: creditAccountTitle,
                creditLedgerRef: creditLedgerRef,
                creditAmount: creditAmount,
                explanation: explanation,
                sourceFile: downloadURL,
                status: "pending"
            });

            resetAddJournalForm()
        } catch (error) {
            setError(error.message)
        }
    };

    //upload the file to Firebase Storage
    const uploadSourceFile = () => {
        const storage = getStorage()

        //this creates  a storage reference for the file
        const storageRef = ref(storage, sourceFile.name);
        const uploadTask = uploadBytesResumable(storageRef, sourceFile)

        //listen for state changes, errors, and completion of the upload.
        uploadTask.on('state_changed',
            (snapshot) => {
                //Get the task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
                console.log("upload is " + progress + "& done")
                switch (snapshot.state) {
                    case 'paused':
                        console.log("Upload is paused");
                        break;
                    case 'running':
                        console.log('Upload is runnning');
                        break;
                }
            },
            (error) => {
                setError("Error uploading file: " + error);
            },
            () => {
                //upload is completed successfully, now we can get the download URL
                const url = getDownloadURL(uploadTask.snapshot.ref)
                setDownloadURL(url)
                /*getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                    console.log("File abailable at " + downloadURL);
                })*/
            }
            )
    }

    //adds more debit & credit transactions
    const addAdditionalEntry = (entryType) => {
        if(entryType === "Debit Entry") {
            let newArray = [...debitAccountTitle]
            newArray.push(null)
            setDebitAccountTitle(newArray)

            newArray = [...debitAmount]
            newArray.push(null)
            setDebitAmount(newArray)
        }
        else {
            let newArray = [...creditAccountTitle]
            newArray.push(null)
            setCreditAccountTitle(newArray)

            newArray = [...creditAmount]
            newArray.push(null)
            setCreditAmount(newArray)
        }
    }      

    const handleNewJournalData = (index) => (e) => {
        const { name, value} = e.target
        
        if(name === "debitAccountTitle") {
            const updatedItems = [...debitAccountTitle]
            updatedItems[index] = value
            setDebitAccountTitle(updatedItems)

            //these saves into another array that saves the account reference in the same index
            const index1 = accountTitleList.indexOf(value)
            const updatedRef = [...debitLedgerRef]
            updatedRef[index] = ledgerRefList[index1]
            setDebitLedgerRef(updatedRef)
        }
        else if(name === "debitAmount") {
            const updatedItems = [...debitAmount]
            updatedItems[index] = parseFloat(parseFloat(value).toFixed(2))
            setDebitAmount(updatedItems)
        }
        else if(name === "creditAccountTitle") {
            const updatedItems = [...creditAccountTitle]
            updatedItems[index] = value
            setCreditAccountTitle(updatedItems)

            //these saves into another array that saves the account reference in the same index
            const index1 = accountTitleList.indexOf(value)
            const updatedRef = [...creditLedgerRef]
            updatedRef[index] = ledgerRefList[index1]
            setCreditLedgerRef(updatedRef)
        }
        else if(name === "creditAmount") {
            const updatedItems = [...creditAmount]
            updatedItems[index] = parseFloat(parseFloat(value).toFixed(2))
            setCreditAmount(updatedItems)
        }
        else if(name === "explanation") {
            setexplanation(value)
        }
        else if(name === "sourceFile") {
            const file = e.target.files[0]
            setSourceFile(file)
        }
    };

    //this resets the Add Account popup when the user closes the popup
    const resetAddJournalForm = () => {
        setDebitAccountTitle([null])
        setDebitAmount([null])
        setDebitLedgerRef([null])
        setCreditAccountTitle([null])
        setCreditAmount([null])
        setCreditLedgerRef([null])
        setexplanation("")

        setError(null)

        setAddJournalEntry(false)
    }

    return (
        <div>
            <button onClick={() => setAddJournalEntry(true)}>Add Journal Entry</button> 
            <div className='overlay'>
                <h1 className="smallText">Search Account</h1>
                <textarea className='searchBar' placeholder='Search..' rows={1} cols={15} />
                <button className='searchPB'>Search</button>
            </div>
            {addJournalEntry && (
                <div className="popup">
                    <div className="popup-content">
                        <h2>Add Journal Entry</h2>
                        <form onSubmit={handleSubmitCreate}>
                            {/* debit entries */}
                            <h3>Debit Entry</h3>
                            <button onClick={() => addAdditionalEntry("Debit Entry")}>Add Debit Entry</button>
                            <table className="accounts-table">
                                <thead>
                                    <tr>
                                        <th>Account Title</th>
                                        <th>Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {debitAccountTitle.map((account, index) => (
                                        <tr key={index}>
                                            <td>
                                                <select name="debitAccountTitle" value={account} onChange={handleNewJournalData(index)} required>
                                                    <option value=""></option>
                                                    {accountTitleList.map((accountName, index) => (
                                                        <option key={index} value={accountName}>{accountName}</option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td>
                                                <input type="number" name="debitAmount" value={debitAmount[index]} onChange={handleNewJournalData(index)} required />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            
                            {/* credit entries */}
                            <h3>Credit Entry</h3>
                            <button onClick={() => addAdditionalEntry("Credit Entry")}>Add Credit Entry</button>
                            <table className="accounts-table">
                                <thead>
                                    <tr>
                                        <th>Account Title</th>
                                        <th>Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {creditAccountTitle.map((account, index) => (
                                        <tr key={index}>
                                            <td>
                                                <select name="creditAccountTitle" value={account} onChange={handleNewJournalData(index)} required>
                                                    <option value=""></option>
                                                    {accountTitleList.map((accountName, index) => (
                                                        <option key={index} value={accountName}>{accountName}</option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td>
                                                <input type="number" name="creditAmount" value={creditAmount[index]} onChange={handleNewJournalData(index)} required />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <div className="form-group">
                                <label htmlFor="explanation">Explanation:</label>
                                <input type="text" name="explanation" value={explanation} onChange={handleNewJournalData(null)} required />
                            </div>
                            {/*<div className="form-group">
                                <label htmlFor="sourceFile">Source File:</label>
                                <input type="file" name="sourceFile" value={sourceFile} onChange={handleNewJournalData(null)} required />
                            </div>*/}
                            <button type="submit">Add Journal Entry</button>
                            <button onClick={resetAddJournalForm}>Cancel</button>
                        </form>
                        {error && <p className="error-message">{error}</p>}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Journal;
