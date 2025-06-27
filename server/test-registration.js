const axios = require('axios');

const API_URL = 'http://localhost:5001/api';

async function testRegistration() {
  try {
    console.log('Testing server connection...');
    
    // Test server health
    const healthResponse = await axios.get('http://localhost:5001/');
    console.log('✅ Server is running:', healthResponse.data);
    
    // Test registration with valid data
    const testUser = {
      username: 'testuser' + Date.now(),
      email: 'test' + Date.now() + '@example.com',
      password: 'password123',
      avatar: ''
    };
    
    console.log('Testing registration with:', testUser);
    
    const response = await axios.post(`${API_URL}/auth/register`, testUser);
    console.log('✅ Registration successful:', response.data);
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('💡 Make sure the server is running on port 5000');
    } else if (error.response?.status === 503) {
      console.log('💡 MongoDB is not connected. Please install and start MongoDB');
    }
  }
}

testRegistration(); 