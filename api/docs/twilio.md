# Example Twilio SMS Webhook

```
ToCountry=US
ToState=CA
SmsMessageSid=SMXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
NumMedia=0
ToCity=
FromZip=94105
SmsSid=SMXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
FromState=CA
SmsStatus=received
FromCity=SAN FRANCISCO
Body=Hello%20there
FromCountry=US
To=%2B12345678901
ToZip=
NumSegments=1
MessageSid=SMXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
AccountSid=ACXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
From=%2B10987654321
ApiVersion=2010-04-01
```

# Example Sending SMS

```
body: 'Hello!',
from: 'process.env.TWILIO_PHONE_NUMBER', // Twilio account
to: '+1234567890'                       // Recipient
```
