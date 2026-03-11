import nodemailer from 'nodemailer';

const sendEmail = async (options) => {
    let transporter;

    if (process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        // Use real SMTP if configured
        transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT || 587,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });
    } else {
        // Generate a fake test account for development (Ethereal)
        const testAccount = await nodemailer.createTestAccount();
        transporter = nodemailer.createTransport({
            host: "smtp.ethereal.email",
            port: 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: testAccount.user, // generated ethereal user
                pass: testAccount.pass, // generated ethereal password
            },
        });
    }

    const mailOptions = {
        from: '"PropFlow" <noreply@propflow.com>',
        to: options.email,
        subject: options.subject,
        text: options.message,
    };

    const info = await transporter.sendMail(mailOptions);
    
    // Log the preview URL so the user can see the OTP without a real email inbox
    console.log("Message sent: %s", info.messageId);
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
};

export default sendEmail;
