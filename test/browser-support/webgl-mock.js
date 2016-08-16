THREE.WebGLRenderer = function() {
  console.debug('WebGLRenderer mock instantiated');
  this.domElement = document.createElement('canvas');
  this.render = function() {
    console.debug('WebGLRenderer.render()');
  };
  this.setSize = function() {
    console.debug('WebGLRenderer.setSize()');
  };
}
