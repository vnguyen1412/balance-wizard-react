import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import BalanceWizardLogo from './BalanceWizardLogo.jpg';
import ChartOfAccounts from './ChartOfAccounts';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './Styling.css';

const ChartOfAccountsPage = () => {
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
                <img src={BalanceWizardLogo} alt="logo" className="logo" />
                <h1 className="title">Balance Wizard - Chart of Accounts</h1>
                <div className="buttons">
                    <Link to="/login"><button>Login</button></Link>
                    <span> | </span>
                    <Link to="/create-account"><button>New User</button></Link>
                </div>
            </div>

            <div className="menu-bar">
                Menu Bar for Future Functions
                <Link to="/admin-interface"><button>Admin Interface</button></Link>
                <Link to="/chart"><button>Charts</button></Link>
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
