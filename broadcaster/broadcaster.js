/*jslint node: true, esversion: 6 */
'use strict';

var firebase = require('firebase');
var rethink = require('rethinkdbdash')();
var osc = require('node-osc');

function firebaseDB(credentials, url) {
  firebase.initializeApp({
    serviceAccount: credentials,
    databaseURL: url,
  });
  return firebase.database();
}

class FirebaseBroadcaster {
  constructor(database, installationID, headsetID) {
    this.db = database;
    this.installationID = installationID;
    this.headsetID = headsetID;
    this._ref = this.db.ref(this.latestPath);
  }

  publish(data) {
    let payload = {};
    payload = {
      raw_data: data,
      headsetOn: data.onOffModel.isOn(),
      timestamp: {
        server: firebase.database.ServerValue.TIMESTAMP,
        node: (new Date()).getTime()
      }
    };
    this._ref.child(this.headsetID).set(payload);
  }

  subscribe(callback) {
    this._ref.on('value', (snapshot) => { callback(snapshot.val()) });
  }

  get installationPath() {
    return 'installations/' + this.installationID;
  }

  get latestPath() {
    return this.installationPath + '/latest';
  }
}


function rethinkDB(db_name, table_name) {
  const db = rethink.db(db_name);
  let connection = null;
  rethink.dbList().run().then((dbs) => {
    return (dbs.includes(db_name)) ? "" : rethink.dbCreate(db_name).run();
  }).then(() => {
    return db.tableList().run();
  }).then((tables) => {
    return tables.includes(table_name) ? "" : db.tableCreate(table_name).run();
  });
  return db.table(table_name);
}


class RethinkBroadcaster {
  constructor(table, headsetID) {
    this.table = table;
    this.headsetID = headsetID;
  }

  publish(data) {
    let payload = {};
    payload = {
      raw_data: data,
      headsetOn: data.onOffModel.isOn(),
      timestamp: {
        node: (new Date()).getTime()
      }
    };
    this.table
      .get(this.headsetID)
      .replace({"id": this.headsetID, "data": payload})
      .run();
  }

  subscribe(callback) {
    this.table.changes().run().then((feed) => {
      feed.each((err, change) => {
        this.table.run().then((results) => {
          let snapshot = {};
          results.forEach((result) => { snapshot[result.id] = result.data; });
          callback(snapshot);
        });
      });
    });
  }
}


function oscClient(rawClientAddress) {
  let clientAddress = rawClientAddress.split(':');
  return new osc.Client(clientAddress[0], clientAddress[1]);
}

class OSCBroadcaster {
  constructor(clients) {
    this.clients = clients;
  }

  publishToAll(channel, data) {
    this.clients.forEach((client) => client.send(channel, data));
  }

  publishHeadset(state) {
    this.publishEEG(state);
    this.publishOnOff(state);
  }

  publishEEG(state) {
    const eegData = state.toOscEeg()
    this.publishToAll("/eeg", eegData);
  }

  publishOnOff(state) {
    const onOffData = state.toOscOnOff()
    this.publishToAll("/onoff", onOffData);
  }

  publishSimilarity(similarity) {
    this.publishToAll("/similarity", [similarity]);
  }
}

module.exports.firebaseDB = firebaseDB;
module.exports.FirebaseBroadcaster = FirebaseBroadcaster;
module.exports.rethinkDB = rethinkDB;
module.exports.RethinkBroadcaster = RethinkBroadcaster;
module.exports.oscClient = oscClient;
module.exports.OSCBroadcaster = OSCBroadcaster;
