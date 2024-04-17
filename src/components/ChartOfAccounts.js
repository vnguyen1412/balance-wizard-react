import React, { useState, useEffect } from 'react';
import { getFirestore, setDoc, collection, getDocs, doc, query, where, updateDoc, getDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { auth } from "../config/firebase";

const ChartOfAccounts = () => {
    const [addAccountPopup, setAddAccountPopup] = useState(false);
    const [editAccountPopup, setEditAccountPopup] = useState(false);
    const [selectedAccount, setSelectedAccount] = useState(null);
    const [newAccountData, setNewAccountData] = useState({
        accountNumber: 100,
        accountName: "",
        accountCategory: "Asset",
        accountSubcategory: "",
        normalBalance: "Debit",
        financialStatement: "Balance Statement",
        description: "",
        balance: null
    });
    const [accounts, setAccounts] = useState([]);
    const currentDate = new Date();

    const [searchBar, setSearchBar] = useState('');
    const handleSearchSubmit = (event) => {
        event.preventDefault(); 
        const searchTerm = event.target.searchBarTxt.value;
        setSearchBar(searchTerm);
    };

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

    useEffect(() => {
        const fetchAccounts = async () => {
            try {
                const db = getFirestore();
                const accountsCollection = collection(db, 'accounts');
                const accountsSnapshot = await getDocs(accountsCollection);
                const accountsData = accountsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                if (searchBar != ""){
                    const filteredData = accountsData.filter(account => account.accountName === searchBar);
                    setAccounts(filteredData);
                } else {
                    setAccounts(accountsData);
                }
            } catch (error) {
                setError(error.message);
            }
        };

        fetchAccounts();
    }, [searchBar]); // Empty dependency array ensures the effect runs only once, on component mount

    const handleSubmitEdit = async (event) => {
        event.preventDefault(); // Prevent default form submission behavior
        // Logic for updating the selected account in Firestore
        try {
            const user = auth.currentUser;
            const db = getFirestore();
            const accountRef = doc(db, 'accounts', selectedAccount.id);
            
            // Fetch the current document to obtain a copy before changes
            const oldAccountSnapshot = await getDoc(accountRef);
            const oldAccountData = oldAccountSnapshot.data();

            // Log the user ID, previous account data, and updated account data
            try {
                const logRef = doc(db, "changeLog", "Account Edit " + currentDateTimeString)

                await setDoc(logRef, {
                    userId: user.uid,
                    action: 'Account edited', // You can customize this based on your needs
                    accountBeforeChanges: oldAccountData, // Assuming selectedAccount holds the account state before changes
                    accountAfterChanges: selectedAccount,
                    timestamp: serverTimestamp() // Timestamp of when the change was made
                });
            } catch (error) {
                console.error('Error logging changes:', error);
            }
            // Update the account document with the new data
            await setDoc(accountRef, selectedAccount);
            setEditAccountPopup(false);

            // Update the local state with the edited account data
            setAccounts(accounts.map(account => {
                if (account.id === selectedAccount.id) {
                    return selectedAccount;
                }
                return account;
            }));
        } catch (error) {
            setError(error.message);
        }
    };

    const handleSubmitCreate = async (event) => {
        event.preventDefault(); // Prevent default form submission behavior
        
        // Call your editUser function or any other form handling logic here
        createAccount();
    };

    const createAccount = async () => {
        try {
            const db = getFirestore();
            //logic to check that the inputs are valid
            if(!isValidAccountNumber(newAccountData.accountNumber)) {
                throw new Error("Invalid Account Number Format")
            }

            //change Account Number & Balance data type to be number
            const finalAccountNumber = Number(newAccountData.accountNumber)
            const finalBalance = parseFloat(parseFloat(newAccountData.balance).toFixed(2)) //double parse because the toFixed() method will turn the float back into a string data type
            
            console.log("this is the starting range: ", accountCategoryFormat[newAccountData.accountCategory])
            
            //checks to see if the Account Number is with in the Account Category range
            if((accountCategoryFormat[newAccountData.accountCategory] > finalAccountNumber) || (accountCategoryFormat[newAccountData.accountCategory] + 100) <= finalAccountNumber ) {
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
            const qAccountName = query(accountCheckRef, where("accountName", "==", newAccountData.accountName))
            const queryAccountNameSnapshot = await getDocs(qAccountName)

            if(queryAccountNameSnapshot.docs.length > 0) {
                console.log("this second if-statement was triggered")
                throw new Error("Account name already exist")
            }

            console.log("you have reach the end and the account will be created")
            //creates a document based on the account number & name and add the account to the database
            const docName = newAccountData.accountNumber + " " +newAccountData.accountName
            console.log("name of the document: " + docName)
            console.log(newAccountData.accountNumber)
            const accountRef = doc(db, "accounts", docName);
            await setDoc(accountRef, {
                accountNumber: finalAccountNumber,
                accountName: newAccountData.accountName,
                accountCategory: newAccountData.accountCategory,
                accountSubcategory: newAccountData.accountSubcategory,
                normalBalance: newAccountData.normalBalance,
                financialStatement: newAccountData.financialStatement,
                description: newAccountData.description,
                balance: finalBalance,
                date: currentDateTimeString,
                isActive: true,
                listOfDates: [],
                listOfExplainations: [],
                listOfJournalRefs: [],
                listOfAmountType: [],
                listOfAmounts: [],
                listOfBalances: []
            });

            resetAddAccountForm()
        } catch (error) {
            setError(error.message)
        }
    };

    const isValidAccountNumber = (num) => {
        const regex = /^\d+$/;
        const accountNumberAsString = num.toString()
        return regex.test(accountNumberAsString)
    }
        

    const handleNewAccountData = (e) => {
        const { name, value } = e.target;
        setNewAccountData
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
        setNewAccountData(prevAccountData => ({
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

        setAddAccountPopup(false)
    }
    
    return (
        <div>
            <button onClick={() => setAddAccountPopup(true)}>Add Account</button> 
            <button onClick={() => setEditAccountPopup(true)}>Edit Account</button>
            <form onSubmit={handleSearchSubmit} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', margin: '10px'}}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <input name="searchBarTxt" type="text" placeholder='Search Accounts..' style={{ display: 'block', marginBottom: '5px', width: '170px', textAlign: 'center'}} />
                    <button type="submit" style={{ display: 'block' }}>Search</button>
                </div>
            </form>
            <table className="accounts-table">
                <thead>
                    <tr>
                        {/* Update the header cells to call requestSort with the corresponding key */}
                        <td></td> {/* blank stop for colum of check boxes (is not "th" otherwise it will trigger the clickable header) */}
                        <th onClick={() => requestSort('accountNumber')}>Account Number</th>
                        <th onClick={() => requestSort('accountName')}>Account Name</th>
                        <th onClick={() => requestSort('accountCategory')}>Account Category</th>
                        <th onClick={() => requestSort('accountSubcategory')}>Account Subcategory</th>
                        <th onClick={() => requestSort('normalBalance')}>Normal Balance</th>
                        <th onClick={() => requestSort('financialStatement')}>Financial Statement</th>
                        <th onClick={() => requestSort('description')}>Description</th>
                        <th onClick={() => requestSort('balance')}>Balance</th>
                        <th onClick={() => requestSort('date')}>Creation Date</th>
                    </tr>
                </thead>
                <tbody>
                    {sortedAccounts.map((account, index) => (
                        <tr key={index}>
                            <td>
                                <input
                                    type="radio"
                                    name="selectedAccount"
                                    onChange={() => setSelectedAccount(account)}
                                    checked={selectedAccount === account}
                                />                           
                            </td>
                            <td>{account.accountNumber}</td>
                            <td>{account.accountName}</td>
                            <td>{account.accountCategory}</td>
                            <td>{account.accountSubcategory}</td>
                            <td>{account.normalBalance}</td>
                            <td>{account.financialStatement}</td>
                            <td>{account.description}</td>
                            <td>{account.balance}</td>
                            <td>{account.date}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {addAccountPopup && (
                <div className="popup">
                    <div className="popup-content">
                        <h3>Add Account</h3>
                        <form onSubmit={handleSubmitCreate}>
                            <div className="form-group">
                                <label htmlFor="accountNumber">Account Number:</label>
                                <input type="number" name="accountNumber" value={newAccountData.accountNumber} onChange={handleNewAccountData} required />
                            </div>
                            <div className="form-group">
                                <label htmlFor="accountName">Account Name:</label>
                                <input type="text" name="accountName" value={newAccountData.accountName} onChange={handleNewAccountData} required />
                            </div>
                            <div className="form-group">
                                <label htmlFor="accountCategory">Account Category:</label>
                                <select name="accountCategory" value={newAccountData.accountCategory} onChange={handleNewAccountData} required>
                                    <option value="Asset">Asset</option>
                                    <option value="Liability">Liability</option>
                                    <option value="Owner's and Stockholder's Equity">Owner's and Stockholder's Equity</option>
                                    <option value="Revenue">Revenue</option>
                                    <option value="Expense">Expense</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label htmlFor="accountSubcategory">Account Subcategory:</label>
                                <input type="text" name="accountSubcategory" value={newAccountData.accountSubcategory} onChange={handleNewAccountData} required />
                            </div>
                            <div className="form-group">
                                <label htmlFor="normalBalance">Normal Balance:</label>
                                <select name="normalBalance" value={newAccountData.normalBalance} onChange={handleNewAccountData} required>
                                    <option value="Debit">Debit</option>
                                    <option value="Credit">Credit</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label htmlFor="financialStatement">Financial Statement:</label>
                                <select name="financialStatement" value={newAccountData.financialStatement} onChange={handleNewAccountData} required>
                                    <option value="Balance Statement">Balance Statement</option>
                                    <option value="Income Statement">Income Statement</option>
                                    <option value="Retained Earning Statement">Retained Earning Statement</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label htmlFor="description">Description:</label>
                                <input type="text" name="description" value={newAccountData.description} onChange={handleNewAccountData} required />
                            </div>
                            <div className="form-group">
                                <label htmlFor="balance">Balance:</label>
                                <input type="number" name="balance" value={newAccountData.balance} onChange={handleNewAccountData} required />
                            </div>
                            <button type="submit">Add Account</button>
                            <button onClick={resetAddAccountForm}>Cancel</button>
                        </form>
                        {error && <p className="error-message">{error}</p>}
                    </div>
                </div>
            )}
            {editAccountPopup && selectedAccount && (
                <div className="popup">
                    <div className="popup-content">
                        <h3>Edit Account</h3>
                        <form onSubmit={handleSubmitEdit}>
                            <div className="form-group">
                                <label htmlFor="editAccountNumber">Account Number:</label>
                                <input type="number" name="editAccountNumber" value={selectedAccount.accountNumber} onChange={(e) => setSelectedAccount(prevAccount => ({ ...prevAccount, accountNumber: e.target.value }))} required />
                            </div>
                            <div className="form-group">
                                <label htmlFor="editAccountName">Account Name:</label>
                                <input type="text" name="editAccountName" value={selectedAccount.accountName} onChange={(e) => setSelectedAccount(prevAccount => ({ ...prevAccount, accountName: e.target.value }))} required />
                            </div>
                            <div className="form-group">
                                <label htmlFor="editAccountCategory">Account Category:</label>
                                <select name="editAccountCategory" value={selectedAccount.accountCategory} onChange={(e) => setSelectedAccount(prevAccount => ({ ...prevAccount, accountCategory: e.target.value }))} required>
                                    <option value="Asset">Asset</option>
                                    <option value="Liability">Liability</option>
                                    <option value="Owner's and Stockholder's Equity">Owner's and Stockholder's Equity</option>
                                    <option value="Revenue">Revenue</option>
                                    <option value="Expense">Expense</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label htmlFor="editAccountSubcategory">Account Subcategory:</label>
                                <input type="text" name="editAccountSubcategory" value={selectedAccount.accountSubcategory} onChange={(e) => setSelectedAccount(prevAccount => ({ ...prevAccount, accountSubcategory: e.target.value }))} required />
                            </div>
                            <div className="form-group">
                                <label htmlFor="editNormalBalance">Normal Balance:</label>
                                <select name="editNormalBalance" value={selectedAccount.normalBalance} onChange={(e) => setSelectedAccount(prevAccount => ({ ...prevAccount, normalBalance: e.target.value }))} required>
                                    <option value="Debit">Debit</option>
                                    <option value="Credit">Credit</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label htmlFor="editFinancialStatement">Financial Statement:</label>
                                <select name="editFinancialStatement" value={selectedAccount.financialStatement} onChange={(e) => setSelectedAccount(prevAccount => ({ ...prevAccount, financialStatement: e.target.value }))} required>
                                    <option value="Balance Statement">Balance Statement</option>
                                    <option value="Income Statement">Income Statement</option>
                                    <option value="Retained Earning Statement">Retained Earning Statement</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label htmlFor="editDescription">Description:</label>
                                <input type="text" name="editDescription" value={selectedAccount.description} onChange={(e) => setSelectedAccount(prevAccount => ({ ...prevAccount, description: e.target.value }))} required />
                            </div>
                            <div className="form-group">
                                <label htmlFor="editBalance">Balance:</label>
                                <input type="number" name="editBalance" value={selectedAccount.balance} onChange={(e) => setSelectedAccount(prevAccount => ({ ...prevAccount, balance: e.target.value }))} required />
                            </div>
                            <button type="submit">Save Changes</button>
                            <button onClick={() => setEditAccountPopup(false)}>Cancel</button>
                        </form>
                        {error && <p className="error-message">{error}</p>}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChartOfAccounts;
