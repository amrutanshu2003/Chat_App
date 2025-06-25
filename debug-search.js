const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

async function debugSearch() {
  try {
    console.log('🔍 Debugging search functionality...\n');

    // First, let's check if the server is running by testing a public endpoint
    console.log('1. Testing server connection...');
    try {
      // Try to register a test user to check if server is running
      const testUser = {
        username: 'debuguser',
        email: 'debug@example.com',
        password: 'password123'
      };
      const registerResponse = await axios.post(`${API_URL}/auth/register`, testUser);
      console.log('✅ Server is running and test user registered');
    } catch (error) {
      if (error.response?.status === 400 && error.response?.data?.message?.includes('already exists')) {
        console.log('✅ Server is running, test user already exists');
      } else {
        console.log('❌ Server connection failed:', error.message);
        return;
      }
    }

    // Test login to get a token
    console.log('\n2. Testing login...');
    try {
      const loginResponse = await axios.post(`${API_URL}/auth/login`, {
        email: 'debug@example.com',
        password: 'password123'
      });
      const token = loginResponse.data.token;
      console.log('✅ Login successful, token received');

      // Test fetching users
      console.log('\n3. Testing user fetching...');
      const usersResponse = await axios.get(`${API_URL}/messages/users/all`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ Users fetched successfully');
      console.log('📊 Users found:', usersResponse.data.length);
      console.log('👥 Users:', usersResponse.data.map(u => ({ username: u.username, email: u.email })));

      // Test search functionality
      console.log('\n4. Testing search functionality...');
      const searchTerms = ['debug', 'test', 'user', 'a'];
      
      searchTerms.forEach(term => {
        const filteredUsers = usersResponse.data.filter(u => 
          u.username && u.username.toLowerCase().includes(term.toLowerCase())
        );
        console.log(`🔍 Search for "${term}" found ${filteredUsers.length} users`);
        if (filteredUsers.length > 0) {
          console.log('📋 Filtered users:', filteredUsers.map(u => u.username));
        }
      });

      // Test edge cases
      console.log('\n5. Testing edge cases...');
      const emptySearch = usersResponse.data.filter(u => 
        u.username && u.username.toLowerCase().includes(''.toLowerCase())
      );
      console.log(`🔍 Empty search found ${emptySearch.length} users (should be all users)`);

      const nonExistentSearch = usersResponse.data.filter(u => 
        u.username && u.username.toLowerCase().includes('nonexistent'.toLowerCase())
      );
      console.log(`🔍 Non-existent search found ${nonExistentSearch.length} users (should be 0)`);

    } catch (error) {
      console.log('❌ Login or user fetching failed:', error.response?.data || error.message);
    }

  } catch (error) {
    console.log('❌ Debug script failed:', error.message);
  }
}

debugSearch(); 