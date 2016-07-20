'use strict';

const expect = require('expect.js');
const sinon = require('sinon');

const env = require('../../env');
const NodeMock = require('../../mocks/node-mock');
const AudioContextMock = require('../../mocks/audiocontext-mock');
const WebGLRendererMock = require('../../mocks/webglrenderer-mock');
const RequestAnimationFrameMock = require('../../mocks/requestanimationframe-mock');
const Game = env.Game;
const Scene = env.Game.Scene;

describe('Game', function() {
  function createGame()
  {
    AudioContextMock.mock();
    WebGLRendererMock.mock();
    const game = new Game;
    AudioContextMock.clean();
    WebGLRendererMock.clean();
    return game;
  }

  function createScene()
  {
    RequestAnimationFrameMock.mock();
    const scene = new Scene;
    RequestAnimationFrameMock.clean();
    return scene;
  }

  describe('#attachController()', function() {
    it('should add event listeners for keyup and keydown bound to handleInput()', function() {
      const element = new NodeMock();
      const game = createGame();
      game.handleInputEvent = sinon.spy();
      game.attachController(element);
      element.triggerEvent('keyup', 'foo');
      element.triggerEvent('keydown', 'bar');
      expect(game.handleInputEvent.callCount).to.be(2);
      expect(game.handleInputEvent.getCall(0).args[0]).to.be('foo');
      expect(game.handleInputEvent.getCall(1).args[0]).to.be('bar');
    });
  });

  describe('#attachToElement()', function() {
    it('should add renderer dom element to element supplied', function() {
      const element = new NodeMock();
      const game = createGame();
      game.attachToElement(element);
      expect(element.appendChild.lastCall.args[0]).to.be(game.renderer.domElement);
    });
  });

  describe('#adjustAspectRatio()', function() {
    it('should set camera aspect ratio according to bound element', function() {
      const element = new NodeMock();
      const game = createGame();
      const scene = createScene();
      element.setBoundingClientRect({width: 750, height: 600});
      game.attachToElement(element);
      game.setScene(scene);
      game.adjustAspectRatio();
      expect(element.appendChild.lastCall.args[0]).to.be(game.renderer.domElement);
      expect(game.scene.camera.camera.aspect).to.be(1.25);
    });
  });

  describe('#setResolution()', function() {
    it('should call setSize on renderer', function() {
      const game = createGame();
      game.setResolution(640, 480);
      expect(game.renderer.setSize.callCount).to.be(1);
      expect(game.renderer.setSize.lastCall.args).to.eql([640, 480]);
      expect(game.renderer.domElement.removeAttribute.callCount).to.be(1);
      expect(game.renderer.domElement.removeAttribute.lastCall.args).to.eql(['style']);
    });
  });

  describe('#setScene()', function() {
    it('should call CREATE on new scene', function() {
      const game = createGame();
      const scene = createScene();
      const callbackSpy = sinon.spy();
      scene.events.bind(scene.EVENT_CREATE, callbackSpy);
      game.setScene(scene);
      expect(callbackSpy.callCount).to.be(1);
    });

    it('should call DESTROY on old scene', function() {
      const game = createGame();
      const scene = createScene();
      const callbackSpy = sinon.spy();
      scene.events.bind(scene.EVENT_DESTROY, callbackSpy);
      game.setScene(scene);
      expect(callbackSpy.callCount).to.be(0);
      game.setScene(scene);
      expect(callbackSpy.callCount).to.be(1);
      RequestAnimationFrameMock.clean();
    });

    it('should update aspect ratio', function() {
      const element = new NodeMock();
      const game = createGame();
      const scene = createScene();
      element.setBoundingClientRect({width: 1000, height: 800});
      game.attachToElement(element);
      game.setScene(scene);
      expect(game.scene.camera.camera.aspect).to.be(1.25);
    });

    it('should update scene timer with set playback speed', function() {
      const game = createGame();
      const scene = createScene();
      const updateSpy = sinon.spy();
      game.setPlaybackSpeed(1.16);
      game.setScene(scene);
      scene.world.events.bind(scene.world.EVENT_UPDATE, updateSpy);
      RequestAnimationFrameMock.triggerAnimationFrame(0);
      RequestAnimationFrameMock.triggerAnimationFrame(219);
      expect(updateSpy.callCount).to.be(1);
      expect(updateSpy.lastCall.args).to.eql([0.25404, 0.25404]);
      RequestAnimationFrameMock.triggerAnimationFrame(519);
      expect(updateSpy.callCount).to.be(2);
      expect(updateSpy.lastCall.args).to.eql([0.34800000000000003, 0.60204]);
    });
  });

  context('when scene set', function() {
    describe('#handleInput()', function() {
      it('should trigger remapped input event in scene', function() {
        const game = createGame();
        const scene = createScene();
        game.setScene(scene);

        const hitSpy = sinon.spy();
        scene.input.hit('moot', hitSpy);
        game.input.assign(90, 'moot');

        game.handleInputEvent({keyCode: 90, type: 'keydown'});
        expect(hitSpy.callCount).to.be(1);
      });
    });
  });
});
