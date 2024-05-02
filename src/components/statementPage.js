import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './Styling.css';
import { useUser } from './userContext';
import BalanceWizardLogo from './BalanceWizardLogo.jpg';
import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore'; // Import Firestore methods
import { format } from 'date-fns';

const StatementPage = () => {
    const { user, handleSignOut } = useUser();
    const [startDate, setStartDate] = useState(new Date('January 1, 2000'));
    const [endDate, setEndDate] = useState(new Date());
    const [activeTable, setActiveTable] = useState('none'); // 'trialBalance', 'incomeStatement', 'balanceSheet', 'retainedEarnings', or 'none'
    const db = getFirestore();
    const [trialBalanceData, setTrialBalanceData] = useState({
        totalDebits: 0,
        totalCredits: 0,
        accounts: []
    });
        const [incomeStatementData, setIncomeStatementData] = useState([]);
    const [balanceSheetData, setBalanceSheetData] = useState({
        assets: [],
        liabilities: [],
        equity: []
    });    
    const [shareholdersEquityData, setShareholdersEquityData] = useState({
        totalAssets: 0,
        totalLiabilities: 0,
        shareholdersEquity: 0
    });
    const [totalDebits, setTotalDebits] = useState(0); 
    const [totalCredits, setTotalCredits] = useState(0);
     

    const fetchFinancialData = async (collectionName) => {
        const formattedStartDate = format(startDate, "yyyy-MM-dd");
        const formattedEndDate = format(endDate, "yyyy-MM-dd");
        const colRef = collection(db, collectionName);
        const q = query(colRef, 
            where("date", ">=", formattedStartDate),
            where("date", "<=", formattedEndDate)
        );
        const snapshot = await getDocs(q);
        console.log(snapshot.docs.map(doc => doc.data())); // Check what is being fetched
        const docs = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        return docs;
    };

    const handleTrialBalance = async () => {
        try {
            setActiveTable('trialBalance');
            // Fetch all accounts data
            const rawData = await fetchFinancialData('accounts');
    
            let totalDebits = 0;
            let totalCredits = 0;
            const accounts = [];
    
            // Process each account entry
            rawData.forEach(account => {
                // Define a new account structure that includes debit and credit fields
                const newAccount = { accountName: account.accountName, debit: null, credit: null };
    
                // Assuming the balance sign or account type determines debit or credit
                if (['Asset', 'Expenses'].includes(account.accountCategory)) {
                    newAccount.debit = Math.abs(account.balance);
                    totalDebits += newAccount.debit;
                } else {
                    newAccount.credit = Math.abs(account.balance);
                    totalCredits += newAccount.credit;
                }
                accounts.push(newAccount);
            });
    
            // Set the trial balance data
            setTrialBalanceData({
                totalDebits,
                totalCredits,
                accounts
            });
            console.log({
                totalDebits,
                totalCredits,
                accounts
            }); // Debugging: check the processed data
        } catch (error) {
            console.error("Failed to fetch or process trial balance data:", error);
        }
    };

    const handleIncomeStatement = async () => {
        try {
            // Fetch all accounts data
            const rawData = await fetchFinancialData('accounts');
            
            // Initialize sums for revenues and expenses
            let totalRevenue = 0;
            let totalExpense = 0;
    
            // Process each account entry
            rawData.forEach(account => {
                if (account.accountCategory === 'Revenue') {
                    totalRevenue += account.balance;
                } else if (account.accountCategory === 'Expenses') {
                    totalExpense += account.balance;
                }
            });
    
            // Set the income statement data
            setIncomeStatementData({ totalRevenue, totalExpense });
            console.log({ totalRevenue, totalExpense }); // Debugging: check the processed data
            setActiveTable('incomeStatement');
        } catch (error) {
            console.error("Failed to fetch or process income statement data:", error);
        }
    };
    

    const handleBalanceSheet = async () => {
        try {
            // Fetch all accounts data
            const rawData = await fetchFinancialData('accounts'); 
    
            // Initialize lists for assets, liabilities, and equity
            const assets = [];
            const liabilities = [];
            const equity = [];
    
            // Process each account entry
            rawData.forEach(account => {
                const entry = { accountName: account.accountName, balance: account.balance };
    
                switch (account.accountCategory) {
                    case 'Asset':
                        assets.push(entry);
                        break;
                    case 'Liability':
                        liabilities.push(entry);
                        break;
                    case "Owner's and Stockholder's Equity":
                        equity.push(entry);
                        break;
                    default:
                        // Handle other categories or ignore them
                        break;
                }
            });
    
            // Set the balance sheet data
            setBalanceSheetData({ assets, liabilities, equity });
            console.log({ assets, liabilities, equity }); // Debugging: check the processed data
            setActiveTable('balanceSheet');
        } catch (error) {
            console.error("Failed to fetch or process balance sheet data:", error);
        }
    };

    const handleRetainedEarnings = async () => {
        try {
            setActiveTable('retainedEarnings');
            // Fetch all accounts data, assuming 'accounts' collection includes all asset and liability accounts
            const rawData = await fetchFinancialData('accounts');
    
            let totalAssets = 0;
            let totalLiabilities = 0;
    
            // Process each account entry
            rawData.forEach(account => {
                if (account.accountCategory === 'Asset') {
                    totalAssets += account.balance;
                } else if (account.accountCategory === 'Liability') {
                    totalLiabilities += account.balance;
                }
            });
    
            const shareholdersEquity = totalAssets - totalLiabilities;
    
            // Set the shareholders equity data
            setShareholdersEquityData({
                totalAssets,
                totalLiabilities,
                shareholdersEquity
            });
            console.log({
                totalAssets,
                totalLiabilities,
                shareholdersEquity
            }); // Debugging: check the processed data
        } catch (error) {
            console.error("Failed to fetch or process shareholders equity data:", error);
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
                    <h2 className="user-box-title">Financial Statements</h2>
                    <h3>Date Filter</h3>
                    <DatePicker selected={startDate} onChange={(date) => setStartDate(date)} className="calendar-input" />
                    <span style={{ margin: '0 10px' }}>to</span>
                    <DatePicker selected={endDate} onChange={(date) => setEndDate(date)} className="calendar-input" />
                    <div>
                        <button onClick={handleTrialBalance}>Trial Balance</button>
                        <button onClick={handleIncomeStatement}>Income Statement</button>
                        <button onClick={handleBalanceSheet}>Balance Sheet</button>
                        <button onClick={handleRetainedEarnings}>Retained Earnings</button>
                    </div>
                    {activeTable === 'trialBalance' && (
                        <div className="accounts-table">
                            <h3>Trial Balance</h3>
                            <table>
                                <thead>
                                    <tr>
                                        <th>Account Name</th>
                                        <th>Debit</th>
                                        <th>Credit</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {trialBalanceData.accounts.map((account, index) => (
                                        <tr key={index}>
                                            <td>{account.accountName}</td>
                                            <td>{account.debit !== null ? account.debit.toFixed(2) : ''}</td>
                                            <td>{account.credit !== null ? account.credit.toFixed(2) : ''}</td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr>
                                        <th>Total</th>
                                        <td>{trialBalanceData.totalDebits.toFixed(2)}</td>
                                        <td>{trialBalanceData.totalCredits.toFixed(2)}</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    )}
                    {activeTable === 'incomeStatement' && (
                        <div className="accounts-table">
                            <h3>Income Statement</h3>
                            <table>
                                <thead>
                                    <tr>
                                        <th>Category</th>
                                        <th>Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>Total Revenue</td>
                                        <td>{incomeStatementData.totalRevenue.toFixed(2)}</td>
                                    </tr>
                                    <tr>
                                        <td>Total Expenses</td>
                                        <td>{incomeStatementData.totalExpense.toFixed(2)}</td>
                                    </tr>
                                </tbody>
                                <tfoot>
                                    <tr>
                                        <th>Net Income</th>
                                        <td>{(incomeStatementData.totalRevenue - incomeStatementData.totalExpense).toFixed(2)}</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    )}
                    {activeTable === 'balanceSheet' && (
                        <div className="accounts-table">
                            <h3>Balance Sheet</h3>
                            <table>
                                <thead>
                                    <tr>
                                        <th>Category</th>
                                        <th>Account Name</th>
                                        <th>Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {balanceSheetData.assets.map(asset => (
                                        <tr key={asset.accountName}>
                                            <td>Asset</td>
                                            <td>{asset.accountName}</td>
                                            <td>{asset.balance.toFixed(2)}</td>
                                        </tr>
                                    ))}
                                    {balanceSheetData.liabilities.map(liability => (
                                        <tr key={liability.accountName}>
                                            <td>Liability</td>
                                            <td>{liability.accountName}</td>
                                            <td>{liability.balance.toFixed(2)}</td>
                                        </tr>
                                    ))}
                                    {balanceSheetData.equity.map(equity => (
                                        <tr key={equity.accountName}>
                                            <td>Equity</td>
                                            <td>{equity.accountName}</td>
                                            <td>{equity.balance.toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr>
                                        <th colSpan="2">Total Assets</th>
                                        <td>{balanceSheetData.assets.reduce((sum, asset) => sum + asset.balance, 0).toFixed(2)}</td>
                                    </tr>
                                    <tr>
                                        <th colSpan="2">Total Liabilities</th>
                                        <td>{balanceSheetData.liabilities.reduce((sum, liability) => sum + liability.balance, 0).toFixed(2)}</td>
                                    </tr>
                                    <tr>
                                        <th colSpan="2">Total Equity</th>
                                        <td>{balanceSheetData.equity.reduce((sum, equity) => sum + equity.balance, 0).toFixed(2)}</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    )}
                    {activeTable === 'retainedEarnings' && (
                        <div className="accounts-table">
                            <h3>Shareholder's Equity</h3>
                            <table>
                                <thead>
                                    <tr>
                                        <th>Category</th>
                                        <th>Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>Total Assets</td>
                                        <td>{shareholdersEquityData.totalAssets.toFixed(2)}</td>
                                    </tr>
                                    <tr>
                                        <td>Total Liabilities</td>
                                        <td>{shareholdersEquityData.totalLiabilities.toFixed(2)}</td>
                                    </tr>
                                    <tr>
                                        <td>Shareholder's Equity</td>
                                        <td>{shareholdersEquityData.shareholdersEquity.toFixed(2)}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StatementPage;
