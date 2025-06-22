const fs = require('fs');
const path = require('path');

console.log('📧 Social X Email Setup Guide');
console.log('=============================\n');

console.log('To enable email OTP functionality, you need to configure Gmail SMTP:');
console.log('\n1. Enable 2-Factor Authentication on your Gmail account');
console.log('2. Generate an App Password:');
console.log('   - Go to Google Account settings');
console.log('   - Security > 2-Step Verification > App passwords');
console.log('   - Generate a new app password for "Mail"');
console.log('3. Use your Gmail address and the generated app password\n');

console.log('Creating .env file with email configuration...\n');

const envContent = `# Email Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# JWT Secret
JWT_SECRET=your-jwt-secret-key

# MongoDB URI
MONGODB_URI=mongodb://localhost:27017/socialx

# Twilio Configuration (Optional - for SMS)
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=your-twilio-phone-number

# Environment
NODE_ENV=development
`;

const envPath = path.join(__dirname, '.env');

if (fs.existsSync(envPath)) {
  console.log('⚠️  .env file already exists. Please add these email variables manually:');
  console.log('\nEMAIL_USER=your-email@gmail.com');
  console.log('EMAIL_PASS=your-app-password\n');
} else {
  fs.writeFileSync(envPath, envContent);
  console.log('✅ .env file created successfully!');
  console.log('📝 Please update the EMAIL_USER and EMAIL_PASS values with your Gmail credentials.\n');
}

console.log('📋 Setup Steps:');
console.log('1. Update EMAIL_USER with your Gmail address');
console.log('2. Update EMAIL_PASS with your Gmail app password');
console.log('3. Restart the server');
console.log('4. Test email OTP functionality\n');

console.log('🔧 Alternative Email Services:');
console.log('- You can also use other email services like Outlook, Yahoo, etc.');
console.log('- Update the transporter configuration in auth.js accordingly\n');

console.log('⚠️  Important Notes:');
console.log('- Never commit your .env file to version control');
console.log('- Use environment variables for production deployment');
console.log('- Consider using email services like SendGrid for production\n');

console.log('🎉 Email setup complete!'); 