import React, { useState } from 'react';
import { getAuth } from '@firebase/auth';
import { getFirestore, setDoc, collection, getDocs, doc, query, where, updateDoc, getDoc, addDoc, serverTimestamp } from 'firebase/firestore';

// Assuming the mock data and initial component setup is already provided

const ChartOfAccounts = () => {
    const [addAccountPopup, setAddAccountPopup] = useState(false);
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

    const accounts = [
        { accountNumber: 101, accountName: 'Cash', accountCategory: 'Asset', accountSubcategory: 'Current Asset', normalBalance: 'Debit', financialStatement: 'Balance Sheet', description: 'Cash in hand and bank balances', balance: 5000, creationDate: '2024-01-01' },
        { accountNumber: 102, accountName: 'Accounts Receivable', accountCategory: 'Asset', accountSubcategory: 'Current Asset', normalBalance: 'Debit', financialStatement: 'Balance Sheet', description: 'Amounts owed by customers', balance: 2500, creationDate: '2024-01-02' },
        // Add accounts from user
    ];

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
                date: serverTimestamp(),
                isActive: true
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
            <button onClick={() => setAddAccountPopup(true)}>Add Account</button> {/* Button to open the create user popup */}
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
                        <th onClick={() => requestSort('creationDate')}>Creation Date</th>
                    </tr>
                </thead>
                <tbody>
                    {sortedAccounts.map((account, index) => (
                        <tr key={index}>
                            <td>
                                <input type="checkbox"/>
                            </td>
                            <td>{account.accountNumber}</td>
                            <td>{account.accountName}</td>
                            <td>{account.accountCategory}</td>
                            <td>{account.accountSubcategory}</td>
                            <td>{account.normalBalance}</td>
                            <td>{account.financialStatement}</td>
                            <td>{account.description}</td>
                            <td>{account.balance}</td>
                            <td>{account.creationDate}</td>
                            {/* Table rows remain unchanged */}
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
        </div>
    );
};

export default ChartOfAccounts;
