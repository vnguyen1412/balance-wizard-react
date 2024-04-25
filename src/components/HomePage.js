import React from 'react';
import BalanceWizardLogo from "./BalanceWizardLogo.jpg";
import { Link } from 'react-router-dom';
import "./Styling.css"; // Importing the CSS file
import { useUser } from './userContext';
import { usePendingUsers } from './usePendingUsers';
import { usePendingJournals } from './usePendingJournals';
import { useFinancialRatios } from './useFinancialRatios';

export const HomePage = () => {
    const { user, handleSignOut } = useUser();
    const { pendingUsers } = usePendingUsers();
    const { pendingJournals} = usePendingJournals();

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
                    <h2 className="user-box-title">Welcome to Balance Wizard</h2>
                    <div className="notifications-container">
                        <h2 className="notifications-title">Notifications</h2>
                        {user.role === 'Administrator' && pendingUsers.length > 0 && (
                            <p>You have pending users to review.</p>
                        )}
                        {(user.role === 'Manager' || user.role === 'Administrator') && pendingJournals.length > 0 && (
                            <p>You have pending journals to approve.</p>
                        )}
                    </div>
                    <div>
                        <h2 className="notifications-title">Financial Ratios</h2>
                        <p>Current Ratio: {ratios[0]}</p>
                        <p>Asset Turnover Ratio: {ratios[1]}</p>
                        <p>Debit to Asset Ratio: {ratios[2]}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};