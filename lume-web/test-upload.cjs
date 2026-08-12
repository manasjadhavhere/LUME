const fs = require('fs');
const path = require('path');

async function testUpload() {
  try {
    // 1. Login to get token
    console.log('Logging in...');
    const loginRes = await fetch('https://lume-yrb7.onrender.com/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'artistprod3@example.com', password: 'password123' })
    });
    const loginData = await loginRes.json();
    if (!loginRes.ok) {
      console.error('Login failed:', loginData);
      return;
    }
    const token = loginData.data.token;
    console.log('Got token:', token.substring(0, 15) + '...');

    // 2. Create a dummy image file
    const dummyImagePath = path.join(__dirname, 'dummy.png');
    // 1x1 transparent PNG
    const base64Png = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACklEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg==';
    fs.writeFileSync(dummyImagePath, Buffer.from(base64Png, 'base64'));

    // 3. Upload image
    console.log('Uploading image...');
    
    // Create FormData manually since we are in Node.js
    // For Node 18+, we can use the built-in FormData and Blob, but Node's fetch might require special handling.
    // Let's use standard FormData
    const fileBlob = new Blob([fs.readFileSync(dummyImagePath)], { type: 'image/png' });
    const formData = new FormData();
    formData.append('avatar', fileBlob, 'dummy.png');

    const uploadRes = await fetch('https://lume-yrb7.onrender.com/api/artists/me/avatar', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
        // Do not set Content-Type, fetch will automatically set it with the boundary
      },
      body: formData
    });

    const uploadText = await uploadRes.text();
    console.log('Upload response status:', uploadRes.status);
    console.log('Upload response body:', uploadText);

    // Cleanup
    fs.unlinkSync(dummyImagePath);
  } catch (err) {
    console.error('Test failed with exception:', err);
  }
}

testUpload();
