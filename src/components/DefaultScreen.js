import React, { useEffect, useState } from 'react';
import BalanceWizardLogo from "./BalanceWizardLogo.jpg";
import { Link } from 'react-router-dom';
import './Styling.css';

function DefaultPage(){
    return (
        <div>
            <div className="container">
                <div className="container">
                    <Link to="/">
                        <img src={BalanceWizardLogo} alt="logo" className="logo" />
                    </Link>
                    <h2 className="title">Balance Wizard</h2>
                </div>
                <div className="buttons">
                    <Link to="/login"><button>Login</button></Link>
                    <span> | </span>
                    <Link to="/create-account"><button>New User</button></Link>
                </div>
            </div>

            <div className="menu-bar">
                <Link to="/admin-interface"><button className='menuBarButtons'>Admin Interface</button></Link>
                <Link to="/send-email"><button className='menuBarButtons'>Send Email</button></Link>
                <Link to="/search-menu"><button className='menuBarButtons'>Search Menu</button></Link>
            </div>

            <div className="blue-box">
                <div className="user-box">
                </div>
            </div>
        </div>
    );
}
export default DefaultPage;