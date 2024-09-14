const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');

const app = express();
const port = 3015;

const mongoUri = 'mongodb+srv://prasunavempatii:ABCDE2423@cluster0.kpfpbct.mongodb.net/try?retryWrites=true&w=majority&appName=Cluster0';

// Connect to MongoDB
mongoose.connect(mongoUri, {
    serverSelectionTimeoutMS: 5000,
}).then(() => {
    console.log("Connected to MongoDB");
}).catch((error) => {
    console.error("MongoDB connection error:", error);
});

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
    email: {
        type: String,
        required: true
    }
});
const PersonalInfo = mongoose.model('PersonalInfo', personalInfoSchema, 'pif');

// Middleware
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the root directory
app.use(express.static(path.join(__dirname)));

// Define Route to Serve s.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 's.html'));
});

// Route to handle personal information submission
app.post('/apply2', async (req, res) => {
    try {
        console.log('Received request at /apply2');
        console.log('Request body:', req.body);

        const { fullName, dob, gender, maritalStatus, email } = req.body;
        console.log('Received personal information:', req.body);

        // Save the personal information to the database
        const personalInfo = new PersonalInfo({
            fullName,
            dob,
            gender,
            maritalStatus,
            email
        });

        await personalInfo.save();

        // Redirect to the same page to show success
        res.redirect('/');
    } catch (error) {
        console.error('Error handling personal information submission:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
