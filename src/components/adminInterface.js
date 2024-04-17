import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getFirestore, collection, getDocs, doc, updateDoc, getDoc, addDoc } from 'firebase/firestore';
import { signInWithEmailAndPassword, getAuth, sendPasswordResetEmail, createUserWithEmailAndPassword } from '@firebase/auth';
import { isAdmin } from './auth';
import { auth } from "../config/firebase";
import BalanceWizardLogo from "./BalanceWizardLogo.jpg";
import './Styling.css';
import { useUser } from './userContext';

const AdminInterface = () => {
    const [currentUsers, setCurrentUsers] = useState([]);
    const [pendingUsers, setPendingUsers] = useState([]);
    const [editingUser, setEditingUser] = useState(null);
    const [resetSent, setResetSent] = useState(false);
    const { user, handleSignOut } = useUser();
    const [editFormData, setEditFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        dob: "",
        address: "",
        role: ""
    });
    const [creatingUser, setCreatingUser] = useState(false); // State to control the visibility of the create user popup
    const [newUserData, setNewUserData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        dob: "",
        address: "",
        role: ""
    });

    useEffect(() => {
        if (isAdmin()) {
            fetchUsers();
        }
    }, []);

    const fetchUsers = async () => {
        try {
            const db = getFirestore();
            const usersRef = collection(db, 'users');
            const usersSnapshot = await getDocs(usersRef);
            const usersData = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            const current = usersData.filter(user => user.status === 'Approved').sort((a, b) => a.firstName.localeCompare(b.firstName));
            const pending = usersData.filter(user => user.status === 'Pending').sort((a, b) => a.firstName.localeCompare(b.firstName));
            setCurrentUsers(current);
            setPendingUsers(pending);
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    const approveUser = async (userId) => {
        try {
            const db = getFirestore();
            const userRef = doc(db, 'users', userId);
            await updateDoc(userRef, { status: 'Approved' });
            const userDocSnap = await getDoc(userRef);
            if (userDocSnap.exists()) {
                const userData = userDocSnap.data();
                await sendPasswordResetEmail(auth, userData.email);
            } else {
                console.log("User document not found");
                return null;
            }
            setResetSent(true);
            fetchUsers();
        } catch (error) {
            console.error('Error approving user:', error);
        }
    };

    const rejectUser = async (userId, userEmail) => {
        try {
            const db = getFirestore();
            const userRef = doc(db, 'users', userId);
            await updateDoc(userRef, { status: 'Rejected' });
            await deleteUserAccount(userEmail);
            fetchUsers();
        } catch (error) {
            console.error('Error rejecting user:', error);
        }
    };

    const deleteUserAccount = async (userEmail) => {
        try {
            const userCredential = await getUserByEmail(userEmail);
            if (userCredential) {
                const user = userCredential.user;
                await deleteUser(user.uid);
            }
        } catch (error) {
            console.error('Error deleting user account:', error);
        }
    };

    const getUserByEmail = async (email) => {
        try {
            const auth = getAuth();
            return await signInWithEmailAndPassword(auth, email, 'tempPassword');
        } catch (error) {
            console.error('Error getting user by email:', error);
            return null;
        }
    };

    const deleteUser = async (userId) => {
        try {
            const auth = getAuth();
            await deleteUser(auth.currentUser);
        } catch (error) {
            console.error('Error deleting user:', error);
        }
    };

    const handleEditInitiate = (user) => {
        setEditingUser(user);
        setEditFormData({
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            dob: user.dob,
            address: user.address,
            role: user.role
        });
    };

    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setEditFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const editUser = async () => {
        try {
            const db = getFirestore();
            const userRef = doc(db, 'users', editingUser.id);
            await updateDoc(userRef, editFormData);
            fetchUsers();
            setEditingUser(null);
        } catch (error) {
            console.error('Error editing user:', error);
        }
    };

    const handleSubmitEdit = async (event) => {
        event.preventDefault(); // Prevent default form submission behavior
        
        // Call your editUser function or any other form handling logic here
        editUser();
    };
    const handleSubmitCreate = async (event) => {
        event.preventDefault(); // Prevent default form submission behavior
        
        // Call your editUser function or any other form handling logic here
        createUser();
    };
    
    const createUser = async () => {
        try {
            const auth = getAuth();
            const password = "tempPassword"; //probably make this random at some point
            const email = newUserData.email;

            if(newUserData.role != "Accountant" && newUserData.role != "Manager" && newUserData.role != "Administrator") {
                newUserData.role = "Accountant";
            }
            
            // First, create a Firebase Authentication account
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
    
            // Then, add the user data to Firestore
            const db = getFirestore();
            const newUserRef = await addDoc(collection(db, 'users'), {
                ...newUserData,
                uid: user.uid, // Add the UID from Firebase Authentication
                status: "Approved" // Set initial status to Approved
            });

            //Send the user an email to set their pasword
            await sendPasswordResetEmail(auth, email);

            console.log("Document written with ID: ", newUserRef.id);
            fetchUsers();
            setCreatingUser(false); // Close the popup after user is created
        } catch (error) {
            console.error('Error creating user:', error);
        }
    };
    const handleNewUserChange = (e) => {
        const { name, value } = e.target;
        setNewUserData(prevState => ({
            ...prevState,
            [name]: value
        }));
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
                            </>
                        )}
                    </>
                ) : (
                    <div>Please login to navigate the application</div>
                )}
            </div>
            
            <div className="blue-box">
                <div className="user-box">
                    <h3>Current Users</h3>
                    {user.role === 'Administrator' && (
                        <button onClick={() => setCreatingUser(true)}>Create New User</button>
                    )}
                    <table>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentUsers.map(users => (
                                <tr key={users.id}>
                                    <td>{`${users.firstName} ${users.lastName}`}</td>
                                    <td>{users.email}</td>
                                    <td>{users.role}</td>
                                    <td>{users.status}</td>
                                    <td>
                                    {user.role === 'Administrator' && (
                                        <button onClick={() => handleEditInitiate(users)}>Edit</button>
                                    )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="user-box">
                    <h3>Pending Users</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pendingUsers.map(users => (
                                <tr key={users.id}>
                                    <td>{`${users.firstName} ${users.lastName}`}</td>
                                    <td>{users.email}</td>
                                    <td>{users.role}</td>
                                    <td>{users.status}</td>
                                    <td>
                                        <button onClick={() => approveUser(users.id)}>Approve</button>
                                        <button onClick={() => rejectUser(users.id)}>Reject</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            {editingUser && (
                <div className="popup">
                    <div className="popup-content">
                        <h3>Edit User</h3>
                        <form onSubmit={handleSubmitEdit}>
                            <div className="form-group">
                                <label htmlFor="firstName">First Name:</label>
                                <input type="text" name="firstName" value={editFormData.firstName} onChange={handleEditChange} required />
                            </div>
                            <div className="form-group">
                                <label htmlFor="lastName">Last Name:</label>
                                <input type="text" name="lastName" value={editFormData.lastName} onChange={handleEditChange} required />
                            </div>
                            <div className="form-group">
                                <label htmlFor="email">Email:</label>
                                <input type="email" name="email" value={editFormData.email} onChange={handleEditChange} required />
                            </div>
                            <div className="form-group">
                                <label htmlFor="dob">Date of Birth:</label>
                                <input type="date" name="dob" value={editFormData.dob} onChange={handleEditChange} required />
                            </div>
                            <div className="form-group">
                                <label htmlFor="address">Address:</label>
                                <input type="text" name="address" value={editFormData.address} onChange={handleEditChange} required />
                            </div>
                            <div className="form-group">
                                <label htmlFor="role">Role:</label>
                                <select name="role" value={editFormData.role} onChange={handleEditChange} required>
                                    <option value="Accountant">Accountant</option>
                                    <option value="Manager">Manager</option>
                                    <option value="Administrator">Administrator</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label htmlFor="suspensionStartDate">Suspension Start Date:</label>
                                <input type="date" name="suspensionStartDate" value={editFormData.suspensionStartDate} onChange={handleEditChange} />
                            </div>
                            <div className="form-group">
                                <label htmlFor="suspensionExpiryDate">Suspension Expiry Date:</label>
                                <input type="date" name="suspensionExpiryDate" value={editFormData.suspensionExpiryDate} onChange={handleEditChange} />
                            </div>
                            <button type="submit">Save Changes</button>
                            <button onClick={() => setEditingUser(null)}>Cancel</button>
                        </form>
                    </div>
                </div>
            )}
            {creatingUser && (
                <div className="popup">
                    <div className="popup-content">
                        <h3>Create New User</h3>
                        <form onSubmit={handleSubmitCreate}>
                            <div className="form-group">
                                <label htmlFor="firstName">First Name:</label>
                                <input type="text" name="firstName" value={newUserData.firstName} onChange={handleNewUserChange} required />
                            </div>
                            <div className="form-group">
                                <label htmlFor="lastName">Last Name:</label>
                                <input type="text" name="lastName" value={newUserData.lastName} onChange={handleNewUserChange} required />
                            </div>
                            <div className="form-group">
                                <label htmlFor="email">Email:</label>
                                <input type="email" name="email" value={newUserData.email} onChange={handleNewUserChange} required />
                            </div>
                            <div className="form-group">
                                <label htmlFor="dob">Date of Birth:</label>
                                <input type="date" name="dob" value={newUserData.dob} onChange={handleNewUserChange} required />
                            </div>
                            <div className="form-group">
                                <label htmlFor="address">Address:</label>
                                <input type="text" name="address" value={newUserData.address} onChange={handleNewUserChange} required />
                            </div>
                            <div className="form-group">
                                <label htmlFor="role">Role:</label>
                                <select name="role" value={newUserData.role} onChange={handleNewUserChange} required>
                                    <option value="Accountant">Accountant</option>
                                    <option value="Manager">Manager</option>
                                    <option value="Administrator">Administrator</option>
                                </select>
                            </div>
                            <button type="submit">Create User</button>
                            <button onClick={() => setCreatingUser(false)}>Cancel</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminInterface;
