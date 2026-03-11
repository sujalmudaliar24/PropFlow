import nodemailer from 'nodemailer';

const sendEmail = async (options) => {
    // Create a transporter
    // For testing without a real SMTP, you can use Mailtrap or Ethereal
    // Or, configure actual SMTP credentials in .env
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST || 'smtp.mailtrap.io',
        port: process.env.EMAIL_PORT || 2525,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    // Define the email options
    const mailOptions = {
        from: 'PropFlow <noreply@propflow.com>',
        to: options.email,
        subject: options.subject,
        text: options.message,
    };

    // Send the email
    await transporter.sendMail(mailOptions);
};

export default sendEmail;
