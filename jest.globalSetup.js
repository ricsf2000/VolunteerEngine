const { execSync } = require('child_process');

module.exports = async () => {
  console.log('Starting test database...');
  
  try {
    // Start Docker container
    execSync('npm run db:up', { stdio: 'inherit' });
    
    // Wait a bit for PostgreSQL to be ready
    console.log('Waiting for database to be ready...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Push schema and seed data
    console.log('Setting up database schema...');
    execSync('npm run db:push', { stdio: 'inherit' });
    
    console.log('Seeding test data...');
    execSync('npm run db:seed', { stdio: 'inherit' });
    
    console.log('Test database ready');
  } catch (error) {
    console.error('Failed to setup test database:', error.message);
    process.exit(1);
  }
};