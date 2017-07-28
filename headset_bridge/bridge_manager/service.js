/*jslint node: true, esversion: 6 */

const process = require('child_process');

class Service {
  constructor(config) {
    this.name = config.name;
    this.startCMD = config.start;
    this.proc = null;
  }

  runCmd(cmd) {
    const proc = process.exec(cmd, {stdio: [0,1,2]});
    proc.stdout.on('data', (data) => console.log('stdout: ' + data));
    proc.stderr.on('data', (data) => console.log('stderr: ' + data));
    proc.on('exit', (code) => console.log('exited with code ' + code));
    return proc;
  }

  restart() {
    if (this.proc) {
      this.proc.kill();
    }
    this.proc = this.runCmd(this.startCMD);
  }
}

module.exports.Service = Service;
