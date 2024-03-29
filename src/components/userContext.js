import React, { createContext, useContext, useState } from 'react';
import { signOut } from "firebase/auth";
import { auth } from "../config/firebase"; // Adjust the import path as necessary

const UserContext = createContext();

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState({ username: '', profilePic: '' });

    const handleSignOut = async () => {
        try {
            await signOut(auth);
            await setUser({ username: '', profilePic: '' }); // Reset user state upon logout
            alert("You have been signed out.");
        } catch (error) {
            console.error("Error signing out: ", error);
        }
    };
    // Provide handleSignOut along with the user state
    return (
        <UserContext.Provider value={{ user, setUser, handleSignOut }}>
            {children}
        </UserContext.Provider>
    );
};

