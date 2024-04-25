import React from 'react';
import { Link } from 'react-router-dom';
import BalanceWizardLogo from './BalanceWizardLogo.jpg';
import "./Styling.css";
import { useUser } from './userContext';

const HelpPage = () => {
    const { user, handleSignOut } = useUser();

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
                        <div className="profile-column">
                            <img src={user.profilePic} alt="Profile Picture" className="profile-pic" />
                            <div className="username-display">{user.username}</div>
                            <button onClick={handleSignOut}>Logout</button>
                        </div>
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
                                <Link to="/help"><button className='menuBarButtons'>Help</button></Link>
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
                                <Link to="/help"><button className='menuBarButtons'>Help</button></Link>
                            </>
                        )}
                    </>
                ) : (
                    <div>Please login to navigate the application</div>
                )}
            </div>

            <div className="blue-box">
                <div className="user-box">
                    <div className="help-content">
                        {/* Add your help content here */}
                        <h1>General Help</h1>
                                <h2>Login Page:</h2>
                                <ul class="left-align">
                                    <li>If you're having trouble logging in, ensure that you are entering the correct username and password.</li>
                                    <li>Make sure that caps lock is turned off as passwords are case-sensitive.</li>
                                    <li>If you've forgotten your password, you can click on the Forgot Password link to reset it.</li>
                                </ul>

                                <h2>Admin Interface:</h2>
                                <ul class="left-align">
                                    <li>The Admin Interface provides access to administrative settings and user management.</li>
                                    <li>As an administrator, you can add, edit, or delete user accounts.</li>
                                    <li>You can also configure permissions for different user roles.</li>
                                </ul>

                                <h2>Chart of Accounts:</h2>
                                <ul class="left-align">
                                    <li>The <strong>Chart of Accounts</strong> displays a list of all accounts used in the system.</li>
                                    <li>You can view details such as account names, numbers, and balances.</li>
                                    <li>To search for a specific account, use the search functionality provided.</li>
                                </ul>

                                <h2>Journals:</h2>
                                <ul class="left-align">
                                    <li><strong>Journals</strong> contain records of financial transactions entered into the system.</li>
                                    <li>You can view details such as transaction dates, descriptions, and amounts.</li>
                                    <li>To filter journals by specific criteria, use the search or sorting options available.</li>
                                    <li>If you need assistance with entering or editing journal entries, please refer to the help documentation or contact support.</li>
                                </ul>

                                <h2>Ledger:</h2>
                                <ul class="left-align">
                                    <li>The <strong>Ledger</strong> displays detailed transaction records for individual accounts.</li>
                                    <li>You can view transactions grouped by account, along with corresponding debits and credits.</li>
                                    <li>To navigate through the ledger, use the pagination or search functionality provided.</li>
                                </ul>

                                <h2>Statement:</h2>
                                <ul class="left-align">
                                    <li><strong>Statements</strong> provide summarized financial information for specific periods.</li>
                                    <li>You can generate statements such as balance sheets, income statements, and cash flow statements.</li>
                                    <li>Customize statement parameters to view data relevant to your needs.</li>
                                </ul>

                                <h2>Home Page:</h2>
                                <ul class="left-align">
                                    <li>The <strong>Home Page</strong> serves as the main dashboard for accessing key features and information.</li>
                                    <li>You can quickly navigate to different modules such as the Chart of Accounts, Journals, or Statements.</li>
                                </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HelpPage;