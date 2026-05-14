USE USER;

CREATE TABLE IF NOT EXISTS smtp_config (
    id INT AUTO_INCREMENT PRIMARY KEY,
    domain VARCHAR(255) NOT NULL UNIQUE,
    smtp_server VARCHAR(255) NOT NULL,
    smtp_port INT NOT NULL,
    sender_email VARCHAR(255) NOT NULL,
    sender_password VARCHAR(255) NOT NULL
);

-- Insert sample SMTP configurations for common email domains
INSERT IGNORE INTO smtp_config (domain, smtp_server, smtp_port, sender_email, sender_password)
VALUES
('gmail.com', 'smtp.gmail.com', 587, 'your_gmail@gmail.com', 'your_gmail_app_password'),
('yahoo.com', 'smtp.mail.yahoo.com', 587, 'your_yahoo@yahoo.com', 'your_yahoo_password'),
('outlook.com', 'smtp.office365.com', 587, 'your_outlook@outlook.com', 'your_outlook_password');

-- Update Gmail credentials with your App Password
UPDATE smtp_config
SET sender_password = 'your_gmail_app_password'
WHERE domain = 'gmail.com';

-- Update Yahoo credentials (if applicable)
UPDATE smtp_config
SET sender_password = 'your_valid_yahoo_password'
WHERE domain = 'yahoo.com';

-- Update Outlook credentials (if applicable)
UPDATE smtp_config
SET sender_password = 'your_valid_outlook_password'
WHERE domain = 'outlook.com';
