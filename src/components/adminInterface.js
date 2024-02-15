import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getFirestore, collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { signInWithEmailAndPassword, getAuth } from '@firebase/auth';
import { isAdmin } from './auth';
import BalanceWizardLogo from "./BalanceWizardLogo.jpg";
import './Styling.css';

const AdminInterface = () => {
    const [currentUsers, setCurrentUsers] = useState([]);
    const [pendingUsers, setPendingUsers] = useState([]);
    const [editingUser, setEditingUser] = useState(null);
    const [editFormData, setEditFormData] = useState({
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

    return (
        <div>
            <div className="container">
                <Link to="/">
                    <img src={BalanceWizardLogo} alt="logo" className="logo" />
                </Link>
                <h2 className="title">Admin Interface</h2>
            </div>
            <div className="blue-box">
                <div className="user-box">
                    <h3>Current Users</h3>
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
                            {currentUsers.map(user => (
                                <tr key={user.id}>
                                    <td>{`${user.firstName} ${user.lastName}`}</td>
                                    <td>{user.email}</td>
                                    <td>{user.role}</td>
                                    <td>{user.status}</td>
                                    <td>
                                        <button onClick={() => handleEditInitiate(user)}>Edit</button>
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
                            {pendingUsers.map(user => (
                                <tr key={user.id}>
                                    <td>{`${user.firstName} ${user.lastName}`}</td>
                                    <td>{user.email}</td>
                                    <td>{user.role}</td>
                                    <td>{user.status}</td>
                                    <td>
                                        <button onClick={() => approveUser(user.id)}>Approve</button>
                                        <button onClick={() => rejectUser(user.id)}>Reject</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            {editingUser && (
                <div className="edit-form-overlay">
                    <div className="edit-form">
                        <h3>Edit User</h3>
                        <form onSubmit={editUser}>
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
                                <input type="text" name="role" value={editFormData.role} onChange={handleEditChange} required />
                            </div>
                            <button type="submit">Save Changes</button>
                            <button onClick={() => setEditingUser(null)}>Cancel</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
    
    
};

export default AdminInterface;