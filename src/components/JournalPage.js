import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import BalanceWizardLogo from './BalanceWizardLogo.jpg';
import Journal from './Journal';
import EditJournalEntry from './EditJournalEntry';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './Styling.css';
import { useUser } from './userContext';
// Firestore imports
import { collection, getDocs, getDoc, getFirestore, doc, updateDoc } from 'firebase/firestore';
import { database } from '../config/firebase'; // Ensure you have a firebase config file

const JournalPage = () => {
    const { user, handleSignOut } = useUser();
    const [startDate, setStartDate] = useState(new Date('January 1, 2000'));
    const [pendingJournalEntries, setPendingJournalEntries] = useState([]);
    const [approvedJournalEntries, setApprovedJournalEntries] = useState([]);
    const [rejectedJournalEntries, setRejectedJournalEntries] = useState([]);
    const [endDate, setEndDate] = useState(new Date());
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [editedEntry, setEditedEntry] = useState(null);
    const [editId, setEditId] = useState(null);

    useEffect(() => {
       fetchJournalEntries();
    }, []);
    // Function to fetch journal entries
    const fetchJournalEntries = async () => {
        try {
            const db = getFirestore();
            const journalRef = collection(db, 'journalEntries');
            const journalSnapshot = await getDocs(journalRef);
            const journalData = journalSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            const filteredEntries = journalData.filter(entry => {
                const entryDate = new Date(entry.date);
                return entryDate >= startDate && entryDate <= endDate;
            });

            const current = filteredEntries.filter(entry => entry.status === 'approved');
            const pending = filteredEntries.filter(entry => entry.status === 'pending');
            const rejected = filteredEntries.filter(entry => entry.status === 'rejected');
            setApprovedJournalEntries(current);
            setPendingJournalEntries(pending);
            setRejectedJournalEntries(rejected);
        } catch (error) {
            console.error('Error fetching Journal Entries:', error);
        }
    };

    const approveEntry = async (id) => {
        // Access the specific journal entry in Firestore using the journalId
        // and update its status to 'approved'
        const journalRef = doc(getFirestore(), "journalEntries", id);
        await updateDoc(journalRef, {
            status: "approved"
        });

        //making changes to the respective ledgers/accounts that the journal entry affects
        updateLedger(id);

        fetchJournalEntries();
    };

    const updateLedger = async (id) => {
        //retrieves all of the data from the document
        const journalRef = doc(getFirestore(), "journalEntries", id);
        const docSnapshot = await getDoc(journalRef);
        const docData = docSnapshot.data();

        //loops through the debit transactions
        for(let i = 0; i < docData.debitAccountTitle.length; i++) {
            //creates a reference the the account that is affected by the transaction
            //then retrieves the data of the account to be updated
            let accountId = docData.debitLedgerRef[i] + " " + docData.debitAccountTitle[i];
            let accountRef = doc(getFirestore(), "accounts", accountId);
            let accountSnapshot = await getDoc(accountRef);
            let accountData = accountSnapshot.data();

            //update the listOfAmountType
            let currentListOfAmountType = accountData.listOfAmountType;
            currentListOfAmountType.push("debit");

            //update the listOfAmounts
            let currentListOfAmounts = accountData.listOfAmounts;
            currentListOfAmounts.push(docData.debitAmount[i]);

            //update the listOfBalances
            let currentListOfBalances = accountData.listOfBalances;
            let newBalance = 0;
            if(accountData.normalBalance === "Debit") {
                newBalance = accountData.balance + docData.debitAmount[i];
            }
            else {
                newBalance = accountData.balance - docData.debitAmount[i];
            }
            currentListOfBalances.push(newBalance);

            //update the listOfDates
            let currentListOfDates = accountData.listOfDates;
            currentListOfDates.push(docData.date);

            //update the listOfJournalRefs
            let currentListOfJournalRefs = accountData.listOfJournalRefs;
            currentListOfJournalRefs.push(docData.journalId);

            console.log("Here is the new listOfAmountType for " + accountData.accountName + ": " + currentListOfAmountType);
            console.log("Here is the new listOfAmounts for " + accountData.accountName + ": " + currentListOfAmounts);
            console.log("Here is the new listOfBalances for " + accountData.accountName + ": " + currentListOfBalances);
            console.log("Here is the new listOfDates for " + accountData.accountName + ": " + currentListOfDates);
            console.log("Here is the new listOfJournalRefs for " + accountData.accountName + ": " + currentListOfJournalRefs);
            console.log("Here is the new balance for " + accountData.accountName + ": " + newBalance);

            await updateDoc(accountRef, {
                listOfAmountType: currentListOfAmountType,
                listOfAmounts: currentListOfAmounts,
                listOfBalances: currentListOfBalances,
                listOfDates: currentListOfDates,
                listOfJournalRefs: currentListOfJournalRefs,
                balance: newBalance
            });
        }

        //loops through the credit transactions
        for(let i = 0; i < docData.creditAccountTitle.length; i++) {
            //creates a reference the the account that is affected by the transaction
            //then retrieves the data of the account to be updated
            let accountId = docData.creditLedgerRef[i] + " " + docData.creditAccountTitle[i];
            let accountRef = doc(getFirestore(), "accounts", accountId);
            let accountSnapshot = await getDoc(accountRef);
            let accountData = accountSnapshot.data();

            //update the listOfAmountType
            let currentListOfAmountType = accountData.listOfAmountType;
            currentListOfAmountType.push("credit");

            //update the listOfAmounts
            let currentListOfAmounts = accountData.listOfAmounts;
            currentListOfAmounts.push(docData.creditAmount[i]);

            //update the listOfBalances
            let currentListOfBalances = accountData.listOfBalances;
            let newBalance = 0;
            if(accountData.normalBalance === "Credit") {
                newBalance = accountData.balance + docData.creditAmount[i];
            }
            else {
                newBalance = accountData.balance - docData.creditAmount[i];
            }
            currentListOfBalances.push(newBalance);

            //update the listOfDates
            let currentListOfDates = accountData.listOfDates;
            currentListOfDates.push(docData.date);

            //update the listOfJournalRefs
            let currentListOfJournalRefs = accountData.listOfJournalRefs;
            currentListOfJournalRefs.push(docData.journalId);

            console.log("Here is the new listOfAmountType for " + accountData.accountName + ": " + currentListOfAmountType);
            console.log("Here is the new listOfAmounts for " + accountData.accountName + ": " + currentListOfAmounts);
            console.log("Here is the new listOfBalances for " + accountData.accountName + ": " + currentListOfBalances);
            console.log("Here is the new listOfDates for " + accountData.accountName + ": " + currentListOfDates);
            console.log("Here is the new listOfJournalRefs for " + accountData.accountName + ": " + currentListOfJournalRefs);
            console.log("Here is the new balance for " + accountData.accountName + ": " + newBalance);

            await updateDoc(accountRef, {
                listOfAmountType: currentListOfAmountType,
                listOfAmounts: currentListOfAmounts,
                listOfBalances: currentListOfBalances,
                listOfDates: currentListOfDates,
                listOfJournalRefs: currentListOfJournalRefs,
                balance: newBalance
            });
        }
    }
    
    const denyEntry = async (id) => {
        // Similar to approveEntry, but sets the status to 'denied'
        const reason = window.prompt("Please enter the reason for rejection:");

        const journalRef = doc(getFirestore(), "journalEntries", id);
        await updateDoc(journalRef, {
            status: "rejected",
            rejectionReason: reason, // Add the rejection reason to the document
        });
        fetchJournalEntries();
    };

    const openEditModal = (entry) => {
        setEditId(entry.id)
        setEditedEntry(entry);
        setEditModalVisible(true);
    };
    
    const closeEditModal = () => {
        setEditedEntry(null);
        setEditModalVisible(false);
    };
    
    const handleSaveEdit = async (editedEntry) => {
        try {
            // Update the entry in Firestore
            const entryRef = doc(getFirestore(), 'journalEntries', editId);
            await updateDoc(entryRef, editedEntry);
    
            // Close the edit modal after saving
            closeEditModal();
            
            // Fetch the updated journal entries
            fetchJournalEntries();
        } catch (error) {
            console.error('Error saving edited entry:', error);
        }
    };
    
    
    

    return (
        <div>
            <div className="container">
                <div className="balance-wizard-section">
                    <Link to="/"><img src={BalanceWizardLogo} alt="logo" className="logo" /></Link>
                    <div>
                        <h1 className="title">Balance Wizard</h1>
                        {user.username && (
                            <div className="user-fullname">{`${user.firstName} ${user.lastName}`}</div>)
                        }
                    </div>
                </div>
                <div className="auth-section">
                    {user.username ? (
                        <>
                            <div className="profile-column">
                                <img src={user.profilePic} alt="Profile Picture" className="profile-pic" />
                                <div className="username-display">{user.username}</div>
                                <button onClick={handleSignOut}>Logout</button>
                            </div>
                        </>
                    ) : (
                        <>
                            <Link to="/login"><button>Login</button></Link>
                            <span> | </span>
                            <Link to="/create-account"><button>New User</button></Link>
                        </>
                    )}
                </div>
            </div>

            <div className="menu-bar">
                {user.username ? (
                    <>
                        {user.role === 'Accountant' && (
                            <>
                                <Link to="/send-email"><button className='menuBarButtons'>Send Email</button></Link>
                                <Link to="/chart"><button className='menuBarButtons'>Charts</button></Link>
                                <Link to="/journal"><button className='menuBarButtons'>Journals</button></Link>
                            </>
                        )}
                        {(user.role === 'Manager' || user.role === 'Administrator') && (
                            <>
                                <Link to="/admin-interface"><button className='menuBarButtons'>Admin Interface</button></Link>
                                <Link to="/send-email"><button className='menuBarButtons'>Send Email</button></Link>
                                <Link to="/chart"><button className='menuBarButtons'>Charts</button></Link>
                                <Link to="/journal"><button className='menuBarButtons'>Journals</button></Link>
                            </>
                        )}
                    </>
                ) : (
                    <div>Please login to navigate the application</div>
                )}
            </div>
            {editModalVisible && (
                <EditJournalEntry
                    entry={editedEntry}
                    onSave={handleSaveEdit}
                    onCancel={closeEditModal}
                />
            )}

            <div className="blue-box">
                <div className="user-box">
                    <div className='overlay'>
                        <h1 className="smallText">Search Account</h1>
                        <textarea className='searchBar' placeholder='Search..' rows={1} cols={15} />
                        <button className='searchPB'>Search</button>
                    </div>
                    <div className="title-container">
                        <h2 className="user-box-title">Journal Entries</h2>
                        <Journal />
                        <h3>Date Filter</h3>
                        <DatePicker selected={startDate} onChange={(date) => setStartDate(date)} className="calendar-input" />
                        <DatePicker selected={endDate} onChange={(date) => setEndDate(date)} className="calendar-input" />
                        <body></body>
                        <button onClick={() => fetchJournalEntries()}>Apply Filter</button>
                    </div>
                    {/* Pending Journal Entries Table */}
                    <div className="user-box">
                        <h3>Pending Journal Entries</h3>
                        <table>
                            <thead>
                                <tr>
                                    <th>Journal ID</th>
                                    <th>Date</th>
                                    <th>Debit Account Title</th>
                                    <th>Debit Ledger Ref</th>
                                    <th>Debit Amount</th>
                                    <th>Credit Account Title</th>
                                    <th>Credit Ledger Ref</th>
                                    <th>Credit Amount</th>
                                    <th>Explanation</th>
                                    <th>Source File</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pendingJournalEntries.map(entry => (
                                    <tr key={entry.journalId}>
                                        <td>{entry.journalId}</td>
                                        <td>{entry.date}</td>
                                        <td>{entry.debitAccountTitle.join(", ")}</td>
                                        <td>{entry.debitLedgerRef.join(", ")}</td>
                                        <td>{entry.debitAmount.join(", ")}</td>
                                        <td>{entry.creditAccountTitle.join(", ")}</td>
                                        <td>{entry.creditLedgerRef.join(", ")}</td>
                                        <td>{entry.creditAmount.join(", ")}</td>
                                        <td>{entry.explanation}</td>
                                        <td>
                                            <a href={entry.sourceFile} target="_blank" rel="noopener noreferrer">View File</a>
                                        </td>
                                        <td>
                                            {user.role === "Manager" && (
                                                <>
                                                    <button onClick={() => openEditModal(entry)}>Edit</button>
                                                    <button onClick={() => approveEntry(entry.id)}>Approve</button>
                                                    <button onClick={() => denyEntry(entry.id)}>Deny</button>
                                                </>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {/* Display Approved Journal Entries */}
                    <div className="user-box">
                        <h3>Approved Journal Entries</h3>
                        <table>
                            <thead>
                                <tr>
                                    <th>Journal ID</th>
                                    <th>Date</th>
                                    <th>Debit Account Title</th>
                                    <th>Debit Ledger Ref</th>
                                    <th>Debit Amount</th>
                                    <th>Credit Account Title</th>
                                    <th>Credit Ledger Ref</th>
                                    <th>Credit Amount</th>
                                    <th>Explanation</th>
                                    <th>Source File</th>
                                </tr>
                            </thead>
                            <tbody>
                                {approvedJournalEntries.map(entry => (
                                    <tr key={entry.journalId}>
                                        <td>{entry.journalId}</td>
                                        <td>{entry.date}</td>
                                        <td>{entry.debitAccountTitle.join(", ")}</td>
                                        <td>{entry.debitLedgerRef.join(", ")}</td>
                                        <td>{entry.debitAmount.join(", ")}</td>
                                        <td>{entry.creditAccountTitle.join(", ")}</td>
                                        <td>{entry.creditLedgerRef.join(", ")}</td>
                                        <td>{entry.creditAmount}</td>
                                        <td>{entry.explanation}</td>
                                        <td>
                                            <a href={entry.sourceFile} target="_blank" rel="noopener noreferrer">View File</a>
                                        </td>
                                        <td>
                                            {user.role === "Manager" && (
                                                <>
                                                    <button onClick={() => openEditModal(entry)}>Edit</button>
                                                </>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {/* Rejected Journal Entries Table */}
                    <div className="user-box">
                        <h3>Rejected Journal Entries</h3>
                        <table>
                            <thead>
                                <tr>
                                    <th>Journal ID</th>
                                    <th>Date</th>
                                    <th>Debit Account Title</th>
                                    <th>Debit Ledger Ref</th>
                                    <th>Debit Amount</th>
                                    <th>Credit Account Title</th>
                                    <th>Credit Ledger Ref</th>
                                    <th>Credit Amount</th>
                                    <th>Explanation</th>
                                    <th>Rejection Reason</th>
                                    <th>Source File</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rejectedJournalEntries.map(entry => (
                                    <tr key={entry.journalId}>
                                        <td>{entry.journalId}</td>
                                        <td>{entry.date}</td>
                                        <td>{entry.debitAccountTitle.join(", ")}</td>
                                        <td>{entry.debitLedgerRef.join(", ")}</td>
                                        <td>{entry.debitAmount.join(", ")}</td>
                                        <td>{entry.creditAccountTitle.join(", ")}</td>
                                        <td>{entry.creditLedgerRef.join(", ")}</td>
                                        <td>{entry.creditAmount.join(", ")}</td>
                                        <td>{entry.explanation}</td>
                                        <td>{entry.rejectionReason}</td>
                                        <td>
                                            <a href={entry.sourceFile} target="_blank" rel="noopener noreferrer">View File</a>
                                        </td>
                                        <td>
                                            {user.role === "Manager" && (
                                                <>
                                                    <button onClick={() => openEditModal(entry)}>Edit</button>
                                                </>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default JournalPage;
