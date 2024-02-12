import {auth} from "../config/firebase";
import { createUserWithEmailAndPassword} from "firebase/auth";
import { useState } from "react";

// the "placeholer" attribute is provide a short hint in the textbox about the expected value for the input field (it is the gray word you see in a text box to know what to type in)

export const Auth = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    //"async" make this an asynchronous function
    const signIn = async () => {
        await createUserWithEmailAndPassword(auth, email, password);
    }

    //onChange={(e) => setEmail(e.target.value)}
    //onChange is an event handler that fires whenever the value of the input field chaanges
    //e.target.value refers to the elements that triggered the event which is the "input field" in this case and it also gets the current value in the input field
    //setEmail will then update the state variable that we created above
    return (
        <div>
            <h>
                Email
            </h>
            <div>
                <input
                    placeholder="Email..."
                    onChange={(e) => setEmail(e.target.value)}
                />
            </div>
            <h>
                Password
            </h>
            <div>
                <input
                    placeholder="Password..."
                    type="password"
                    onChange={(e) => setPassword(e.target.value)}
                />
            </div>
            <button> Sign In </button>
        </div>
    );
};