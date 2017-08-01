/*jslint node: true, esversion: 6 */

const assert = require('chai').assert;

const state = require('../state');

suite('state', function() {
  suite('OnOffModel', function() {
    const makeModel = () => new state.OnOffModel({
      threashold: .5,
      windowSize: 3,
      expiration: 30*1000,
    });

    suite('constructor', function() {
      test('it initializes', function() {
        const m = new state.OnOffModel({
          threashold: .75,
          windowSize: 3,
          expiration: 10,
        });
        assert.equal(.75, m.threashold);
        assert.deepEqual([255, 255, 255], m.samples);
        assert.equal(10, m.expiration);
      });
    });

    suite('addSample', function() {
      test('buffer is filled from back', function() {
        const m = makeModel();
        m.addSample({sample: 8, timestamp: 35});
        assert.deepEqual([255, 255, 8], m.samples);
      });

      test('it keeps most recent timestamp', function() {
        const m = makeModel();
        m.addSample({sample: 9, timestamp: 40});
        m.addSample({sample: 8, timestamp: 35});
        assert.equal(40, m.lastUpdate);

      });
    });


    suite('isOn', function() {
      const makeModel = () => new state.OnOffModel({
        threashold: .5,
        windowSize: 2,
        expiration: 30*1000,
      });

      test('it is on for low values with recent update', function() {
        const m = makeModel();
        m.addSample({sample: 4, timestamp: Date.now - 2000});
        m.addSample({sample: 9, timestamp: Date.now - 1025});
        m.lastUpdate = Date.now();
        assert.equal(true, m.isOn());
      });

      test('it is off for low values with non-recent update', function() {
        const m = makeModel();
        m.addSample({sample: 4, timestamp: Date.now - 70*1000});
        m.addSample({sample: 9, timestamp: Date.now - 60*1000});
        assert.equal(false, m.isOn());
      });

      test('it is off for recently updated high values', function() {
        const m = makeModel();
        m.addSample({sample: 225, timestamp: Date.now - 2000});
        m.addSample({sample: 250, timestamp: Date.now - 1025});
        m.lastUpdate = Date.now();
        assert.equal(false, m.isOn());
      });
    });
  });

  suite('State', function() {
    const now = Date.now();
    const data = {
      attention: 1,
      delta: 2,
      hiAlpha: 3,
      hiBeta: 4,
      loAlpha: 5,
      loBeta: 6,
      loGamma: 7,
      meditation: 8,
      midGamma: 9,
      signal: 10,
      theta: 11,
      timestamp: now,
    };

    const makeState = () => {
      const m = new state.OnOffModel({
        threashold: .5,
        windowSize: 1,
        expiration: 10*1000,
      });
      return new state.State(m);
    };

    const makeAndFillState = () => {
      const s = makeState();
      s.addData(data);
      return s
    };

    suite('#addData', function() {
      test('it updates the state', function() {
        const s = makeState();
        s.addData(data);

        assert.equal(1, s.attention);
        assert.equal(2, s.delta);
        assert.equal(3, s.hiAlpha);
        assert.equal(4, s.hiBeta);
        assert.equal(5, s.loAlpha);
        assert.equal(6, s.loBeta);
        assert.equal(7, s.loGamma);
        assert.equal(8, s.meditation);
        assert.equal(9, s.midGamma);
        assert.equal(10, s.signal);
        assert.equal(11, s.theta);
        assert.equal(now, s.timestamp);
        assert.deepEqual([10], s.onOffModel.samples);
      });
    });

    suite('#toOscEeg', function() {
      const s = makeAndFillState();
      assert.deepEqual([now, 2, 3, 4, 5, 6, 7, 9, 11], s.toOscEeg());
    });

    suite('#toOscOnOff', function() {
      const s = makeAndFillState();
      assert.deepEqual([1], s.toOscOnOff());
    });
  });
});
