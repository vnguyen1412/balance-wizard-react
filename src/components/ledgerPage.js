import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import BalanceWizardLogo from './BalanceWizardLogo.jpg';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './Styling.css';
import { useUser } from './userContext';
import { collection, getDocs, getFirestore } from 'firebase/firestore';

const LedgerPage = () => {
    const { user, handleSignOut } = useUser();
    const [startDate, setStartDate] = useState(new Date());

    const [accountData, setAccountData] = useState([]);

    useEffect(() => {
        console.log("First check to see if useEffect is triggered");

        fetchAccountData();

        console.log("useEffect is running");
    }, []);

    // Function to fetch the account information
    const fetchAccountData = async () => {
        try {
            const db = getFirestore();
            const accountRef = collection(db, 'accounts');
            const accountSnapshot = await getDocs(accountRef);

            //get only these certain fields from all of the accounts in the database and save it as an array in the accountData variable
            setAccountData(accountSnapshot.docs.map(doc => ({
                id: doc.id,
                accountName: doc.data().accountName,
                accountNumber: doc.data().accountNumber,
                listOfDates: doc.data().listOfDates,
                listOfExplainations: doc.data().listOfExplainations,
                listOfJournalRefs: doc.data().listOfJournalRefs,
                listOfAmountType: doc.data().listOfAmountType,
                listOfAmounts: doc.data().listOfAmounts,
                listOfBalances: doc.data().listOfBalances
            })));

            console.log("the list of accounts are: " + accountData);
            console.log("the list of amount type for the cash account is " + accountData[0].listOfAmountType);
        } catch (error) {
            console.error('Error fetching Journal Entries:', error);
        }
    };

    return (
        <div>
            <div className="container">
                <div className="balance-wizard-section">
                    <Link to="/"><img src={BalanceWizardLogo} alt="logo" className="logo" /></Link>
                    <div>
                        <h1 className="title">Balance Wizard</h1>
                        {user.username && user.firstName && user.lastName && (
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
                                <Link to="/ledger-page"><button className='menuBarButtons'>Ledgers</button></Link>
                                <Link to="/statements"><button className='menuBarButtons'>Statements</button></Link>
                            </>
                        )}
                        {(user.role === 'Manager' || user.role === 'Administrator') && (
                            <>
                                <Link to="/admin-interface"><button className='menuBarButtons'>Admin Interface</button></Link>
                                <Link to="/send-email"><button className='menuBarButtons'>Send Email</button></Link>
                                <Link to="/chart"><button className='menuBarButtons'>Charts</button></Link>
                                <Link to="/journal"><button className='menuBarButtons'>Journals</button></Link>
                                <Link to="/ledger-page"><button className='menuBarButtons'>Ledgers</button></Link>
                                <Link to="/statements"><button className='menuBarButtons'>Statements</button></Link>
                            </>
                        )}
                    </>
                ) : (
                    <div>Please login to navigate the application</div>
                )}
            </div>

            <div className="blue-box">
                <div className="user-box">
                    <div className="title-container">
                        <DatePicker selected={startDate} onChange={(date) => setStartDate(date)} className="calendar-input" />
                        <h2 className="user-box-title">General Ledger</h2>
                    </div>
                    {/* will loop through all of the accounts and display a ledger for each account */}
                    {accountData.map((account, index) => (
                        <div key={index}>
                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                                <h1 style={{ flex: 1, textAlign: 'center' }}> {account.accountName} </h1>
                                <h2 style={{ textAlign: 'right' }}> No.{account.accountNumber} </h2>
                            </div>
                            {/* conditional rendering making sure that the current index of the accountData array does have an array of data that is not empty */}
                            {/* in this case I am checking the listOfDates array since every other array will be the same length */}
                            {account.listOfDates.length === 0 ? (
                                <p>No data in this General Ledger yet.</p>
                            ) : (
                                <table className="accounts-table">
                                    <thead>
                                        <tr>
                                            <th>Date</th>
                                            <th>Explaination</th>
                                            <th>Ref</th>
                                            <th>Debit</th>
                                            <th>Credit</th>
                                            <th>Balance</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {/* this will map the data for the sepecific account located at the current index from the first .map() */}
                                        {account.listOfDates.map((dataValue, dataIndex) => (
                                            <tr key={dataIndex}>
                                                <td>{dataValue}</td>
                                                <td>{account.listOfExplainations[dataIndex]}</td>
                                                <td>{account.listOfJournalRefs[dataIndex]}</td>
                                                {/* this is a conditional rendering to make sure that the amounts are recorded in the correct columns for debit and credit */}
                                                {account.listOfAmountType[dataIndex] === "debit" ? (
                                                    <>
                                                        <td>{account.listOfAmounts[dataIndex]}</td>
                                                        <td></td>
                                                    </>
                                                ) : (
                                                    <>
                                                        <td></td>
                                                        <td>{account.listOfAmounts[dataIndex]}</td>
                                                    </>
                                                )}
                                                <td>{account.listOfBalances[dataIndex]}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}  
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default LedgerPage;