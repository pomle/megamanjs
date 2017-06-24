const expect = require('expect.js');
const sinon = require('sinon');

const AudioContextMock = require('../mocks/audiocontext-mock');
const Audio = require('../../src/engine/Audio');
const AudioPlayer = require('../../src/engine/AudioPlayer');

describe('AudioPlayer', function() {

  function createAudioMock()
  {
    const bufferMock = '3fa0b830-3218-11e6-b350-1040f388afa6';
    return new Audio(bufferMock);
  }

  function createAudioPlayer()
  {
    AudioContextMock.mock();
    const ap = new AudioPlayer;
    AudioContextMock.clean();
    return ap;
  }

  describe('getContext()', function() {
    it('should return the AudioContext', function() {
      const ap = createAudioPlayer();
      const context = ap.getContext();
      expect(context).to.be.a(AudioContextMock.AudioContext);
    });
  });

  describe('play()', function() {
    it('should add audio to playing set', function() {
      const ap = createAudioPlayer();
      const audio = createAudioMock();
      ap.play(audio);
      expect(ap._playing.get(audio)).to.be.a(AudioContextMock.BufferSource);
    });

    it('should set playback rate on source', function() {
      const ap = createAudioPlayer();
      ap.setPlaybackRate(1.17);
      const audio = createAudioMock();
      ap.play(audio);
      expect(ap._playing.get(audio).playbackRate.value).to.be(1.17);
    });

    it('should set audio buffer to source buffer', function() {
      const ap = createAudioPlayer();
      const audio = createAudioMock();
      ap.play(audio);
      expect(ap._playing.get(audio).buffer).to.be('3fa0b830-3218-11e6-b350-1040f388afa6');
    });

    it('should try to stop same audio before playing again', function() {
      const ap = createAudioPlayer();
      const audio = createAudioMock();
      ap.play(audio);
      ap.stop = sinon.spy();
      ap.play(audio);
      expect(ap.stop.getCall(0).args[0]).to.be(audio);
    });

    it('should propagate audio loop to source loop', function() {
      const ap = createAudioPlayer();
      const audio = createAudioMock();
      audio.setLoop(1.13, 5.16);
      ap.play(audio);
      const source = ap._playing.get(audio);
      expect(source.loop).to.be(true);
      expect(source.loopStart).to.be(1.13);
      expect(source.loopEnd).to.be(5.16);
    });
  });

  describe('stop()', function() {
    it('should stop all audio if no argument given', function() {
      const ap = createAudioPlayer();
      const audio = [
        createAudioMock(),
        createAudioMock(),
        createAudioMock(),
      ];
      audio.forEach(a => {
        ap.play(a);
      });
      const sources = [];
      ap._playing.forEach(source => {
        expect(source.stop.called).to.be(false);
        sources.push(source);
      });
      expect(sources.length).to.be(3);
      ap.stop();
      sources.forEach(source => {
        expect(source.stop.calledOnce).to.be(true);
      });
    });

    it('should stop supplied audio argument if supplied', function() {
      const ap = createAudioPlayer();
      const audio = [
        createAudioMock(),
        createAudioMock(),
        createAudioMock(),
      ];
      audio.forEach(a => {
        ap.play(a);
      });
      const sources = [];
      ap._playing.forEach(source => {
        sources.push(source);
      });
      ap.stop(audio[1]);
      expect(sources[0].stop.called).to.be(false);
      expect(sources[1].stop.calledOnce).to.be(true);
      expect(sources[2].stop.called).to.be(false);
    });
  });

  describe('setPlaybackRate()', function() {
    it('should update playback rate for all currently playing audio', function() {
      const ap = createAudioPlayer();
      const audio = [
        createAudioMock(),
        createAudioMock(),
        createAudioMock(),
      ];
      audio.forEach(a => {
        ap.play(a);
      });
      ap.setPlaybackRate(1.13);
      ap._playing.forEach(source => {
        expect(source.playbackRate.value).to.be(1.13);
      });
    });
  });
});
