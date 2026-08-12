import { registerSchema } from './src/modules/auth/auth.service';

const data = {
  email: 'artist@example.com',
  password: 'password123',
  name: 'Artist Test',
  role: 'ARTIST'
};

const result = registerSchema.safeParse(data);
console.log('Parse result:', result);
