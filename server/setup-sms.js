const fs = require('fs');
const path = require('path');

console.log('🔧 Social X SMS Setup Guide');
console.log('============================\n');

// Check if .env file exists
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
  console.log('📝 Creating .env file...');
  
  const envContent = `# Twilio SMS Configuration
# Get these from your Twilio Console: https://console.twilio.com/
TWILIO_ACCOUNT_SID=your_twilio_account_sid_here
TWILIO_AUTH_TOKEN=your_twilio_auth_token_here
TWILIO_PHONE_NUMBER=your_twilio_phone_number_here

# JWT Secret
JWT_SECRET=your_jwt_secret_here

# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/chat_app

# Node Environment
NODE_ENV=development
`;

  fs.writeFileSync(envPath, envContent);
  console.log('✅ .env file created successfully!');
} else {
  console.log('✅ .env file already exists');
}

console.log('\n📋 Next Steps:');
console.log('1. Go to https://console.twilio.com/');
console.log('2. Create a free account');
console.log('3. Get your Account SID and Auth Token');
console.log('4. Buy a phone number or use trial number');
console.log('5. Update the .env file with your credentials');
console.log('6. Restart the server: npm start');
console.log('\n💡 For testing without SMS setup:');
console.log('- The app will work in development mode');
console.log('- OTP will be logged to console');
console.log('- You can still test the registration flow');
console.log('\n📖 See SMS_SETUP.md for detailed instructions'); 