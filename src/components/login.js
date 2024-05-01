import { auth } from "../config/firebase";
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { useState } from "react";
import BalanceWizardLogo from "./BalanceWizardLogo.jpg";
import { Link } from 'react-router-dom';
import { getFirestore, doc, getDocs, getDoc, collection, query, where, updateDoc } from 'firebase/firestore'; // Import Firestore functions
import "./Styling.css"; // Importing the CSS file
import { useUser } from './userContext';

export const Auth = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [showForgotPasswordPopup, setShowForgotPasswordPopup] = useState(false);
    const [resetEmailSent, setResetEmailSent] = useState(false);
    const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
    const [userId, setUserId] = useState("");
    const [securityAnswer, setSecurityAnswer] = useState("");
    const [error, setError] = useState(null);
    const { setUser } = useUser();
    const { user, handleSignOut} = useUser();

    const signIn = async (e) => {
        e.preventDefault(); // Prevent page refresh on form submission
        try {
            const db = getFirestore(); // Fetch user data from Firestore
            const q = query(collection(db, "users"), where('email', '==', email));
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
                const userData = querySnapshot.docs[0].data();
                const status = userData.status;
                let loginAttempts = userData.loginAttempts || 0; // Initialize loginAttempts if not present
    
                if (status === 'Approved') {
                    if (loginAttempts >= 2) { // Check if the user has reached the limit
                        // Set user status to Suspended if login attempts exceed 2 (3 attempts in total)
                        await updateDoc(doc(db, "users", querySnapshot.docs[0].id), { status: 'Suspended' });
                        setError("Your account is suspended due to multiple failed login attempts. Please contact an administrator for further assistance.");
                    } else {
                        try {
                            // Attempt to sign in the user
                            await signInWithEmailAndPassword(auth, email, password);
                            alert(`You are now signed in as ${email}`);
                            // If login is successful, reset loginAttempts
                            loginAttempts = 0;
                        } catch (error) {
                            setError("Invalid email or password. Please try again." ); // Set error message for incorrect password
                            console.error(error);
                            // Increment loginAttempts upon failed login attempt
                            loginAttempts++;
                            console.log(loginAttempts)
                        }
                    }
                } else if (status === 'Pending') {
                    setError("Your account is pending approval. Please wait for an administrator to approve your account.");
                } else if (status === 'Suspended') {
                    setError(`Your account is suspended. Please contact an administrator for further assistance.`);
                }
                // Update loginAttempts in the user document
                await updateDoc(doc(db, "users", querySnapshot.docs[0].id), { loginAttempts });
            } else {
                setError("User data not found!");
            }
        } catch (error) {
            setError("Error signing in. Please try again later.");
            console.error(error);
        }
    }

    const handleForgotPassword = async () => {
        try {
            //allows the user to sign in with just their email but this will be left out for now.
            /*sendSignInLinkToEmail(auth, forgotPasswordEmail, actionCodeSettings)
                .then((userCredential) => {
                    console.log("The email link has been sent")
                    const user = userCredential.user
                    window.localStorage.setItem("emailForSignIn", forgotPasswordEmail)
                    console.log("the user is: " + user)
                })
                .catch((error) => {
                    console.log("Error sending sign-in link: " + error.message)
                })
            */
            const db = getFirestore();// Fetch user data from Firestore
            let uid = null
            const userRef = collection(db, "users");
            const q = query(userRef, where("email", "==", forgotPasswordEmail));

            //returns an array of documents based on our query
            const querySnapshot = await getDoc(q);

            //checks to see if the user exist
            if(querySnapshot.docs.length === 0) {
                throw new Error("Invalid Email")
            }

            querySnapshot.forEach((doc) => {
                //test to make sure the correct document is retreived
                console.log(doc.id, " => ", doc.data());

                //just in case I need the uid
                uid = doc.id;
                console.log("the UID is: " + uid)

                //confirms if the user id and security answer matches the document that also has the email
                if((doc.data().username != userId) || (doc.data().securityAnswer != securityAnswer)) {
                    console.log("this if-statement is triggered");
                    throw new Error("Invalid User Id or Security Answer")
                }
            });

            await sendPasswordResetEmail(auth, forgotPasswordEmail);
            setResetEmailSent(true);
        } catch (error) {
            setError(error.message);
        }
    };

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

            {/* Forgot Password Popup */}
            {showForgotPasswordPopup && (
                <div className="forgot-password-popup">
                    <div className="forgot-password-content">
                        <span className="close" onClick={() => setShowForgotPasswordPopup(false)}>&times;</span>
                        <h2>Forgot Password</h2>
                        {resetEmailSent ? (
                            <p>Password reset email sent. Check your inbox.</p>
                        ) : (
                            <div>
                                <div>
                                    <input
                                        type="email"
                                        placeholder="Enter your email"
                                        value={forgotPasswordEmail}
                                        onChange={(e) => setForgotPasswordEmail(e.target.value)}
                                        required
                                    />
                                </div>
                                <div>
                                    <input
                                        type="text"
                                        placeholder="User ID"
                                        value={userId}
                                        onChange={(e) => setUserId(e.target.value)}
                                        required
                                    />
                                </div>
                                <div>
                                    <h>What is the name of the city you were born in?</h>
                                </div>
                                <div>
                                    <input
                                        type="text"
                                        placeholder="Enter Security Question Answer"
                                        value={securityAnswer}
                                        onChange={(e) => setSecurityAnswer(e.target.value)}
                                        required
                                    />
                                </div>
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