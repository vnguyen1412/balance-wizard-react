import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import BalanceWizardLogo from './BalanceWizardLogo.jpg';
import ChartOfAccounts from './ChartOfAccounts';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './Styling.css';
import { useUser } from './userContext';

const ChartOfAccountsPage = () => {
    const { user, handleSignOut } = useUser();
    const [startDate, setStartDate] = useState(new Date());
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
    

    // Define accounts data (mock or from API)
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
                <Link to="/admin-interface"><button className='menuBarButtons'>Admin Interface</button></Link>
                <Link to="/send-email"><button className='menuBarButtons'>Send Email</button></Link>
                <Link to="/chart"><button className='menuBarButtons'>Charts</button></Link>
                <Link to="/journal"><button className='menuBarButtons'>Journals</button></Link>
            </div>

            <div className="blue-box">
                <div className="user-box">
                    <div className="title-container">
                        <DatePicker selected={startDate} onChange={(date) => setStartDate(date)} className="calendar-input" />
                        <h2 className="user-box-title">Chart of Accounts</h2>
                    </div>
                    <ChartOfAccounts accounts={accounts} sortConfig={sortConfig} requestSort={requestSort} />
                </div>
            </div>
        </div>
    );
};

export default ChartOfAccountsPage;
