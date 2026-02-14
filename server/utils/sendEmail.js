const nodemailer = require('nodemailer');

const sendEmail = async ({ to, subject, html }) => {
    // Create a test account (Ethereal)
    const testAccount = await nodemailer.createTestAccount();

    // Create transporter using Ethereal SMTP
    const transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        auth: {
            user: testAccount.user,
            pass: testAccount.pass
        }
    });

    const mailOptions = {
        from: `"Bookmatcha" <no-reply@bookmatcha.com>`,
        to,
        subject,
        html
    };

    const info = await transporter.sendMail(mailOptions);

    // Print the preview URL in console so you can view the email
    console.log('Message sent: %s', info.messageId);
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
};

module.exports = sendEmail;
