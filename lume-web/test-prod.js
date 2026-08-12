async function testProd() {
  try {
    const res = await fetch('https://lume-yrb7.onrender.com/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'artistprod3@example.com',
        password: 'password123',
        name: 'Artist Prod Test',
        role: 'ARTIST'
      })
    });
    const data = await res.json();
    console.log(JSON.stringify(data, null, 2));
  } catch (e) {
    console.error(e);
  }
}
testProd();
