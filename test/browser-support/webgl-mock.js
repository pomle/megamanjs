/**
 * This file overrides the renderer part of THREE.js's WebGLRenderer
 * and can be used to run THREE.js when no graphics card is available.
 *
 * Include after THREE.js and it will overwrite relevant parts of THREE.js.
 */

Engine.THREE.WebGLRenderer = function() {
  this.domElement = document.createElement('canvas');
  this.render = function() {}
  this.setSize = function() {}
}
