
import BalanceWizardLogo from "./BalanceWizardLogo.jpg";
import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { getAuth, updatePassword } from "firebase/auth";
import "./Styling.css";

export const ForgetPassword = () => {
    const [success, setSuccess] = useState(false);

    const auth = getAuth();

    const user = auth.currentUser;
    console.log("The current user is: " + user)
    /*const newPassword = getASecureRandomPassword();*/
    const newPassword = "";

    updatePassword(user, newPassword).then(() => {
    // Update successful.
    }).catch((error) => {
    // An error ocurred
    // ...
    });

    const [userData, setUserData] = useState({
        newPassword: ""
    });

    //checks to see if the password is valid
    const isValidPassword = (password) => {
        const regex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d\S]{8,}$/;
        return regex.test(password);
    }

    const handleChange = (e) => {
        const { name, value } = e.target;
        setUserData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        /*try {
            // Validate email
            if (!isValidPassword(userData.newPassword)) {
                {!isValidPassword & <h>Please enter a valid email address</h>}
                return;
            }

            // Create user in Firebase Authentication
            const userCredential = await createUserWithEmailAndPassword(auth, userData.email, 'tempPassword');
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
                address: ""
            });
        } catch (error) {
            console.error("Error creating user:", error);
            // Handle errors here
        }*/
    };

    return (
        <div>
            <div className="container">
                <img src={BalanceWizardLogo} alt="logo" className="logo" />
                <h1 className="title">Password Reset</h1>
            </div>

            <h> The current user is: {newPassword}</h>

            <div className="blue-box">
                <div className="user-box">
                    <form className="form-container" onSubmit={handleFormSubmit}>
                        <div className="center">
                            <label htmlFor="newPassword" className="label">New Password:</label>
                            <input type="text" name="newPassword" value={userData.newPassword} onChange={handleChange} className="input-field" placeholder="New Password" required />
                        </div>
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