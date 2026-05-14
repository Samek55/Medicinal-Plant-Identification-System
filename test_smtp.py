import smtplib
from email.mime.text import MIMEText

def test_smtp(smtp_server, smtp_port, sender_email, sender_password, recipient_email):
    subject = "SMTP Test Email"
    body = "This is a test email to verify SMTP credentials."

    msg = MIMEText(body)
    msg['Subject'] = subject
    msg['From'] = sender_email
    msg['To'] = recipient_email

    try:
        with smtplib.SMTP(smtp_server, smtp_port) as server:
            server.starttls()  # Start TLS encryption
            server.login(sender_email, sender_password)  # Login using the App Password
            server.sendmail(sender_email, recipient_email, msg.as_string())  # Send the email
        print("SMTP test email sent successfully")
    except smtplib.SMTPAuthenticationError as e:
        print(f"SMTP Authentication Error: {e}")
    except smtplib.SMTPConnectError as e:
        print(f"SMTP Connection Error: {e}")
    except smtplib.SMTPException as e:
        print(f"SMTP Error: {e}")
    except Exception as e:
        print(f"Unexpected Error: {e}")

if __name__ == "__main__":
    smtp_server = "smtp.gmail.com"
    smtp_port = 587
    sender_email = "shreesumm@gmail.com"  # Replace with your Gmail address
    sender_password = "ncxa uxom qtcm eugn"  # Replace with your App Password
    recipient_email = "kanekiconfigs@gmail.com"  # Replace with the recipient's email address

    test_smtp(smtp_server, smtp_port, sender_email, sender_password, recipient_email)
