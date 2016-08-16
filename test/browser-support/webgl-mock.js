THREE.WebGLRenderer = function() {
  console.info('WebGLRenderer mock instantiated');
  this.domElement = document.createElement('canvas');
  this.render = function() {
    console.info('WebGLRenderer.render()');
  };
  this.setSize = function() {
    console.info('WebGLRenderer.setSize()');
  };
}
