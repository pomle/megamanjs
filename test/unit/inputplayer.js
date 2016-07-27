'use strict';

const expect = require('expect.js');
const sinon = require('sinon');

const env = require('../env');

const World = env.Engine.World;
const Input = env.Engine.Keyboard;
const Player = env.Engine.InputPlayer;

describe('InputPlayer', function() {
  const json = '[{"time":0.2,"key":"right","type":"keydown"},{"time":2.2,"key":"a","type":"keydown"},{"time":0.2999999999999998,"key":"a","type":"keyup"},{"time":3,"key":"b","type":"keydown"},{"time":0.04999999999999982,"key":"b","type":"keyup"}]';
  const log = JSON.parse(json);

  it('should chain play back log and trigger input at specified intervals', function() {
    const world = new World;
    const input = new Input;
    const player = new Player(world, input);
    const inputSpy = sinon.spy();
    input.events.bind(input.EVENT_TRIGGER, inputSpy);

    player.play(log);
    world.updateTime(0.21);
    expect(inputSpy.callCount).to.be(1);
    expect(inputSpy.lastCall.args).to.eql(['right', 'keydown']);
    world.updateTime(2.2);
    expect(inputSpy.callCount).to.be(2);
    expect(inputSpy.lastCall.args).to.eql(['a', 'keydown']);
    world.updateTime(0.3);
    expect(inputSpy.callCount).to.be(3);
    expect(inputSpy.lastCall.args).to.eql(['a', 'keyup']);

    // Update time without reaching next step.
    world.updateTime(0.5);
    expect(inputSpy.callCount).to.be(3);
    world.updateTime(1);
    expect(inputSpy.callCount).to.be(3);

    world.updateTime(1.5);
    expect(inputSpy.callCount).to.be(4);
    expect(inputSpy.lastCall.args).to.eql(['b', 'keydown']);
    world.updateTime(0.5);
    expect(inputSpy.callCount).to.be(5);
    expect(inputSpy.lastCall.args).to.eql(['b', 'keyup']);
  });

  it('should be stoppable', function() {
    const world = new World;
    const input = new Input;
    const player = new Player(world, input);
    const inputSpy = sinon.spy();
    input.events.bind(input.EVENT_TRIGGER, inputSpy);

    player.play(log);
    world.updateTime(0.21);
    expect(inputSpy.callCount).to.be(1);
    expect(inputSpy.lastCall.args).to.eql(['right', 'keydown']);
    player.stop();
    world.updateTime(2.2);
    expect(inputSpy.callCount).to.be(1);
  });

  describe('#play', function() {
    it('should return a promise that resolves when log done', function(done) {
      const world = new World;
      const player = new Player(world, new Input);
      player.play(log).then(done);
      world.updateTime(10);
    });

    it('should return a promise that rejects if stopped', function(done) {
      const world = new World;
      const player = new Player(world, new Input);
      player.play(log).catch(err => {
        done();
      });
      player.stop();
    });
  });

  describe('#playJSON()', function() {
    it('shoud pass decoded JSON to play()', function() {
      const player = new Player();
      player.play = sinon.spy();
      player.playJSON(json);
      expect(player.play.calledOnce).to.be(true);
      const data = player.play.lastCall.args[0];
      expect(data[3].time).to.be(3);
      expect(data[2].time).to.be(0.2999999999999998);
    });
  });

  describe('#stop', function() {
    it('should return a promise that resolves when log done', function(done) {
      const world = new World;
      const player = new Player(world, new Input);
      player.play(log).then(done);
      world.updateTime(10);
    });
  });
});
