import smtplib
from email.message import EmailMessage
import os
from dotenv import load_dotenv
from pathlib import Path

# Load .env
BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / "backend" / ".env")

EMAIL_USER = os.getenv("EMAIL_HOST_USER")
EMAIL_PASS = os.getenv("EMAIL_HOST_PASSWORD")

print(f"Testing with: {EMAIL_USER}")

msg = EmailMessage()
msg.set_content("This is a test email from SkillConnect testing script.")
msg['Subject'] = "SkillConnect SMTP Test"
msg['From'] = f"SkillConnect <{EMAIL_USER}>"
msg['To'] = EMAIL_USER # Send to yourself for testing

try:
    with smtplib.SMTP('smtp.gmail.com', 587) as smtp:
        smtp.starttls()
        print("Logging in...")
        smtp.login(EMAIL_USER, EMAIL_PASS)
        print("Sending...")
        smtp.send_message(msg)
        print("Email sent successfully!")
except Exception as e:
    print(f"FAILED to send email: {e}")
