import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import BalanceWizardLogo from "./BalanceWizardLogo.jpg"; // Import the logo
import { auth } from "../config/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { getFirestore, collection, setDoc, doc } from "firebase/firestore";
import { Link } from 'react-router-dom';
// import { sendEmailToAdmin } from "../functions/emailFunctions";
import './Styling.css';
import { useNavigate } from 'react-router-dom';

export const CreateAccount = () => {

    const [userData, setUserData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        dob: "",
        address: "",
        securityAnswer: ""
    });
    const [emailError, setEmailError] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [success, setSuccess] = useState(false); // Add success state

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        try {
            // Validate email
            if (!isValidEmail(userData.email)) {
                setEmailError("Please enter a valid email address");
                return;
            }

            // Vlidate password
            if (!isValidPassword(userData.password)) {
                setPasswordError("Please enter a valid password");
                return;
            }
    
            // Create user in Firebase Authentication
            const userCredential = await createUserWithEmailAndPassword(auth, userData.email, userData.password);
            const uid = userCredential.user.uid; // Get the UID
            const db = getFirestore();
            // Generate username
            const username = generateUsername(userData);
            // Add user data to Firestore
            const userRef = doc(db, "users", uid);
            await setDoc(userRef, {
                firstName: userData.firstName,
                lastName: userData.lastName,
                email: userData.email,
                dob: userData.dob,
                address: userData.address,
                securityAnswer: userData.securityAnswer,
                role: "Accountant",
                status: "Pending",
                username: username
            });
            // Send user data to Cloud Function for approval
            await fetch('/requestAccountCreation', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });

            // Send email to admin
            // I can't figure this out, if I leave it in it gives me a bunch of errors, I'll look into it later
            // await sendEmailToAdmin(userData);

            alert('Your account creation request has been submitted for approval.');
            // Set success to true after successful submission
            setSuccess(true);
            // Clear the form fields after submission
            setUserData({
                firstName: "",
                lastName: "",
                email: "",
                dob: "",
                address: "",
                securityAnswer: ""
            });
        } catch (error) {
            console.error("Error creating user:", error);
            // Handle errors here
        }
    };
    

    const handleChange = (e) => {
        const { name, value } = e.target;
        setUserData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const isValidEmail = (email) => {
        // Simple email validation regex
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    };

    //checks if the password: starts with a letter, has a number, has a special character, and contains at least 8 character  
    const isValidPassword = (password) => {
        //const regex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d\S]{8,}$/; Not sure if this is right
        const regex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[\W_]).{8,}$/;
        return regex.test(password);
    }

    const generateUsername = (userData) => {
        const month = new Date().getMonth() + 1;
        const year = new Date().getFullYear().toString().slice(-2);
        const username = userData.firstName.charAt(0).toUpperCase() + userData.lastName + month.toString().padStart(2, '0') + year;
        return username;
    };

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
                <Link to="/admin-interface"><button>Admin Interface</button></Link>
                <Link to="/send-email"><button>Send Email</button></Link>
                <Link to="/search-menu"><button>Search Menu</button></Link>
            </div>

            <div className="blue-box">
                <div className="user-box">
                    <form className="form-container" onSubmit={handleFormSubmit}>
                        <div className="label-container">
                            <label htmlFor="firstName" className="label">First Name:</label>
                            <input type="text" name="firstName" value={userData.firstName} onChange={handleChange} className="input-field" placeholder="First Name" required />
                        </div>
                        <div className="label-container">
                            <label htmlFor="lastName" className="label">Last Name:</label>
                            <input type="text" name="lastName" value={userData.lastName} onChange={handleChange} className="input-field" placeholder="Last Name" required />
                        </div>
                        <div className="label-container">
                            <label htmlFor="email" className="label">Email:</label>
                            <input type="email" name="email" value={userData.email} onChange={handleChange} className="input-field" placeholder="Email" required />
                            {emailError && <p className="error-message">{emailError}</p>}
                        </div>
                        <div className="label-container">
                            <label htmlFor="password" className="label">Password:</label>
                            <input type="password" name="password" value={userData.password} onChange={handleChange} className="input-field" placeholder="Password" required />
                            {passwordError && <p className="error-message">{passwordError}</p>}
                        </div>
                        <div className="label-container">
                            <label htmlFor="dob" className="label">Date of Birth:</label>
                            <input type="date" name="dob" value={userData.dob} onChange={handleChange} className="input-field" required />
                        </div>
                        <div className="label-container">
                            <label htmlFor="address" className="label">Address:</label>
                            <input type="text" name="address" value={userData.address} onChange={handleChange} className="input-field" placeholder="Address" required />
                        </div>
                        <div className="label-container">
                            <h>Security Question: What is the name of the city you were born in?</h>
                        </div>
                        <div className="label-container">
                            <label htmlFor="securityAnswer" className="label">Security Answer:</label>
                            <input type="text" name="securityAnswer" value={userData.securityAnswer} onChange={handleChange} className="input-field" placeholder="Security Answer" required />
                        </div>
                        {/*<div className="label-container">
                            <label htmlFor="password" className="label">Password:</label>
                            <input type="password" name="password" value={userData.password} onChange={handleChange} className="input-field" placeholder="Password" required />
                            {passwordError && <p className="error-message">{passwordError}</p>}
                        </div>
                        */}
                        <div className="submit-button">
                            <button type="submit" className="button">Submit</button>
                        </div>
                    </form>
                </div>
            </div>
            {success && <Navigate to="/" />} {/* Redirect if success is true */}
        </div>
    );
};