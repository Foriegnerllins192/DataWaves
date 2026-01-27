const axios = require('axios');

async function testLoginAPI() {
  console.log('🧪 Testing login API endpoint...');
  
  const baseURL = 'http://localhost:3003';
  const credentials = {
    email: 'admin@datawaves.com',
    password: 'DataWaves2026!'
  };
  
  try {
    console.log('📡 Sending login request...');
    const response = await axios.post(`${baseURL}/api/login`, credentials, {
      headers: {
        'Content-Type': 'application/json'
      },
      withCredentials: true
    });
    
    console.log('✅ Login successful!');
    console.log('Response:', response.data);
    
    if (response.data.user && response.data.user.role === 'admin') {
      console.log('✅ Admin role confirmed in response');
      
      // Test admin access
      console.log('🔐 Testing admin dashboard access...');
      try {
        const adminResponse = await axios.get(`${baseURL}/admin`, {
          withCredentials: true,
          maxRedirects: 0,
          validateStatus: function (status) {
            return status >= 200 && status < 400; // Accept redirects
          }
        });
        console.log('✅ Admin dashboard accessible');
      } catch (adminError) {
        if (adminError.response && adminError.response.status === 302) {
          console.log('✅ Admin dashboard redirecting (normal behavior)');
        } else {
          console.log('❌ Admin dashboard access failed:', adminError.message);
        }
      }
    } else {
      console.log('❌ Admin role not found in response');
    }
    
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.log('❌ Server is not running!');
      console.log('Please start the server with: npm start or npm run dev');
    } else if (error.response) {
      console.log('❌ Login failed!');
      console.log('Status:', error.response.status);
      console.log('Error:', error.response.data);
    } else {
      console.log('❌ Network error:', error.message);
    }
  }
}

testLoginAPI();