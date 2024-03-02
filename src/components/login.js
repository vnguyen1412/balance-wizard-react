import { auth } from "../config/firebase";
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { useState } from "react";
import BalanceWizardLogo from "./BalanceWizardLogo.jpg";
import { Link } from 'react-router-dom';
import { getFirestore, doc, getDoc } from 'firebase/firestore'; // Import Firestore functions
import "./Styling.css"; // Importing the CSS file

export const Auth = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showForgotPasswordPopup, setShowForgotPasswordPopup] = useState(false);
    const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
    const [resetEmailSent, setResetEmailSent] = useState(false);
    const [error, setError] = useState(null);

    const signIn = async (e) => {
        e.preventDefault(); // Prevent page refresh on form submission
        try {
            // Fetch user data from Firestore
            const db = getFirestore();
            const userDoc = doc(db, 'users', email); // Assuming email is the user's document ID
            const userSnap = await getDoc(userDoc);
            if (userSnap.exists()) {
                const userData = userSnap.data();
                const { suspensionStartDate, suspensionExpiryDate } = userData;
                const currentDate = new Date();
    
                // Check if the current date is within the suspension period
                if (currentDate >= suspensionStartDate.toDate() && currentDate <= suspensionExpiryDate.toDate()) {
                    setError("Access denied. Your account is suspended until further notice.");
                    return;
                }
            }
    
            // Proceed with signing in the user if not suspended
            await signInWithEmailAndPassword(auth, email, password);
            // If login is successful, you can redirect the user to another page or perform any other necessary actions
        } catch (error) {
            setError("Invalid email or password. Please try again."); // Set error message for incorrect password
            console.error(error);
            // Handle login errors here, such as displaying error messages to the user
        }
    }
    

    const handleForgotPassword = async () => {
        try {
            await sendPasswordResetEmail(auth, forgotPasswordEmail);
            setResetEmailSent(true);
        } catch (error) {
            setError(error.message);
        }
    };

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
            </div>

            <div className="blue-box">
                <div className="user-box">
                    <h2 className="user-box-title">Log In</h2>
                    <form className="form-container">
                        <div className="label-container">
                            <label htmlFor="email" className="label">Email:</label>
                            <input type="text" id="email" className="input-field" placeholder="Email..." onChange={(e) => setEmail(e.target.value)} />
                        </div>
                        <div className="label-container">
                            <label htmlFor="password" className="label">Password:</label>
                            <input type="password" id="password" className="input-field" placeholder="Password..." onChange={(e) => setPassword(e.target.value)} />
                        </div>
                        <div className="submit-button">
                            <button type="submit" onClick={signIn}>Submit</button>
                            <button type="button" onClick={() => setShowForgotPasswordPopup(true)}>Forgot Password</button>
                        </div>
                        {error && <p className="error-message">{error}</p>} {/* Display error message */}
                    </form>
                </div>
            </div>

            {showForgotPasswordPopup && (
                <div className="forgot-password-popup">
                    <div className="forgot-password-content">
                        <span className="close" onClick={() => setShowForgotPasswordPopup(false)}>&times;</span>
                        <h2>Forgot Password</h2>
                        {resetEmailSent ? (
                            <p>Password reset email sent. Check your inbox.</p>
                        ) : (
                            <div>
                                <input
                                    type="email"
                                    placeholder="Enter your email"
                                    value={forgotPasswordEmail}
                                    onChange={(e) => setForgotPasswordEmail(e.target.value)}
                                    required
                                />
                                <button onClick={handleForgotPassword}>Reset Password</button>
                                {error && <p className="error-message">{error}</p>} {/* Display error message */}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
