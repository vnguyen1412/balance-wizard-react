import React from 'react';
import BalanceWizardLogo from "./BalanceWizardLogo.jpg";
import { Link } from 'react-router-dom';
import "./Styling.css"; // Importing the CSS file
import { useUser } from './userContext';

export const HomePage = () => {
    const { user, handleSignOut } = useUser();

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
                <Link to="/chart"><button>Charts</button></Link>
                <Link to="/admin-interface"><button className='menuBarButtons'>Admin Interface</button></Link>
                <Link to="/send-email"><button className='menuBarButtons'>Send Email</button></Link>
                <Link to="/search-menu"><button className='menuBarButtons'>Search Menu</button></Link>
            </div>

            <div className="blue-box">
                <div className="user-box">
                    <h2 className="user-box-title">Welcome to Balance Wizard</h2>
                </div>
            </div>
        </div>
    );
};