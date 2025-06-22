const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const API_URL = 'http://localhost:5000/api';

async function testRegistrationWithAvatar() {
  try {
    console.log('Testing server connection...');
    
    // Test server health
    const healthResponse = await axios.get('http://localhost:5000/');
    console.log('✅ Server is running:', healthResponse.data);
    
    // Create a simple test image (1x1 pixel PNG)
    const testImageData = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64');
    const testImagePath = path.join(__dirname, 'test-avatar.png');
    fs.writeFileSync(testImagePath, testImageData);
    
    // Test registration with avatar
    const formData = new FormData();
    formData.append('username', 'testuser' + Date.now());
    formData.append('email', 'test' + Date.now() + '@example.com');
    formData.append('password', 'password123');
    formData.append('avatar', fs.createReadStream(testImagePath));
    
    console.log('Testing registration with avatar...');
    
    const response = await axios.post(`${API_URL}/auth/register`, formData, {
      headers: {
        ...formData.getHeaders(),
      },
    });
    
    console.log('✅ Registration with avatar successful:', response.data);
    
    // Clean up test file
    fs.unlinkSync(testImagePath);
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('💡 Make sure the server is running on port 5000');
    } else if (error.response?.status === 503) {
      console.log('💡 MongoDB is not connected. Please install and start MongoDB');
    }
  }
}

testRegistrationWithAvatar(); 