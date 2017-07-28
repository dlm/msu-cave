#!/usr/bin/env node

/*jslint node: true, esversion: 6 */
'use strict';


const yargs = require('yargs');
const osc = require('node-osc');

const monitor = require('./monitor');
const service = require('./service');

// setup the argument paring
const argv = yargs
  .usage('Usage: $0 [options]')
  // port
  .default('p', 7772)
  .alias('p', 'headset-bridge-port')
  .describe('p', 'Port for listenting for headset bridge')
  // headset hardware address
  .demand('a')
  .alias('a', 'address')
  .describe('a', 'URL for bridge to send data.')
  // device
  .demand('d')
  .alias('d', 'device')
  .describe('d', 'Device on which to bind the headset.')
  // timeout
  .default('t', 20)
  .alias('t', 'timeout')
  .describe('t', 'timeout length for how long to wait for a restart.')
  // help
  .help('h')
  .alias('h', 'help')
  .argv;


const headset = {
  name: "headset",
  start: `../headset_bridge -d ${argv.device} -p ${argv.address}`,
};
const headsetService = new service.Service(headset);
const headsetMonitor = new monitor.Monitor(headsetService, argv.timeout*1000);
headsetMonitor.restartService();

const oscServer = new osc.Server(argv.headsetBridgePort);
oscServer.on("message", function (msg, rinfo) {
  const oscAddress = msg[0];
  if (oscAddress === '/eeg') {
    headsetMonitor.update();
  }
});

setInterval(() => { headsetMonitor.restartIfTimedOut() }, 1000);
