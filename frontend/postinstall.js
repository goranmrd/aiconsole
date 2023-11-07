const os = require('os');
const exec = require('child_process').exec;

if (os.platform() !== 'win32') {
  exec('npm install fs-xattr@^0.4.0', (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`);
      return;
    }
    console.log(`stdout: ${stdout}`);
    console.error(`stderr: ${stderr}`);
  });
}
