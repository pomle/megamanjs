const expect = require('expect.js');
const sinon = require('sinon');

const RequestAnimationFrameMock = require('../mocks/requestanimationframe-mock');
const NodeMock = require('../mocks/node-mock');
const GameMock = require('../mocks/game-mock');

const Hud = require('../../src/engine/Hud');
const Timer = require('../../src/engine/Timer');
const Level = require('../../src/engine/scene/Level');

describe('Hud', function() {
  describe('attach()', function() {
    it('should bind to scene create and destroy events of game', function() {
      const hud = new Hud;
      const game = new GameMock;
      const dom = new NodeMock;
      hud.onSceneSet = sinon.spy();
      hud.onSceneUnset = sinon.spy();
      hud.attach(game, dom);
      game.events.trigger(game.EVENT_SCENE_SET);
      expect(hud.onSceneSet.callCount).to.be(1);
      expect(hud.onSceneUnset.callCount).to.be(0);
      game.events.trigger(game.EVENT_SCENE_UNSET);
      expect(hud.onSceneSet.callCount).to.be(1);
      expect(hud.onSceneUnset.callCount).to.be(1);
    });
  });

  describe('detach()', function() {
    it('should unbind from scene create and destroy events of game', function() {
      const hud = new Hud;
      const game = new GameMock;
      const dom = new NodeMock;
      hud.onSceneSet = sinon.spy();
      hud.onSceneUnset = sinon.spy();
      hud.attach(game, dom);
      hud.detach();
      game.events.trigger(game.EVENT_SCENE_SET);
      game.events.trigger(game.EVENT_SCENE_UNSET);
      expect(hud.onSceneSet.callCount).to.be(0);
      expect(hud.onSceneUnset.callCount).to.be(0);
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

  describe('showHud() / hideHud()', function() {
    const hud = new Hud;
    const game = new GameMock;
    const dom = new NodeMock;
    hud.attach(game, dom);

    describe('showHud()', function() {
      it('should set a class on attached element', function() {
        hud.showHud();
        expect(dom.classList.has('visible')).to.be(true);
      });
    });

    describe('hideHud()', function() {
      it('should remove a class from attached element', function() {
        hud.hideHud();
        expect(dom.classList.has('visible')).to.be(false);
      });
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

  describe('setAmountInteractive()', function() {
    it('should pass arguments directly to setAmount() when new value is lower', function() {
      const hud = new Hud;
      const game = new GameMock;
      const dom = new NodeMock;
      hud.attach(game, dom);
      const node = dom.getQueries()[0].node;
      hud.showHud();
      hud.setAmount(node, .5);
      hud.setAmount = sinon.spy();
      hud.setAmountInteractive(node, .3);
      expect(hud.setAmount.callCount).to.be(1);
      expect(hud.setAmount.lastCall.args).to.eql([node, .3]);
    });

    it('should pass arguments directly to setAmount() when Hud is hidden', function() {
      const hud = new Hud;
      const game = new GameMock;
      const dom = new NodeMock;
      hud.attach(game, dom);
      const node = dom.getQueries()[0].node;
      hud.showHud();
      hud.hideHud();
      hud.setAmount(node, .5);
      hud.setAmount = sinon.spy();
      hud.setAmountInteractive(node, 1);
      expect(hud.setAmount.callCount).to.be(1);
      expect(hud.setAmount.lastCall.args).to.eql([node, 1]);
    });

    it('should call setAmount iteratively for every timer timepass event until matching', function() {
      RequestAnimationFrameMock.mock();
      const hud = new Hud;
      const timer = new Timer;
      const game = new GameMock;
      game.scene = {
        resumeSimulation: sinon.spy(),
        pauseSimulation: sinon.spy(),
        timer: timer,
      };
      const dom = new NodeMock;
      hud.attach(game, dom);
      hud.showHud();
      const node = dom.getQueries()[0].node;
      hud.setAmount(node, .5);
      hud.setAmountInteractive(node, .7);
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
      RequestAnimationFrameMock.clean();
    });
  });

  describe('when attached', function() {
    let hud, game;
    beforeEach(function() {
      hud = new Hud;
      game = new GameMock;
      hud.attach(game, new NodeMock);
      sinon.stub(hud, 'showHud');
      sinon.stub(hud, 'hideHud');
    });

    describe('and scene of type Level set', function() {
      let level;
      beforeEach(function() {
        RequestAnimationFrameMock.mock();
        level = new Level;
        game.setScene(level);
      });

      afterEach(function() {
        RequestAnimationFrameMock.clean();
      });

      describe('and EVENT_PLAYER_RESET emitted on level', function() {
        beforeEach(function() {
          level.events.trigger(level.EVENT_PLAYER_RESET);
        });

        it('shows the hud', function() {
          expect(hud.showHud.calledOnce).to.be(true);
        });
      });

      describe('and EVENT_PLAYER_DEATH emitted on level', function() {
        beforeEach(function() {
          level.events.trigger(level.EVENT_PLAYER_DEATH);
        });

        it('hides the hud', function() {
          expect(hud.hideHud.calledOnce).to.be(true);
        });
      });
    });

    describe('and scene of type Level unset', function() {
      let level;
      beforeEach(function() {
        RequestAnimationFrameMock.mock();
        level = new Level;
        game.setScene(level);
        game.unsetScene(level);
      });

      it('hides the hud', function() {
        expect(hud.hideHud.calledOnce).to.be(true);
      });
    });
  });
});
