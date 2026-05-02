const axios = require('axios');

async function testLogin() {
  try {
    const res = await axios.post('https://project-veracity-backend-initial-production-be6f.up.railway.app/api/auth/login', {
      email: 'admin2@test.com',
      password: 'Admin1234!'
    });
    console.log('✅ Login Successful');
    console.log('Token:', res.data.token);
  } catch (err) {
    if (err.response) {
      console.log(`❌ Login Failed with status: ${err.response.status}`);
      console.log('Response data:', err.response.data);
    } else {
      console.log('❌ Error:', err.message);
    }
  }
}

testLogin();
