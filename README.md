# Medicinal Plant Identification System

HerbiSight is a web-based medicinal plant information system built with HTML, CSS, JavaScript, Node.js, Express, MySQL, and Python. It provides a clean user interface for exploring medicinal plants, user signup/login, and an OTP-based password reset flow.

## Features

- Responsive landing and information pages for medicinal herbs
- Plant category pages for leaves, roots, seeds, barks, flowers, and all types
- User signup with password hashing using bcrypt
- User login with MySQL-backed authentication
- Forgot-password flow with OTP email support
- SMTP configuration stored in MySQL
- Static image assets for medicinal plant information cards

## Tech Stack

- Frontend: HTML, CSS, JavaScript
- Backend: Node.js, Express.js
- Database: MySQL
- Authentication: bcrypt
- Email/OTP: Python SMTP helper script
- Runtime tools: npm, Node.js, Python

## Project Structure

```text
MedicinalHerbDetection/
├── Public/
│   ├── img/
│   ├── main.html
│   ├── signin.html
│   ├── signup.html
│   ├── forgotpassword.html
│   └── styles and plant pages
├── database.sql
├── server.js
├── send_otp.py
├── package.json
└── README.md
```

## Requirements

- Node.js
- npm
- MySQL Server
- Python 3

## Setup

Clone the repository:

```bash
git clone https://github.com/Samek55/Medicinal-Plant-Identification-System.git
cd Medicinal-Plant-Identification-System
```

Install Node.js dependencies:

```bash
npm install
```

Create a `.env` file using `.env.example` as a guide:

```env
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=USER
```

Create the MySQL database:

```sql
CREATE DATABASE IF NOT EXISTS `USER`;
USE `USER`;

CREATE TABLE IF NOT EXISTS user_info (
  id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(255) NOT NULL,
  phone_number VARCHAR(30) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

Then import the SMTP table from `database.sql`:

```bash
mysql -u root -p USER < database.sql
```

Update the placeholder SMTP credentials in the `smtp_config` table before using the forgot-password feature.

## Run

Start the server:

```bash
npm start
```

Open the app in your browser:

```text
http://localhost:3000/main.html
```

Other useful pages:

```text
http://localhost:3000/signup.html
http://localhost:3000/signin.html
http://localhost:3000/forgotpassword.html
```

## Notes

- The image upload area is currently a frontend interface. A complete machine learning prediction backend can be added in a future version.
- Do not commit real SMTP passwords, database passwords, or app passwords to GitHub.
- Use Gmail app passwords or provider-specific app credentials for OTP email sending.

## Future Improvements

- Add a trained CNN model for plant image classification
- Store plant details in the database instead of static pages
- Add image upload and prediction API endpoints
- Add admin dashboard for managing plant data
- Improve form validation and session handling

## License

This project is available for educational use.
