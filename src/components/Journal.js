import React, { useState, useEffect } from 'react';
import { getFirestore, setDoc, collection, getDocs, doc, query, where, updateDoc, getDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { auth } from "../config/firebase";

const Journal = () => {
    const [addJournalEntry, setAddJournalEntry] = useState(false);
    const [newJournalData, setNewJournalData] = useState({
        debitAccountTitle: "",
        debitLedgerRef: null,
        debitAmount: null,
        creditAccountTitle: "",
        creditLedgerRef: null,
        debitAmount: null,
        explaination: ""
    });
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
    //a dictionary used to confirm if account number and account category formated correctly
    const accountCategoryFormat = {
        "Asset": 100,
        "Liability": 200,
        "Owner's and Stockholder's Equity": 300,
        "Revenue": 400,
        "Expenses": 500
    }
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
    const [error, setError] = useState(null)

    //what does this do
    useEffect(() => {
        const fetchAccounts = async () => {
            try {
                const db = getFirestore();
                const accountsCollection = collection(db, 'accounts');
                const accountsSnapshot = await getDocs(accountsCollection);
                const accountsData = accountsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
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
            //logic to check that the inputs are valid
            if(!isValidAccountNumber(newJournalData.accountNumber)) {
                throw new Error("Invalid Account Number Format")
            }

            //change Account Number & Balance data type to be number
            const finalAccountNumber = Number(newJournalData.accountNumber)
            const finalBalance = parseFloat(parseFloat(newJournalData.balance).toFixed(2)) //double parse because the toFixed() method will turn the float back into a string data type
            
            console.log("this is the starting range: ", accountCategoryFormat[newJournalData.accountCategory])
            
            //checks to see if the Account Number is with in the Account Category range
            if((accountCategoryFormat[newJournalData.accountCategory] > finalAccountNumber) || (accountCategoryFormat[newJournalData.accountCategory] + 100) <= finalAccountNumber ) {
                console.log("this error if-statement was triggered")
                throw new Error("Invalid! Account Number must match Account Category")
            }

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

            resetAddAccountForm()
        } catch (error) {
            setError(error.message)
        }
    };

    //future use for adding more debit & credit transactions
    const addAccountTitle = () => {

    }

    const isValidAccountNumber = (num) => {
        const regex = /^\d+$/;
        const accountNumberAsString = num.toString()
        return regex.test(accountNumberAsString)
    }
        

    const handleNewJournalData = (e) => {
        const { name, value } = e.target;
        setNewJournalData
        (prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const sortedAccounts = React.useMemo(() => {
        let sortableItems = [...accounts]; // Copy the accounts array to avoid direct mutation
        if (sortConfig.key !== null) {
            sortableItems.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (a[sortConfig.key] > b[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableItems;
    }, [accounts, sortConfig]);

    const requestSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    //this resets the Add Account popup when the user closes the popup
    const resetAddAccountForm = () => {
        setNewJournalData(prevAccountData => ({
            ...prevAccountData,
            accountNumber: 100,
            accountName: "",
            accountCategory: "Asset",
            accountSubcategory: "",
            normalBalance: "Debit",
            financialStatement: "Balance Statement",
            description: "",
            balance: null
        }))

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
                        <h3>Add Account</h3>
                        <form onSubmit={handleSubmitCreate}>
                            <div className="form-group">
                                <label htmlFor="accountNumber">Account Number:</label>
                                <input type="number" name="accountNumber" value={newJournalData.accountNumber} onChange={handleNewJournalData} required />
                            </div>
                            <div className="form-group">
                                <label htmlFor="accountName">Account Name:</label>
                                <input type="text" name="accountName" value={newJournalData.accountName} onChange={handleNewJournalData} required />
                            </div>
                            <div className="form-group">
                                <label htmlFor="accountCategory">Account Category:</label>
                                <select name="accountCategory" value={newJournalData.accountCategory} onChange={handleNewJournalData} required>
                                    <option value="Asset">Asset</option>
                                    <option value="Liability">Liability</option>
                                    <option value="Owner's and Stockholder's Equity">Owner's and Stockholder's Equity</option>
                                    <option value="Revenue">Revenue</option>
                                    <option value="Expense">Expense</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label htmlFor="accountSubcategory">Account Subcategory:</label>
                                <input type="text" name="accountSubcategory" value={newJournalData.accountSubcategory} onChange={handleNewJournalData} required />
                            </div>
                            <div className="form-group">
                                <label htmlFor="normalBalance">Normal Balance:</label>
                                <select name="normalBalance" value={newJournalData.normalBalance} onChange={handleNewJournalData} required>
                                    <option value="Debit">Debit</option>
                                    <option value="Credit">Credit</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label htmlFor="financialStatement">Financial Statement:</label>
                                <select name="financialStatement" value={newJournalData.financialStatement} onChange={handleNewJournalData} required>
                                    <option value="Balance Statement">Balance Statement</option>
                                    <option value="Income Statement">Income Statement</option>
                                    <option value="Retained Earning Statement">Retained Earning Statement</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label htmlFor="description">Description:</label>
                                <input type="text" name="description" value={newJournalData.description} onChange={handleNewJournalData} required />
                            </div>
                            <div className="form-group">
                                <label htmlFor="balance">Balance:</label>
                                <input type="number" name="balance" value={newJournalData.balance} onChange={handleNewJournalData} required />
                            </div>
                            <button type="submit">Add Account</button>
                            <button onClick={resetAddAccountForm}>Cancel</button>
                        </form>
                        {error && <p className="error-message">{error}</p>}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Journal;
