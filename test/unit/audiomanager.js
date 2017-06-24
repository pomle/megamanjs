'use strict';

const expect = require('expect.js');
const sinon = require('sinon');

const AudioManager = require('../../src/engine/AudioManager');

describe('AudioManager', function() {
  function MockAudio() {
  }

  function MockPlayer() {
    this.play = sinon.spy();
    this.stop = sinon.spy();
  }

  describe('#play()', function() {
    it('should send audio with given id to player play', function() {
      const manager = new AudioManager;
      const player = new MockPlayer;
      manager.setPlayer(player);
      const audio = new MockAudio();
      manager.add('test', audio);
      manager.play('test');
      expect(player.play.callCount).to.be(1);
      expect(player.play.lastCall.args[0]).to.be(audio);
    });
  });

  describe('#stop()', function() {
    it('should send audio with given id to player stop', function() {
      const manager = new AudioManager;
      const player = new MockPlayer;
      manager.setPlayer(player);
      const audio = new MockAudio();
      manager.add('test', audio);
      manager.stop('test');
      expect(player.stop.callCount).to.be(1);
      expect(player.stop.lastCall.args[0]).to.be(audio);
    });
  });

  describe('#stopAll()', function() {
    it('should stop all audio from this manager', function() {
      const manager = new AudioManager;
      const player = new MockPlayer;
      manager.setPlayer(player);
      const audio = [
        new MockAudio(),
        new MockAudio(),
        new MockAudio(),
      ];
      audio.forEach((a, i) => {
        manager.add('test_' + (i + 1), audio);
      });
      manager.stopAll();
      expect(player.stop.callCount).to.be(3);
      audio.forEach((a, i) => {
        expect(player.stop.getCall(i).args[0]).to.be(audio);
      });
    });
  });
});
