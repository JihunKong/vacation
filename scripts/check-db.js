console.log('Checking DATABASE_URL...');
if (process.env.DATABASE_URL) {
  console.log('DATABASE_URL is set');
  console.log('URL starts with:', process.env.DATABASE_URL.substring(0, 30) + '...');
} else {
  console.warn('DATABASE_URL is NOT set in build environment');
  console.log('This is expected during local builds. Docker PostgreSQL should be used in production.');
  console.log('Expected format: postgresql://postgres:postgres@localhost:5432/studylog_db');
}