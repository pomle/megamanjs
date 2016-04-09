var expect = require('expect.js');
var sinon = require('sinon');

var env = require('../../importer.js');
var UVCoords = env.Engine.UVCoords;

describe('UVCoords', function() {
  it('should correctly create UV coords from offsets', function() {
    var offsetX = 48;
    var offsetY = 96;
    var sizeW = 48;
    var sizeH = 48;
    var textureW = 256;
    var textureH = 256;

    var uvCoord = new Engine.UVCoords(offsetX, offsetY, sizeW, sizeH, textureW, textureH);
    expect(uvCoord).to.be.an(Array);
    expect(uvCoord[0][0].x).to.equal(0.1875);
    expect(uvCoord[0][0].y).to.equal(0.625);
    expect(uvCoord[0][1].x).to.equal(0.1875);
    expect(uvCoord[0][1].y).to.equal(0.4375);
    expect(uvCoord[0][2].x).to.equal(0.375);
    expect(uvCoord[0][2].y).to.equal(0.625);

    expect(uvCoord[1][0].x).to.equal(0.1875);
    expect(uvCoord[1][0].y).to.equal(0.4375);
    expect(uvCoord[1][1].x).to.equal(0.375);
    expect(uvCoord[1][1].y).to.equal(0.4375);
    expect(uvCoord[1][2].x).to.equal(0.375);
    expect(uvCoord[1][2].y).to.equal(0.625);
  });
});
