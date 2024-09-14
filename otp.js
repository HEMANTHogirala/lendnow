const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const cors = require('cors');

const app = express();

app.use(bodyParser.json());
app.use(cors());

// In-memory store for OTPs; use a database in production
const otpStore = {};

// Configure Nodemailer
const transporter = nodemailer.createTransport({
    service: 'Gmail', // Replace with your email provider
    auth: {
        user: "hemu230879@gmail.com",
        pass: "narj dgwr dquf yaox"
    },
    tls: {
        rejectUnauthorized: false // Disable SSL verification
    }
});

app.post('/send-otp', (req, res) => {
    const email = req.body.email;
    const otp = Math.floor(100000 + Math.random() * 900000);
    otpStore[email] = otp;

    const mailOptions = {
        from: "hemu230879@gmail.com", // Use a valid email address
        to: email,
        subject: 'Your OTP Code',
        text: `Your OTP code is ${otp}` // Use backticks for template string
    };

    console.log('Sending email to:', email); // Add this line

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error sending email:', error);
            return res.status(500).send({ message: 'Error sending email' });
        } else {
            res.send({ message: 'OTP sent successfully' });
        }
    });
});

app.post('/verify-otp', (req, res) => {
    const email = req.body.email;
    const otp = req.body.otp;

    if (otpStore[email] && otpStore[email] == otp) {
        delete otpStore[email];  // OTP is valid, remove it from store
        res.send({ message: 'OTP verified successfully' });
    } else {
        res.status(400).send({ message: 'Invalid OTP' });
    }
});

const PORT = process.env.PORT || 4000; // Use environment variable or default to 4000
app.listen(PORT, () => {
    console.log(`OTP server is running on port ${PORT}`); // Use backticks for template string
});
