const nodemailer = require('nodemailer');
// Function to send email to admin
async function sendEmailToAdmin(userData) {
    try {
        // Create a Nodemailer transporter using SMTP transport
        let transporter = nodemailer.createTransport({
            service: 'gmail', // SMTP host provider
            auth: {
                user: 'balancewizardksu@gmail.com', // Your email address
                pass: 'aafpsbyyiqwlvbli' // Your email password or app-specific password
            },
        });

        // Setup email data
        let mailOptions = {
            from: 'balancewizardksu@gmail.com', // Sender email address
            to: 'balancewizardksu@gmail.com', // Admin email address
            subject: 'New account creation request', // Email subject
            text: `
                Hi Admin,

                A new account creation request has been submitted:
                First Name: ${userData.firstName}
                Last Name: ${userData.lastName}
                Email: ${userData.email}
                Date of Birth: ${userData.dob}
                Address: ${userData.address}

                Please review and approve the request and approve at the following link.
                LINK HERE TBD


                Regards,
                Your App Team
            `
        };

        // Send email
        let info = await transporter.sendMail(mailOptions);
        console.log('Email sent: ', info.messageId());
    } catch (error) {
        console.error('Error sending email:', error);
        throw new Error('Failed to send email');
    }
};

module.export = {sendEmailToAdmin};