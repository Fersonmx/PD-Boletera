async function testRecovery() {
    console.log('--- Testing Forgot Password ---');
    try {
        const res = await fetch('http://localhost:3001/api/auth/forgot-password', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: 'admin@example.com'
            })
        });
        const data = await res.json();
        console.log('Forgot Password Response:', res.status, data);
    } catch (e) {
        console.error('Error:', e.message);
    }
}

testRecovery();
