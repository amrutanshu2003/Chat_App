const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

async function testAvailableUsers() {
  // Replace with a valid token from your app's localStorage
  const token = process.env.CHAT_APP_TOKEN || '';
  if (!token) {
    console.error('Please set your JWT token in the CHAT_APP_TOKEN environment variable.');
    return;
  }
  try {
    const res = await axios.get(`${API_URL}/messages/users/available`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Available users:', res.data);
  } catch (err) {
    console.error('Error fetching available users:', err.response?.data || err.message);
  }
}

testAvailableUsers(); 