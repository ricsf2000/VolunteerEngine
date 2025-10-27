const { execSync } = require('child_process');

module.exports = async () => {
  console.log('Cleaning up test database...');
  
  try {
    // Stop Docker container
    execSync('npm run db:down', { stdio: 'inherit' });
    console.log('Test database stopped');
  } catch (error) {
    console.error('Failed to cleanup test database:', error.message);
  }
};