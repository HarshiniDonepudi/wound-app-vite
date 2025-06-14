import smtplib
from email.mime.text import MIMEText

GMAIL_USER = 'harshinidonepudi03@gmail.com'
GMAIL_APP_PASSWORD = 'sdwx aynq cafd bccw'

def send_email(to_email, subject, body):
    msg = MIMEText(body)
    msg['Subject'] = subject
    msg['From'] = GMAIL_USER
    msg['To'] = to_email

    with smtplib.SMTP_SSL('smtp.gmail.com', 465) as server:
        server.login(GMAIL_USER, GMAIL_APP_PASSWORD)
        server.send_message(msg) 