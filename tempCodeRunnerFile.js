const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');
const nodemailer = require('nodemailer');
const cors = require('cors');
const app = express();
const port = 3019;

const mongoUri = 'mongodb+srv://meher:ABCD1234@cluster0.lnn9uw5.mongodb.net/app';

// Connect to MongoDB
mongoose.connect(mongoUri, {
    serverSelectionTimeoutMS: 5000,
}).then(() => {
    console.log("Connected to MongoDB");
}).catch((error) => {
    console.error("MongoDB connection error:", error);
});

// Create Mongoose Schema for OTP
const otpSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    otp: {
        type: Number,
        required: true
    }
});
const Otp = mongoose.model('Otp', otpSchema, 'att');
const otpStore = {};

// Create Mongoose Schema for Personal Information
const personalInfoSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true
    },
    dob: {
        type: Date,
        required: true
    },
    gender: {
        type: String,
        required: true
    },
    maritalStatus: {
        type: String,
        required: true
    },
    mobilenumber: {
        type: String,
        required: true
    }
});
const PersonalInfo = mongoose.model('PersonalInfo', personalInfoSchema, 'pif');

// Create Mongoose Schema for Employee Information
const empSchema = new mongoose.Schema({
    employmenttype: {
        type: String,
        required: true
    },
    employername: {
        type: String,
        required: true
    },
    designation: {
        type: String,
        required: true
    },
    workaddress: {
        type: String,
        required: true
    },
    monthlyincome: {
        type: Number,
        required: true
    }
});
const EmpInfo = mongoose.model('EmpInfo', empSchema, 'eif');

// Mongoose schema for PAN
const panSchema = new mongoose.Schema({
    pancardnumber: {
        type: String,
        required: true
    },
    pincode: {
        type: Number,
        required: true
    }
});
const Pan = mongoose.model('Pan', panSchema, 'pan');

const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: "hemu230879@gmail.com",
        pass: "narj dgwr dquf yaox"
    },
    tls: {
        rejectUnauthorized: false
    }
});

app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Serve static files
app.use(express.static(path.join(__dirname)));

// Define Root Route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'scrn1.html'));
});

// Send OTP
app.post('/send-otp', (req, res) => {
    const email = req.body.email;
    const otp = Math.floor(100000 + Math.random() * 900000);
    otpStore[email] = otp;

    const mailOptions = {
        from: 'hemu230879@gmail.com',
        to: email,
        subject: 'Your OTP Code',
        text: `Your OTP code is ${otp}`
    };

    console.log('Sending email to:', email);

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error sending email:', error);
            return res.status(500).send({ message: 'Error sending email' });
        } else {
            res.send({ message: 'OTP sent successfully', otp: otp });
        }
    });
});

// Verify OTP
app.post('/verify-otp', (req, res) => {
    const email = req.body.email;
    const otp = req.body.otp;

    if (otpStore[email] && otpStore[email] == otp) {
        delete otpStore[email];
        res.send({ message: 'OTP verified successfully' });
    } else {
        res.status(400).send({ message: 'Invalid OTP' });
    }
});

// Route to handle personal information submission from scrn2.html
app.post('/apply2', async (req, res) => {
    try {
        const { fullName, dob, gender, maritalStatus, mobilenumber } = req.body;
        console.log('Received personal information:', req.body);

        const personalInfo = new PersonalInfo({
            fullName,
            dob,
            gender,
            maritalStatus,
            mobilenumber,
        });

        await personalInfo.save();
        res.redirect('/employee.html');
    } catch (error) {
        console.error('Error handling personal information submission:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Serve employee.html
app.get('/employee.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'employee.html'));
});

// Route to handle employee information submission
app.post('/apply3', async (req, res) => {
    try {
        const { employmenttype, employername, designation, workaddress, monthlyincome } = req.body;
        console.log('Received employee information:', req.body);

        const empInfo = new EmpInfo({
            employmenttype,
            employername,
            designation,
            workaddress,
            monthlyincome
        });

        await empInfo.save();
        res.redirect('/pan.html');
    } catch (error) {
        console.error('Error handling employee information submission:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Serve pan.html
app.get('/pan.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'pan.html'));
});

// Route to handle PAN information submission
app.post('/apply4', async (req, res) => {
    try {
        const { pancardnumber, pincode } = req.body;
        console.log('Received PAN information:', req.body);

        const panInfo = new Pan({
            pancardnumber,
            pincode
        });

        await panInfo.save();
        res.redirect('/terms.html');
    } catch (error) {
        console.error('Error handling PAN information submission:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Serve terms.html
app.get('/terms.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'terms.html'));
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
