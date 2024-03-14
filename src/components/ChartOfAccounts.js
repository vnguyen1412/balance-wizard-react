import React, { useState } from 'react';

// Assuming the mock data and initial component setup is already provided

const ChartOfAccounts = () => {
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });

    const accounts = [
        { accountNumber: 101, accountName: 'Cash', accountCategory: 'Asset', accountSubcategory: 'Current Asset', normalBalance: 'Debit', financialStatement: 'Balance Sheet', description: 'Cash in hand and bank balances', balance: 5000, creationDate: '2024-01-01' },
        { accountNumber: 102, accountName: 'Accounts Receivable', accountCategory: 'Asset', accountSubcategory: 'Current Asset', normalBalance: 'Debit', financialStatement: 'Balance Sheet', description: 'Amounts owed by customers', balance: 2500, creationDate: '2024-01-02' },
        // Add accounts from user
    ];

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

    return (
        <table className="accounts-table">
            <thead>
                <tr>
                    {/* Update the header cells to call requestSort with the corresponding key */}
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
                        {/* Table rows remain unchanged */}
                    </tr>
                ))}
            </tbody>
        </table>
    );
};

export default ChartOfAccounts;
