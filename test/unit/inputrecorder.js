'use strict';

const expect = require('expect.js');
const sinon = require('sinon');

const env = require('../env');

const World = env.Engine.World;
const Input = env.Engine.Input.Keyboard;
const Recorder = env.Engine.InputRecorder;

describe('InputRecorder', function() {
  context('when recording input on world', function() {
    const world = new World;
    const input = new Input;
    const recorder = new Recorder(world, input);
    recorder.record();
    input.trigger(input.RIGHT, input.ENGAGE);
    world.updateTime(2.2);
    input.trigger(input.A, input.ENGAGE);
    world.updateTime(0.3);
    input.trigger(input.A, input.RELEASE);
    world.updateTime(3);
    input.trigger(input.B, input.ENGAGE);
    world.updateTime(3/60);
    input.trigger(input.B, input.RELEASE);

    it('should store events to log', function() {
      const log = recorder.getLog();
      expect(log.length).to.be(5);
    });

    it('should store tick at every event', function() {
      const log = recorder.getLog();
      expect(log[0].tick).to.be(0);
      expect(log[1].tick).to.be(264);
      expect(log[3].tick).to.be(660);
    });

    it('should store key and state', function() {
      const log = recorder.getLog();
      expect(log[0].key).to.be(input.RIGHT);
      expect(log[0].type).to.be(input.ENGAGE);
      expect(log[1].key).to.be(input.A);
      expect(log[1].type).to.be(input.ENGAGE);
      expect(log[4].key).to.be(input.B);
      expect(log[4].type).to.be(input.RELEASE);
    });

    describe('#toJSON()', function() {
      it('should return JSON data', function() {
        const json = recorder.toJSON();
        const data = JSON.parse(json);
        expect(data[2].tick).to.be(300);
        expect(data[2].key).to.be('a');
        expect(data[2].type).to.be('keyup');
      });
    });
  });
});
