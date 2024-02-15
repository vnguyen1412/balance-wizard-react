import {auth} from "../config/firebase";
import { createUserWithEmailAndPassword} from "firebase/auth";
import BalanceWizardLogo from "./BalanceWizardLogo.jpg";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

// the "placeholer" attribute is provide a short hint in the textbox about the expected value for the input field (it is the gray word you see in a text box to know what to type in)

export const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const navigate = useNavigate();

    const handleButtonClick = () => {
        navigate('/create-account');
    }

    //"async" make this an asynchronous function
    const signIn = async () => {
        await createUserWithEmailAndPassword(auth, email, password);
    }

    return (
        <div>
            {/* Make up the top with the logo */}
            <div className="container">
                <img src={BalanceWizardLogo} alt="logo" className="logo" />
                <h1 className="title">Balance Wizard</h1>
            </div>

            {/* Navbar */}
            <div style={{ backgroundColor: '#AFABAB', textAlign: 'center', color: 'black', padding: '10px', border: '1px solid black' }}>
                Menu Bar for Future Functions
            </div>

            <div className="blue-box">
                <div className="user-box">
                    <h2 className="user-box-tiel"> Login </h2>
                    <form className="form-container">
                        <div className="label-container">
                            <label htmlFor="email" className="label"> Email: </label>
                            <input
                                placeholder="Email..."
                                /*onChange={(e) => setEmail(e.target.value)}*/
                                id="email"
                                className="input-field"
                            />
                        </div>
                        <div className="label-container">
                            <label htmlFor="password" className="label"> Email: </label>
                            <input
                                placeholder="Password..."
                                /*onChange={(e) => setPassword(e.target.value)}*/
                                id="password"
                                className="input-field"
                                type="password"
                            />
                        </div>
                        <div className="submit-button">
                            <button className="button-spacing" onClick={handleButtonClick}> New User </button>
                            <button className="button-spacing"> Forgot Password </button>
                            <button className="button-spacing"> Log In </button> 
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};