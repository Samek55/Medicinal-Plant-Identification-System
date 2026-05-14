const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const path = require('path');
const { spawn } = require('child_process');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// === Database Connection ===
const db = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'USER'
});

db.connect(err => {
    if (err) {
        console.error('❌ Database connection failed:', err);
        process.exit(1);
    }
    console.log('✅ Connected to MySQL Database');
});

// === Middleware ===
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'Public')));

// === In-Memory OTP Store (temporary) ===
const otpMemory = {};

// === Signup Route ===
app.post('/submit-form', async (req, res) => {
    const { fullName, phoneNumber, email, password } = req.body;

    if (!fullName || !phoneNumber || !email || !password) {
        return res.status(400).json({ message: 'All fields are required.' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const query = 'INSERT INTO user_info (full_name, phone_number, email, password) VALUES (?, ?, ?, ?)';

        db.query(query, [fullName.trim(), phoneNumber.trim(), email.trim(), hashedPassword], (err) => {
            if (err) {
                if (err.code === 'ER_DUP_ENTRY') {
                    const message = err.sqlMessage.includes('email')
                        ? 'Email address already exists.'
                        : 'Phone number already exists.';
                    return res.status(409).json({ message });
                }
                console.error('❌ Database error on signup:', err);
                return res.status(500).json({ message: 'Signup failed, please try again later.' });
            }
            res.status(200).json({ message: 'Signup successful!' });
        });
    } catch (error) {
        console.error('❌ Password hashing error:', error);
        res.status(500).json({ message: 'Server error during signup.' });
    }
});

// === Login Route ===
app.post("/login", (req, res) => {
    const { email, password } = req.body;

    const query = "SELECT * FROM user_info WHERE email = ?";
    db.query(query, [email.trim()], async (err, results) => {
        if (err) {
            console.error("❌ SQL query error during login:", err);
            return res.status(500).json({ message: "Server error during login." });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: "Email not found." });
        }

        const user = results[0];
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ message: "Incorrect password." });
        }

        res.status(200).json({ message: "Login successful!" });
    });
});

// === Forgot Password Route ===
app.post('/forgot-password', (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ message: 'Email is required' });
    }

    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpMemory[email] = { otp, expiry: Date.now() + 10 * 60 * 1000 }; // Store OTP with 10-minute expiry

    // Fetch SMTP details from the database based on the email domain
    const emailDomain = email.split('@')[1];
    const query = 'SELECT smtp_server, smtp_port, sender_email, sender_password FROM smtp_config WHERE domain = ?';

    db.query(query, [emailDomain], (err, results) => {
        if (err) {
            console.error('❌ Database error while fetching SMTP details:', err);
            return res.status(500).json({ message: 'Server error while fetching SMTP details.' });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: `No SMTP configuration found for domain: ${emailDomain}` });
        }

        const smtpDetails = results[0];

        const scriptPath = path.join(__dirname, 'send_otp.py');
        const args = [
            scriptPath,
            smtpDetails.smtp_server.trim(),
            smtpDetails.smtp_port,
            smtpDetails.sender_email.trim(),
            smtpDetails.sender_password.trim(),
            email.trim(),
            otp.trim()
        ];

        const pythonProcess = spawn('python', args);

        pythonProcess.on('error', (err) => {
            console.error('Python execution failed:', err.message);
        });

        pythonProcess.stdout.on('data', (data) => {
            console.log(`Python Output: ${data}`);
        });

        pythonProcess.stderr.on('data', (data) => {
            console.error(`Python Error: ${data}`);
        });

        pythonProcess.on('close', (code) => {
            if (code !== 0) {
                console.error(`Python process exited with code ${code}`);
                return res.status(500).json({ message: 'Failed to send OTP.' });
            } else {
                res.json({ message: 'OTP sent successfully.' });
            }
        });
    });
});

// === Reset Password Route ===
app.post('/reset-password', async (req, res) => {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
        return res.status(400).json({ message: 'Email, OTP, and new password are required.' });
    }

    // Check if OTP is valid and not expired
    const storedOtpData = otpMemory[email];
    if (!storedOtpData || storedOtpData.otp !== otp || Date.now() > storedOtpData.expiry) {
        return res.status(400).json({ message: 'Invalid or expired OTP.' });
    }

    try {
        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update the password in the database
        const query = 'UPDATE user_info SET password = ? WHERE email = ?';
        db.query(query, [hashedPassword, email.trim()], (err, results) => {
            if (err) {
                console.error('❌ Database error while updating password:', err);
                return res.status(500).json({ message: 'Failed to update password. Please try again later.' });
            }

            if (results.affectedRows === 0) {
                return res.status(404).json({ message: 'Email not found.' });
            }

            // Remove OTP from memory after successful password reset
            delete otpMemory[email];

            console.log(`✅ Password successfully updated for email: ${email}`); // Log success message in terminal
            res.status(200).json({ message: 'Password successfully changed!' });
        });
    } catch (error) {
        console.error('❌ Error while hashing password:', error);
        res.status(500).json({ message: 'Server error while updating password.' });
    }
});

// === Start Server ===
app.listen(port, () => {
    console.log(`🚀 Server running at: http://localhost:${port}`);
});
