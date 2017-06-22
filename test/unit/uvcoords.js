const expect = require('expect.js');
const sinon = require('sinon');

const UVCoords = require('../../src/engine/UVCoords');

describe('UVCoords', function() {
  it('should correctly create UV coords from offsets', function() {
    const offsetX = 48;
    const offsetY = 96;
    const sizeW = 48;
    const sizeH = 48;
    const textureW = 256;
    const textureH = 256;

    const uvCoord = new UVCoords({x: offsetX, y: offsetY},
                                 {x: sizeW, y: sizeH},
                                 {x: textureW, y: textureH});
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
