const expect = require('expect.js');
const sinon = require('sinon');

const THREE = require('three');
const Integrator = require('../../src/engine/Verlet');

describe('Integration', function() {
  context('when instantiating with vector', function() {
    it('should have components X, Y when vector 2-dimensional', function() {
      const integrator = new Integrator(new THREE.Vector2());
      expect(integrator.components).to.equal('xy');
    });
    it('should have components X, Y, Z when vector 3-dimensional', function() {
      const integrator = new Integrator(new THREE.Vector3());
      expect(integrator.components).to.equal('xyz');
    });
  });
  context('when integrating', function() {
    it('should integrate all components from initialization vector', function() {
      const integrator = new Integrator(new THREE.Vector3());
      const subject = new THREE.Vector3(5, 5, 5);
      integrator.integrate(subject, new THREE.Vector3(10, 11, 12), .3);
      expect(subject).to.eql({x: 6.5, y: 6.65, z: 6.8});
    });
    it('should only integrate components from initialization vector', function() {
      const integrator = new Integrator(new THREE.Vector2());
      const subject = new THREE.Vector3(5, 5, 5);
      integrator.integrate(subject, new THREE.Vector3(10, 11, 12), .3);
      expect(subject).to.eql({x: 6.5, y: 6.65, z: 5});
    });
  });
});
