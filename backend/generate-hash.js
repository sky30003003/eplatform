const argon2 = require('argon2');

async function generateHash() {
  try {
    const hash = await argon2.hash('password123');
    console.log('Hash:', hash);
  } catch (err) {
    console.error('Error:', err);
  }
}

generateHash(); 