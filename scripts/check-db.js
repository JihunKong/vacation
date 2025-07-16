console.log('Checking DATABASE_URL...');
if (process.env.DATABASE_URL) {
  console.log('DATABASE_URL is set');
  console.log('URL starts with:', process.env.DATABASE_URL.substring(0, 30) + '...');
} else {
  console.error('DATABASE_URL is NOT set!');
  process.exit(1);
}