'use strict';

const expect = require('expect.js');
const sinon = require('sinon');

const env = require('../../env.js');
const NodeMock = require('../mocks/node-mock');
const GameMock = require('../mocks/game-mock');
const Hud = env.Game.Hud;
const Timer = env.Engine.Timer;

describe('Hud', function() {
  describe('attach()', function() {
    it('should bind to scene create and destroy events of game', function() {
      const hud = new Hud;
      const game = new GameMock;
      const dom = new NodeMock;
      hud.onSceneCreate = sinon.spy();
      hud.onSceneDestroy = sinon.spy();
      hud.attach(game, dom);
      game.events.trigger(game.EVENT_SCENE_CREATE);
      expect(hud.onSceneCreate.callCount).to.be(1);
      expect(hud.onSceneDestroy.callCount).to.be(0);
      game.events.trigger(game.EVENT_SCENE_DESTROY);
      expect(hud.onSceneCreate.callCount).to.be(1);
      expect(hud.onSceneDestroy.callCount).to.be(1);
    });
  });
  describe('detach()', function() {
    it('should unbind from scene create and destroy events of game', function() {
      const hud = new Hud;
      const game = new GameMock;
      const dom = new NodeMock;
      hud.onSceneCreate = sinon.spy();
      hud.onSceneDestroy = sinon.spy();
      hud.attach(game, dom);
      hud.detach();
      game.events.trigger(game.EVENT_SCENE_CREATE);
      game.events.trigger(game.EVENT_SCENE_DESTROY);
      expect(hud.onSceneCreate.callCount).to.be(0);
      expect(hud.onSceneDestroy.callCount).to.be(0);
    });
  });
  describe('quantify()', function() {
    it('should return 1 for input 1', function() {
      const hud = new Hud;
      expect(hud.quantify(1)).to.be(1);
    });
    it('should return 0 for input zero', function() {
      const hud = new Hud;
      expect(hud.quantify(0)).to.be(0);
    });
    it('should return 1/28th for value just above 0', function() {
      const hud = new Hud;
      expect(hud.quantify(0.00000001)).to.be.within(0.03571428571428571, 0.03571428571428572);
    });
    it('should return 27/28ths for value just below 1', function() {
      const hud = new Hud;
      expect(hud.quantify(0.99999998)).to.be.within(0.9642857142857142, 0.9642857142857143);
    });
  });
  describe('setAmount()', function() {
    it('should set height style and current value on element', function() {
      const hud = new Hud;
      const node = new NodeMock;
      hud.setAmount(node, .33);
      const returnedNode = node.querySelector.lastCall.returnValue;
      expect(returnedNode.style.height).to.be('32.14285714285714%');
      expect(node.dataset.value).to.be('0.33');
    });
  });
  describe('setEnergyQuantified()', function() {
    it('should pass arguments directly to setAmount() when new value is lower', function() {
      const hud = new Hud;
      const node = new NodeMock;
      hud.setAmount(node, .5);
      hud.setAmount = sinon.spy();
      hud.setEnergyQuantified(node, .3);
      expect(hud.setAmount.callCount).to.be(1);
      expect(hud.setAmount.lastCall.args).to.eql([node, .3]);
    });
    it('should call setAmount iteratively for every timer timepass event until matching', function() {
      const hud = new Hud;
      const timer = new Timer;
      hud.game = {
        scene: {
          resumeSimulation: sinon.spy(),
          pauseSimulation: sinon.spy(),
          timer: timer,
        },
      };
      const node = new NodeMock;
      hud.setAmount(node, .5);
      hud.setEnergyQuantified(node, .7);
      hud.setAmount = sinon.spy();
      expect(hud.game.scene.pauseSimulation.callCount).to.be(1);
      expect(hud.game.scene.resumeSimulation.callCount).to.be(0);
      timer.updateTime(.05);
      expect(hud.setAmount.lastCall.args).to.eql([node, .55]);
      timer.updateTime(.05);
      expect(hud.setAmount.lastCall.args[1]).to.be.within(0.6, 0.6000000000000002);
      timer.updateTime(.1);
      expect(hud.setAmount.lastCall.args).to.eql([node, .7]);
      expect(hud.setAmount.callCount).to.be(3);
      expect(hud.game.scene.pauseSimulation.callCount).to.be(1);
      expect(hud.game.scene.resumeSimulation.callCount).to.be(1);
      timer.updateTime(.1);
      expect(hud.setAmount.callCount).to.be(3);
    });
  });
});
