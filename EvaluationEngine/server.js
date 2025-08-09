// This script is used by Azure App Service to start your application
const { spawn } = require('child_process');

// Run npm start
const child = spawn('npm', ['start'], { stdio: 'inherit', shell: true });

child.on('exit', code => {
  console.log(`Child process exited with code ${code}`);
  process.exit(code);
});
