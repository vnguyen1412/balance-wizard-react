import React from 'react';
import BalanceWizardLogo from "./BalanceWizardLogo.jpg";
import { Link } from 'react-router-dom';
import "./Styling.css"; // Importing the CSS file


export const HomePage = () => {
    return (
        <div>
            <div className="container">
                <img src={BalanceWizardLogo} alt="logo" className="logo" />
                <h1 className="title">Balance Wizard</h1>
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
                    <h2 className="user-box-title">Welcome to Balance Wizard</h2>
                    <p>This is a simple home page. You can add more content or functionality here as needed.</p>
                </div>
            </div>
        </div>
    );
};