import React from 'react';
import BalanceWizardLogo from "./BalanceWizardLogo.jpg";
import './Styling.css';

export const CreateAccount = () => {
    return (
        <div>
            <div className="container">
                <img src={BalanceWizardLogo} alt="logo" className="logo" />
                <h1 className="title">Balance Wizard</h1>
                <div className="buttons">
                    <button>New User</button> |
                    <button>Login</button>
                </div>
            </div>

            <div style={{ backgroundColor: '#AFABAB', textAlign: 'center', color: 'black', padding: '10px', border: '1px solid black' }}>
                Menu Bar for Future Functions
            </div>

            <div className="blue-box">
                <div className="user-box">
                    <h2 className="user-box-title">Create a New User</h2>
                    <form className="form-container">
                        <div className="label-container">
                            <label htmlFor="firstName" className="label">First Name:</label>
                            <input type="text" id="firstName" className="input-field" />
                        </div>
                        <div className="label-container">
                            <label htmlFor="lastName" className="label">Last Name:</label>
                            <input type="text" id="lastName" className="input-field" />
                        </div>
                        <div className="label-container">
                            <label htmlFor="address" className="label">Address:</label>
                            <input type="text" id="address" className="input-field" />
                        </div>
                        <div className="label-container">
                            <label htmlFor="dob" className="label">Date of Birth:</label>
                            <input type="text" id="dob" className="input-field" />
                        </div>
                        <div className="submit-button">
                            <button type="submit">Submit</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};