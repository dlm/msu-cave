#!/usr/bin/env node

/*jslint node: true, esversion: 6 */
'use strict';

var yargs = require('yargs');
var fs = require('fs');


var firebase = require('firebase');

const podNum = yargs.argv.pod

const credentials = '../credentials/msu-cave-f3ae939d1917.json';
const url = 'https://msu-cave.firebaseio.com';
const database  = firebase.initializeApp({
  serviceAccount: credentials,
  databaseURL: url,
}).database();


const log = (snapshot) => {
  const val = snapshot.val();


  const headsetOn = val.headsetOn;
  const timestamp = val.timestamp.server;

  const rawData = val.raw_data;
  const delta = rawData.delta
  const hiAlpha = rawData.hiAlpha
  const hiBeta = rawData.hiBeta
  const loAlpha = rawData.loAlpha
  const loBeta = rawData.loBeta
  const loGamma = rawData.loGamma
  const midGamma = rawData.midGamma
  const theta = rawData.theta
  console.log(timestamp,headsetOn, hiAlpha, hiBeta, loAlpha, loBeta, loGamma, midGamma, theta);
}

database.ref(`/installations/holter/latest/pod${podNum}`).on('value', log);




