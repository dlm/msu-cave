#!/usr/bin/env node

/*jslint node: true, esversion: 6 */
'use strict';

var yargs = require('yargs');
var fs = require('fs');

var broadcaster = require('./broadcaster');
var server = require('./server');
var similarity = require('./similarity');
var appState = require('./state');

// setup the argument paring
var argv = yargs
  .usage('Usage: $0 [options]')
  // credentials
  .default('c', '../credentials/msu-cave-f3ae939d1917.json')
  .alias('c', 'credentials')
  .describe('c', 'Credential file for connecting to Firebase')
  // firebase server
  .default('f', 'https://msu-cave.firebaseio.com')
  .alias('f', 'firebase_url')
  .describe('f', 'Url of the firebase server')
  // port
  .default('p', 3000)
  .alias('p', 'port')
  .describe('p', 'Port on which to run the service')
  // installation id
  .demand('i')
  .alias('i', 'installation-id')
  .describe('i', 'The installation id')
  // headset id
  .demand('e')
  .alias('e', 'eeg-headset-id')
  .describe('e', 'The eeg headset id')
  //osc clients
  .default('o', [])
  .alias('o', 'osc-servers')
  .describe('o', 'the osc servers to send osc data')
  .array('o')
  // help
  .help('h')
  .alias('h', 'help')
  .argv;

// setup the osc clients. The osc broadcaser hands the heavy lifting
// of sending the data over to the OSC clients
const clients = argv.oscServers.map(broadcaster.oscClient);
const oscBroadcaster = new broadcaster.OSCBroadcaster(clients);

// create and initialize the broadcaster object.  The broadcaster handles
// much of the heavy lifting for communicating updates on the node to
// the firebase serer
const db = new broadcaster.firebaseDB(argv.credentials, argv.firebase_url);
const firebaseBroadcaster = new broadcaster.FirebaseBroadcaster(
  db, argv.installationId, argv.eegHeadsetId
);

// initialize so that every time remote data is updated the onRemoteData
// method is called.  This should hook into the covariance calculator either
// by sending a message to the covariance sevice or calling directly.
const bankWindowSize = 5;
const signalBank = new similarity.SignalBank(argv.eegHeadsetId, bankWindowSize);
const onRemoteData = (snapshot) => {
  signalBank.addSamples(snapshot.val());
  const sim = signalBank.similarity();

  // Note that the small delta values is a hack to get around a "feature" of
  // the osc library that sends integers.  After digging through the library,
  // we found that it reports integers if the floor of the value is the value.
  const hackedSim = Math.floor(sim) === sim ? sim + .0000001 : sim;
  oscBroadcaster.publishSimilarity(hackedSim);
};
firebaseBroadcaster.subscribe(onRemoteData);

// setup the server so that everything it receives some new data it is
// published to the remote data server.
const onOffThreashold = .4;
const onOffWindowSize = 4;
const onOffExpirationSeconds = 30;
const model = new appState.OnOffModel({
  threashold: onOffThreashold,
  windowSize: onOffWindowSize,
  expiration: onOffExpirationSeconds*1000,
});
const state = new appState.State(model);
const onLocalData = (body) => {
  state.addData(body)
  firebaseBroadcaster.publish(state);
  oscBroadcaster.publishHeadset(state);
}
const webServer = new server.Server(argv.port, onLocalData);
webServer.start();

// Periodically, send the state's heartbeat
const heartbeatSeconds = 5;
const heartbeat = () => {
  console.log("Heartbeat");
  firebaseBroadcaster.publish(state);
  oscBroadcaster.publishOnOff(state);
};
setInterval(heartbeat, heartbeatSeconds*1000);
