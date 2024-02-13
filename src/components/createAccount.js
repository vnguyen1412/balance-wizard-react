import React from 'react';
import BalanceWizardLogo from "./BalanceWizardLogo.jpg"

export const CreateAccount = () => {
    return (
        <div>
            {/* Top section */}
            <div style={{ backgroundColor: 'white', padding: '20px', display: 'flex', alignItems: 'center' }}>
                <img src={BalanceWizardLogo} alt="logo" style={{ width: '65px', height: '65px', marginRight: '10px', marginLeft: '5px' }} />
                <div style={{ fontSize: '36px', color: 'black', margin: '0' }}>Balance Wizard</div>
                <div style={{ fontSize: '24px', color: 'black', marginLeft: 'auto' }}>
                    <button style={{ marginRight: '10px', marginTop: '5px' }}>New User</button> |
                    <button style={{ marginLeft: '10px', marginTop: '5px' }}>Login</button>
                </div>
            </div>

            {/* Potential Menu Bar */}
            <div style={{ backgroundColor: '#AFABAB', textAlign: 'center', color: 'black', padding: '10px', border: '1px solid black' }}>
                Potential Menu Bar for Future Functions
            </div>

            {/* Blue Box */}
            <div style={{ backgroundColor: '#8FAADC', minHeight: 'calc(100vh - 40px)', padding: '20px', border: '1px solid black' }}>
                {/* Create New User Box */}
                <div style={{ backgroundColor: '#D9D9D9', padding: '20px', border: '1px solid black', height: '70vh', overflowY: 'auto' }}>
                    <div style={{ fontSize: '24px', textAlign: 'center', color: 'black', marginBottom: '75px' }}>Create a New User</div>
                    <form style={{ display: 'flex', flexDirection: 'column' }}>
                        <div style={{ marginBottom: '75px', display: 'flex', alignItems: 'center' }}>
                            <label htmlFor="firstName" style={{ color: 'black', width: '150px', marginRight: '10px' }}>First Name:</label>
                            <input type="text" id="firstName" style={{ width: '300px' }} />
                        </div>
                        <div style={{ marginBottom: '75px', display: 'flex', alignItems: 'center' }}>
                            <label htmlFor="lastName" style={{ color: 'black', width: '150px', marginRight: '10px' }}>Last Name:</label>
                            <input type="text" id="lastName" style={{ width: '300px' }} />
                        </div>
                        <div style={{ marginBottom: '75px', display: 'flex', alignItems: 'center' }}>
                            <label htmlFor="address" style={{ color: 'black', width: '150px', marginRight: '10px' }}>Address:</label>
                            <input type="text" id="address" style={{ width: '300px' }} />
                        </div>
                        <div style={{ marginBottom: '75px', display: 'flex', alignItems: 'center' }}>
                            <label htmlFor="dob" style={{ color: 'black', width: '150px', marginRight: '10px' }}>Date of Birth:</label>
                            <input type="text" id="dob" style={{ width: '300px' }} />
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <button type="submit">Submit</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};