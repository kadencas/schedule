const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createUser() {
  // Plain-text password that you want to hash
  const plainPassword = '12345';

  // Generate a password hash (using 10 salt rounds in this example)
  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(plainPassword, saltRounds);

  // Create a new user record with the hashed password
  const newUser = await prisma.users.create({
    data: {
      email: 'admin@gmail.com',
      name: 'admin',
      passwordHash: passwordHash,
      // You can add other fields as needed
      // e.g., department: 'Engineering', location: 'Office', etc.
    },
  });

  console.log('User created:', newUser);
}

createUser()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
