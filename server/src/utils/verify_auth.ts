import axios from 'axios';

const API_URL = 'http://localhost:3000/api/auth';

const testAuth = async () => {
    try {
        // 1. Signup
        console.log('Testing Signup...');
        const signupRes = await axios.post(`${API_URL}/signup`, {
            username: 'testuser_' + Date.now(),
            email: `test${Date.now()}@example.com`,
            password: 'password123'
        });
        console.log('Signup Successful:', signupRes.data);

        // 2. Login
        console.log('Testing Login...');
        const loginRes = await axios.post(`${API_URL}/login`, {
            email: signupRes.data.email,
            password: 'password123'
        });
        console.log('Login Successful:', loginRes.data);

    } catch (error: any) {
        if (error.response) {
            console.error('Error Response:', error.response.data);
        } else {
            console.error('Error:', error.message);
        }
        process.exit(1);
    }
};

testAuth();
