import ComposeEmail from "./ComposeEmail";
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import BalanceWizardLogo from "./BalanceWizardLogo.jpg";
import './Styling.css';

function Email(){
    return (
        <div>
            <div className="container">
                <Link to="/">
                    <img src={BalanceWizardLogo} alt="logo" className="logo" />
                </Link>
                <h2 className="title">Compose Email</h2>
        </div>
        <div className="blue-box">
            <div  className="user-box">
                <ComposeEmail />
            </div>
            
        </div>
        </div>
        
    );
}
export default Email;