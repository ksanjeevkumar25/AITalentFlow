const axios = require('axios');

async function testAllocation() {
    try {
        const response = await axios.post('http://localhost:3000/api/service-orders/allocate', {
            serviceOrderId: 1,
            employeeId: 1,
            userEmail: 'test@example.com'
        }, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        console.log('Success:', response.data);
    } catch (error) {
        console.error('Error:', error.response?.data || error.message);
        console.error('Status:', error.response?.status);
        console.error('Full Error:', error.toJSON?.() || error);
    }
}

// Test if the endpoint exists first
async function testEndpointExists() {
    try {
        const response = await axios.get('http://localhost:3000/health');
        console.log('Server is running:', response.data);
        
        // Try the allocation endpoint with invalid data to see what error we get
        await testAllocation();
    } catch (error) {
        console.error('Server health check failed:', error.message);
    }
}

testEndpointExists();
