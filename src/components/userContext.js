import React, { createContext, useContext, useState, useEffect } from 'react';
import { signOut, onAuthStateChanged} from "firebase/auth";
import { auth } from "../config/firebase";
import { getFirestore, doc, getDoc} from 'firebase/firestore';
import DefaultProfilePic from "./DefaultProfilePic.png";

const UserContext = createContext();

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState({ username: '', profilePic: '', role: '', status: '' });

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
                        role: userSnap.data().role,
                        status: userSnap.data().status
                    });
                    console.log("Username set to: ", userSnap.data().username);
                } else {
                    console.log("No user data found!");
                }
            } else {
                // User is signed out
                setUser({ username: '', profilePic: '', role: '', status: ''});
            }
        });
    
        // Cleanup subscription on unmount
        return () => unsubscribe();
    }, [setUser]); // Dependency array includes setUser to ensure it's stable

    const handleSignOut = async () => {
        try {
            await signOut(auth);
            await setUser({ username: '', profilePic: '', role: ''}); // Reset user state upon logout
            alert("You have been signed out.");
            window.location.href = "/"; // redirecting user to homepage upon logout
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