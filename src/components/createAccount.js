import React from 'react';

export const CreateAccount = () => {
return (
    <div>
    <div>
        Balance Wizard
        <div>
        <button>New User</button> |
        <button>Login</button>
        </div>
    </div>
    <div>
        <div>
        Potential Menu Bar for Future Functions
        </div>
    </div>
    <div>
        <div>
        Create a New User
        </div>
        <form>
        <div>
            <label htmlFor="firstName">First Name:</label>
            <input type="text" id="firstName" />
        </div>
        <div>
            <label htmlFor="lastName">Last Name:</label>
            <input type="text" id="lastName" />
        </div>
        <div>
            <label htmlFor="address">Address:</label>
            <input type="text" id="address" />
        </div>
        <div>
            <label htmlFor="dob">Date of Birth:</label>
            <input type="text" id="dob" />
        </div>
        <div>
            <button type="submit">Submit</button>
        </div>
        </form>
    </div>
    </div>
);
};

export default CreateAccount;