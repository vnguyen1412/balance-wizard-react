import { auth } from "../config/firebase";
import { signInWithEmailAndPassword, sendPasswordResetEmail,fetchSignInMethodsForEmail, sendSignInLinkToEmail } from "firebase/auth";
import { getFirestore, collection, getDocs, doc, query, where } from "firebase/firestore";
import { useState } from "react";
import BalanceWizardLogo from "./BalanceWizardLogo.jpg";
import { Link } from 'react-router-dom';
import "./Styling.css"; // Importing the CSS file

export const Auth = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [showForgotPasswordPopup, setShowForgotPasswordPopup] = useState(false);
    const [resetEmailSent, setResetEmailSent] = useState(false);
    const [userExist, setUserExist] = useState(true);
    const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
    const [userId, setUserId] = useState("");
    const [securityAnswer, setSecurityAnswer] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [error, setError] = useState(null);

    const db = getFirestore();

    let user

    const signIn = async () => {
        try {
            await signInWithEmailAndPassword(auth, email, password);
            // If login is successful, you can redirect the user to another page or perform any other necessary actions
        } catch (error) {
            console.error(error);
            // Handle login errors here, such as displaying error messages to the user
        }
    }

    const actionCodeSettings = {
        url: "http://localhost:3000/forget-password",
        handleCodeInApp: true
    }

    const handleForgotPassword = async () => {
        try {
            //await sendPasswordResetEmail(auth, forgotPasswordEmail);
            //setResetEmailSent(true);

            //check if the email exist
            //not working right now
            /*const methods = await auth.fetchSignInMethodsForEmail(forgotPasswordEmail);
            if(methods && methods.length >= 0) {
                throw new Error("Email does not exist")
            }*/

            sendSignInLinkToEmail(auth, forgotPasswordEmail, actionCodeSettings)
                .then((userCredential) => {
                    console.log("The email link has been sent")
                    user = userCredential.user
                    window.localStorage.setItem("emailForSignIn", forgotPasswordEmail)
                })
                .catch((error) => {
                    console.log("Error sending sign-in link: " + error.message)
                })

            //there is no current user
            console.log("my current user is: " + auth.currentUser);
            //is not returning the method of signin
            fetchSignInMethodsForEmail(auth, forgotPasswordEmail).then((result) => {
                console.log("here are the results: " + result);
            })

            let uid = null
            const userRef = collection(db, "users");
            const q = query(userRef, where("email", "==", forgotPasswordEmail));

            const querySnapshot = await getDocs(q);
            querySnapshot.forEach((doc) => {
                //test to make sure the correct document is retreived
                console.log(doc.id, " => ", doc.data());

                //just in case I need the uid
                uid = doc.id;
                console.log("the UID is: " + uid)

                //confirms if the user id and security answer matches the document that also has the email
                if((doc.data().username != userId) || (doc.data().securityAnswer != securityAnswer)) {
                    console.log("this if-statement is triggered");
                    throw new Error("Invalid Inputs")
                }
            });

            console.log("this is a valid user!!!")

            //need to check if the password is valid and is not a previous password
            //then update the password
            if(!isValidPassword(newPassword)) {
                throw new Error("invalid password")
            }
        } catch (error) {
            setError(error.message);
        }
    };

    const isValidPassword = (password) => {
        //const regex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d\S]{8,}$/; Not sure if this is right
        const regex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[\W_]).{8,}$/;
        return regex.test(password);
    }

    //checks to see if the account exist and if the user's input matches the security questions
    const accountExist = ({ email}) => {

    }

    const whoIsCurrentUser = async () => {
        console.log("The current user is: " + auth.currentUser);
        console.log("The user is: " + user)
    }

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
                            <button onClick={whoIsCurrentUser}>Show Current User</button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Forgot Password Popup */}
            {/*{showForgotPasswordPopup && (
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
                                {error && <p>{error}</p>}
                            </div>
                        )}
                    </div>
                </div>
            )}*/}

            {/* testing  */}
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
                                <div>
                                    <input
                                        type="password"
                                        placeholder="Password..."
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        required
                                    />
                                </div>
                                <button onClick={handleForgotPassword}>Reset Password</button>
                                {error && <p>{error}</p>}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
