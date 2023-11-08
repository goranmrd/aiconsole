const os = require('os');
const spawn = require('child_process').spawn;

if (os.platform() !== 'win32') {
  const yarn = spawn('yarn', ['add', 'fs-xattr@^0.4.0', '--ignore-scripts']);

  yarn.stdout.on('data', (data) => {
    console.log(`stdout: ${data}`);
  });

  yarn.stderr.on('data', (data) => {
    console.log(`stderr: ${data}`);
  });
}
