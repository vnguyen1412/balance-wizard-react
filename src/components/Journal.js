import React, { useState, useEffect } from 'react';
import { getFirestore, setDoc, collection, getDocs, doc, query, where, updateDoc, getDoc, addDoc, serverTimestamp } from 'firebase/firestore';
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
        explaination: ""*/
    });
    const [debitAccountTitle, setDebitAccountTitle] = useState([null]);
    const [debitAmount, setDebitAmount] = useState([null]);
    const [creditAccountTitle, setCreditAccountTitle] = useState([null]);
    const [creditAmount, setCreditAmount] = useState([null]);
    const [explaination, setExplaination] = useState("")

    const [accounts, setAccounts] = useState([]);
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
                const accountsData = accountsSnapshot.docs.map(doc => doc.data().accountName );
                setAccounts(accountsData);
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

    const createJournalEntry = async () => {
        try {
            const db = getFirestore();

            //change Account Number & Balance data type to be number
            const finalAccountNumber = Number(newJournalData.accountNumber)
            const finalBalance = parseFloat(parseFloat(newJournalData.balance).toFixed(2)) //double parse because the toFixed() method will turn the float back into a string data type

            //make sure that the account number doesn't exist yet
            const accountCheckRef = collection(db, "accounts");
            const q = query(accountCheckRef, where("accountNumber", "==", finalAccountNumber));
            const querySnapshot = await getDocs(q);

            if(querySnapshot.docs.length > 0) {
                console.log("this if-statement was triggered")
                throw new Error("Account number already exist")
            }
            
            //make sure the account name doesn't exist yet
            const qAccountName = query(accountCheckRef, where("accountName", "==", newJournalData.accountName))
            const queryAccountNameSnapshot = await getDocs(qAccountName)

            if(queryAccountNameSnapshot.docs.length > 0) {
                console.log("this second if-statement was triggered")
                throw new Error("Account name already exist")
            }

            console.log("you have reach the end and the account will be created")
            //creates a document based on the account number & name and add the account to the database
            const docName = newJournalData.accountNumber + " " +newJournalData.accountName
            console.log("name of the document: " + docName)
            console.log(newJournalData.accountNumber)
            const accountRef = doc(db, "accounts", docName);
            await setDoc(accountRef, {
                accountNumber: finalAccountNumber,
                accountName: newJournalData.accountName,
                accountCategory: newJournalData.accountCategory,
                accountSubcategory: newJournalData.accountSubcategory,
                normalBalance: newJournalData.normalBalance,
                financialStatement: newJournalData.financialStatement,
                description: newJournalData.description,
                balance: finalBalance,
                date: currentDateTimeString,
                isActive: true
            });

            resetAddJournalForm()
        } catch (error) {
            setError(error.message)
        }
    };

    //future use for adding more debit & credit transactions
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
        }
        else if(name === "debitAmount") {
            const updatedItems = [...debitAmount]
            updatedItems[index] = value
            setDebitAmount(updatedItems)
        }
        else if(name === "creditAccountTitle") {
            const updatedItems = [...creditAccountTitle]
            updatedItems[index] = value
            setCreditAccountTitle(updatedItems)
        }
        else if(name === "creditAmount") {
            const updatedItems = [...creditAmount]
            updatedItems[index] = value
            setCreditAmount(updatedItems)
        }
        else if(name === "explaination") {
            setExplaination(value)
        }

        console.log("here are the debit titles: " + debitAccountTitle)
        console.log("here are the debit amount: " + debitAmount)
    };

    //this resets the Add Account popup when the user closes the popup
    const resetAddJournalForm = () => {
        {/*setNewJournalData(prevAccountData => ({
            ...prevAccountData,
            accountNumber: 100,
            accountName: "",
            accountCategory: "Asset",
            accountSubcategory: "",
            normalBalance: "Debit",
            financialStatement: "Balance Statement",
            description: "",
            balance: null
        }))*/}

        setDebitAccountTitle([null])
        setDebitAmount([null])
        setCreditAccountTitle([null])
        setCreditAmount([null])
        setExplaination("")

        setError(null)

        setAddJournalEntry(false)
    }

    return (
        <div>
            <button onClick={() => setAddJournalEntry(true)}>Add Account</button> 
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
                                                {/*<input type="text" name="debitAccountTitle" value={account} onChange={handleNewJournalData(index)} required />*/}
                                                <select name="debitAccountTitle" value={account} onChange={handleNewJournalData(index)} required>
                                                    <option value=""></option>
                                                    {accounts.map((accountName, index) => (
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
                                                {/*<input type="text" name="debitAccountTitle" value={account} onChange={handleNewJournalData(index)} required />*/}
                                                <select name="creditAccountTitle" value={account} onChange={handleNewJournalData(index)} required>
                                                    <option value=""></option>
                                                    {accounts.map((accountName, index) => (
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
                                <label htmlFor="explaination">Expaination:</label>
                                <input type="text" name="explaination" value={explaination} onChange={handleNewJournalData(null)} required />
                            </div>
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
