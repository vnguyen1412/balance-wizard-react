import React, { useState } from 'react';

const EditJournalEntry = ({ entry, onSave, onCancel }) => {
    const [debitEntries, setDebitEntries] = useState(entry?.debitEntries || [{ accountTitle: '', amount: '' }]);
    const [creditEntries, setCreditEntries] = useState(entry?.creditEntries || [{ accountTitle: '', amount: '' }]);
    const [editedEntry, setEditedEntry] = useState({
        debitAccountTitle: entry.debitAccountTitle.slice(),
        debitLedgerRef: entry.debitLedgerRef.slice(),
        debitAmount: entry.debitAmount.slice(),
        creditAccountTitle: entry.creditAccountTitle.slice(),
        creditLedgerRef: entry.creditLedgerRef.slice(),
        creditAmount: entry.creditAmount.slice(),
        explanation: entry.explanation,
        sourceFile: entry.sourceFile
    });

    const handleInputChange = (e, index) => {
        const { name, value } = e.target;
        const updatedEntry = { ...editedEntry };
        updatedEntry[name][index] = value;
        setEditedEntry(updatedEntry);
    };

    const handleSave = () => {
        if(editedEntry.explanation === undefined){
            editedEntry.explanation = null;
        }
        editedEntry.status = "pending";
        onSave(editedEntry);
    };

    const handleAddEntry = (field) => {
        setEditedEntry({ ...editedEntry, [field]: [...editedEntry[field], ''] });
    };

    const handleRemoveEntry = (field, index) => {
        const updatedEntries = editedEntry[field].filter((_, i) => i !== index);
        setEditedEntry({ ...editedEntry, [field]: updatedEntries });
    };

    return (
        <div className="popup">
            <div className="popup-content">
                <span className="close" onClick={onCancel}>&times;</span>
                <h2>Edit Journal Entry</h2>
                <div>
                    {/* Debit Entries */}
                    <h3>Debit Entry</h3>
                    {editedEntry.debitAccountTitle.map((accountTitle, index) => (
                        <div key={index}>
                            <input
                                type="text"
                                name="debitAccountTitle"
                                value={accountTitle}
                                onChange={(e) => handleInputChange(e, index)}
                            />
                            <input
                                type="text"
                                name="debitLedgerRef"
                                value={editedEntry.debitLedgerRef[index]}
                                onChange={(e) => handleInputChange(e, index)}
                            />
                            <input
                                type="text"
                                name="debitAmount"
                                value={editedEntry.debitAmount[index]}
                                onChange={(e) => handleInputChange(e, index)}
                            />
                            <button onClick={() => handleRemoveEntry('debitAccountTitle', index)}>Remove</button>
                        </div>
                    ))}
                    <button onClick={() => handleAddEntry('debitAccountTitle')}>Add Debit Entry</button>

                    {/* Credit Entries */}
                    <h3>Credit Entry</h3>
                    {editedEntry.creditAccountTitle.map((accountTitle, index) => (
                        <div key={index}>
                            <input
                                type="text"
                                name="creditAccountTitle"
                                value={accountTitle}
                                onChange={(e) => handleInputChange(e, index)}
                            />
                            <input
                                type="text"
                                name="creditLedgerRef"
                                value={editedEntry.creditLedgerRef[index]}
                                onChange={(e) => handleInputChange(e, index)}
                            />
                            <input
                                type="text"
                                name="creditAmount"
                                value={editedEntry.creditAmount[index]}
                                onChange={(e) => handleInputChange(e, index)}
                            />
                            <button onClick={() => handleRemoveEntry('creditAccountTitle', index)}>Remove</button>
                        </div>
                    ))}
                    <button onClick={() => handleAddEntry('creditAccountTitle')}>Add Credit Entry</button>

                    {/* Explanation and Source File */}
                    <div>
                        <label>Explanation:</label>
                        <input
                            type="text"
                            name="explanation"
                            value={editedEntry.explanation}
                            onChange={(e) => handleInputChange(e)}
                        />
                    </div>
                </div>
                <button onClick={handleSave}>Save</button>
                <button onClick={onCancel}>Cancel</button>
            </div>
        </div>
    );
};

export default EditJournalEntry;
