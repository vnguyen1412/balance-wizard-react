import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import BalanceWizardLogo from './BalanceWizardLogo.jpg';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './Styling.css';
import { useUser } from './userContext';
import ChartOfAccounts from './ChartOfAccounts';
import sortedAccounts from './ChartOfAccounts';

const LedgerPage = () => {
    const { user, handleSignOut } = useUser();
    const [startDate, setStartDate] = useState(new Date());
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });

    const accounts = [
        // Your account data here
    ];

    const requestSort = (key) => {
        // Sort logic
    };

    return (
        <div>
            <div className="container">
                <div className="balance-wizard-section">
                    <Link to="/"><img src={BalanceWizardLogo} alt="logo" className="logo" /></Link>
                    <div>
                        <h1 className="title">Balance Wizard</h1>
                        {user.username && user.firstName && user.lastName && (
                            <div className="user-fullname">{`${user.firstName} ${user.lastName}`}</div>
                        )}
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
                                <Link to="/ledger"><button className='menuBarButtons'>Ledgers</button></Link>
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
                        <h2 className="user-box-title">Ledger</h2>
                    </div>
                    <ChartOfAccounts accounts={accounts} sortConfig={sortConfig} requestSort={requestSort} />
                </div>
                <table className="ledger-table">
                    <thread>
                        <tr>
                            <td></td>
                            <th onClick={() => requestSort('listOfDates')}>Date</th>
                            <th onClick={() => requestSort('accountNumber')}>Account Number</th>
                            <th onClick={() => requestSort('journalRefs')}>Reference</th>
                            <th onClick={() => requestSort('accountType')}>Account Type</th>
                            <th onClick={() => requestSort('accountCategory')}>Account Category</th>
                            <th onClick={() => requestSort('accountSubcategory')}>Account Subcategory</th>
                            <th onClick={() => requestSort('normalBalance')}>Normal Balance</th>
                        </tr>
                    </thread>
                    <tbody>
                        {sortedAccounts.map((account, index) => (
                            <tr key={index}>
                                <td>
                                    <input
                                        type="radio"
                                        name="selectedAmount"
                                        onChange={() => setSelectedAmount(account)}
                                        checked={selectedAmount === account}
                                    />
                                </td>
                                <td>{account.listOfDates}</td>
                                <td>{account.accountNumber}</td>
                                <td>{account.journalRefs}</td>
                                <td>{account.accountType}</td>
                                <td>{account.accountCategory}</td>
                                <td>{account.accountSubcategory}</td>
                                <td>{account.normalBalance}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default LedgerPage;