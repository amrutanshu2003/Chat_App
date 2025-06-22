# SMS Setup Guide for Social X Chat App

## Setting up Twilio SMS for OTP

### 1. Create a Twilio Account
1. Go to [Twilio Console](https://console.twilio.com/)
2. Sign up for a free account
3. Verify your email and phone number

### 2. Get Your Twilio Credentials
1. In your Twilio Console, find your **Account SID** and **Auth Token**
2. Go to Phone Numbers → Manage → Active numbers
3. Buy a phone number or use the trial number

### 3. Set Environment Variables
Create a `.env` file in the server directory with:

```env
# Twilio SMS Configuration
TWILIO_ACCOUNT_SID=your_twilio_account_sid_here
TWILIO_AUTH_TOKEN=your_twilio_auth_token_here
TWILIO_PHONE_NUMBER=your_twilio_phone_number_here

# JWT Secret
JWT_SECRET=your_jwt_secret_here

# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/chat_app

# Node Environment
NODE_ENV=development
```

### 4. Install Dependencies
```bash
npm install twilio
```

### 5. Test the Setup
1. Start the server: `npm start`
2. Go to the register page
3. Enter a valid phone number (with country code, e.g., +1234567890)
4. Click "Send OTP"
5. Check your phone for the SMS

### 6. Free Trial Limitations
- Twilio free trial has limitations
- You can only send SMS to verified numbers
- Limited number of SMS per month
- For production, upgrade to a paid plan

### 7. Alternative SMS Providers
If you prefer other SMS services:
- **AWS SNS**: Amazon's SMS service
- **Vonage**: Formerly Nexmo
- **MessageBird**: Popular in Europe
- **SendGrid**: Good for international SMS

### 8. Development Mode
If you don't want to set up SMS immediately:
- The app will work in development mode
- OTP will be logged to console
- You can still test the registration flow

### 9. Production Considerations
- Use environment variables for all secrets
- Implement rate limiting
- Add proper error handling
- Use a database for OTP storage (Redis recommended)
- Monitor SMS delivery rates
- Implement fallback mechanisms

## Troubleshooting

### Common Issues:
1. **"Twilio credentials not configured"**: Set up your .env file
2. **"Invalid phone number"**: Use international format (+1234567890)
3. **"SMS not delivered"**: Check Twilio console for errors
4. **"Trial account limitations"**: Verify your phone number in Twilio

### Support:
- Twilio Documentation: https://www.twilio.com/docs
- Twilio Support: https://support.twilio.com/ 