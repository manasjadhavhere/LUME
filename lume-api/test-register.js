async function testRegister() {
  const res = await fetch('http://localhost:3001/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'artisttest100@example.com',
      password: 'password123',
      name: 'Artist Test 100',
      role: 'ARTIST',
    }),
  });
  const data = await res.json();
  console.log('Register Response:', JSON.stringify(data, null, 2));

  // Verify DB
  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient();
  const user = await prisma.user.findUnique({ where: { email: 'artisttest100@example.com' } });
  console.log('User from DB:', user);
  prisma.$disconnect();
}
testRegister();
