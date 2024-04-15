import { auth } from "../config/firebase";
import { signInWithEmailAndPassword, sendPasswordResetEmail, onAuthStateChanged, signOut } from "firebase/auth";
import { useState, useEffect } from "react";
import BalanceWizardLogo from "./BalanceWizardLogo.jpg";
import DefaultProfilePic from "./DefaultProfilePic.png";
import { Link } from 'react-router-dom';
import { getFirestore, doc, getDoc, collection, query, where } from 'firebase/firestore'; // Import Firestore functions
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
            //to get username of the current sign-in user
            const db = getFirestore();// Fetch user data from Firestore
            const userDoc = doc(db, 'users', email); // Assuming email is the user's document ID
            const userSnap = await getDoc(userDoc);
            if (userSnap.exists()) {
                const userData = userSnap.data();
                const { suspensionStartDate, suspensionExpiryDate } = userData;
                const currentDate = new Date();
                setUser({ username: userData.username })
    
                // Check if the current date is within the suspension period
                if (currentDate >= suspensionStartDate.toDate() && currentDate <= suspensionExpiryDate.toDate()) {
                    setError("Access denied. Your account is suspended until further notice.");
                    return;
                }
            }
    
            // Proceed with signing in the user if not suspended
            await signInWithEmailAndPassword(auth, email, password);
            alert(`You are now signed in as ${email}`);
            // If login is successful, you can redirect the user to another page or perform any other necessary actions
        } catch (error) {
            setError("Invalid email or password. Please try again."); // Set error message for incorrect password
            console.error(error);
            // Handle login errors here, such as displaying error messages to the user
        }
    }

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                // User is signed in, now fetch the username
                const userDoc = doc(getFirestore(), 'users', currentUser.uid);
                const userSnap = await getDoc(userDoc);
                if (userSnap.exists()) {
                    setUser({
                        firstName: userSnap.data().firstName,
                        lastName: userSnap.data().lastName,
                        username: userSnap.data().username,
                        profilePic: DefaultProfilePic,
                        role: userSnap.data().role
                    });
                    console.log("Username set to: ", userSnap.data().username);
                } else {
                    console.log("No user data found!");
                }
            } else {
                // User is signed out
                setUser({ username: '', profilePic: '', role: ''});
            }
        });
    
        // Cleanup subscription on unmount
        return () => unsubscribe();
    }, [setUser]); // Dependency array includes setUser to ensure it's stable

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
                <Link to="/admin-interface"><button className='menuBarButtons'>Admin Interface</button></Link>
                <Link to="/send-email"><button className='menuBarButtons'>Send Email</button></Link>
                <Link to="/chart"><button className='menuBarButtons'>Charts</button></Link>
                <Link to="/journal"><button className='menuBarButtons'>Journals</button></Link>
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