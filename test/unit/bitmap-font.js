const expect = require('expect.js');
const sinon = require('sinon');

const THREE = require('three');
const CanvasMock = require('../mocks/canvas-mock');
const BitmapFont = require('../../src/engine/BitmapFont');

describe('Bitmap Font', () => {
  beforeEach(() => {
    global.document = {
      createElement: CanvasMock.createElement,
    }
  });

  afterEach(() => {
    delete global.document;
  });

  describe('when instantiated', () => {
    let font, image;
    beforeEach(() => {
      image = new CanvasMock;
      image.width = 16 * 8;
      image.height = 12;
      font = new BitmapFont('ABCDEFGH', {x: 16, y: 12}, image);
    });

    it('uses image from constructor', () => {
      expect(font.image).to.be(image);
    });

    it('uses size from constructor', () => {
      expect(font.charSize).to.eql({x: 16, y: 12});
    });

    it('uses character map from constructor', () => {
      expect(font.charMap).to.be('ABCDEFGH');
    });

    it('defaults to scale 1', () => {
      expect(font.scale).to.be(1);
    });

    describe('#createText', () => {
      describe('when called with characters that are not mapped', () => {
        it('throws an exception', () => {
          expect(() => {
            font.createText('AQCS');
          }).to.throwError(err => {
            expect(err).to.be.an(Error);
            expect(err.message).to.be('Char "Q" not in map ABCDEFGH');
          });
        });
      });

      describe('when called with valid 4 character string', () => {
        let text;
        beforeEach(() => {
          text = font.createText('ABBA');
        });

        it('returns instance of BitmapFont.Text', () => {
          expect(text).to.be.a(BitmapFont.Text);
        });

        describe('BitmapFont.Text object', () => {
          it('context has been painted with correct subareas', () => {
            const context = text._texture.image.getContext('2d');
            expect(context.drawImage.callCount).to.be(4);
            expect(context.drawImage.alwaysCalledWith(image)).to.be(true);
            expect(context.drawImage.getCall(0).args).to.eql([image, 0, 0, 16, 12, 0, 0, 16, 12]);
            expect(context.drawImage.getCall(1).args).to.eql([image, 16, 0, 16, 12, 16, 0, 16, 12]);
            expect(context.drawImage.getCall(2).args).to.eql([image, 16, 0, 16, 12, 32, 0, 16, 12]);
            expect(context.drawImage.getCall(3).args).to.eql([image, 0, 0, 16, 12, 48, 0, 16, 12]);
          });

          it('size is 64 x 12', () => {
            expect(text._size).to.eql({x: 64, y: 12});
          });

          describe('texture', () => {
            it('is a Canvas', () => {
              expect(text._texture.image).to.be.a(CanvasMock);
            });

            it('has power of 2 width 64', () => {
              expect(text._texture.image.width).to.be(64)
            });

            it('has power of 2 height 16', () => {
              expect(text._texture.image.height).to.be(16)
            });
          });

          describe('UV Map', () => {
            it('crops significant area of power of 2 canvas', () => {
              expect(text._uvMap[0][0]).to.eql({x: 0, y: 1});
              expect(text._uvMap[0][1]).to.eql({x: 0, y: .25});
              expect(text._uvMap[0][2]).to.eql({x: 1, y: 1});
              expect(text._uvMap[1][0]).to.eql({x: 0, y: .25});
              expect(text._uvMap[1][1]).to.eql({x: 1, y: .25});
              expect(text._uvMap[1][2]).to.eql({x: 1, y: 1});
            });
          });

          describe('#getGeometry', () => {
            let geo;
            beforeEach(() => {
              geo = text.getGeometry();
            });

            it('returns instance of THREE.PlaneGeometry', () => {
              expect(geo).to.be.a(THREE.PlaneGeometry);
            });

            describe('Geometry', () => {
              it('has size matching text size', () => {
                expect(geo.parameters.width).to.be(64);
                expect(geo.parameters.height).to.be(12);
              });

              it('uses expected UV maps', () => {
                expect(geo.faceVertexUvs[0]).to.be(text._uvMap);
              });
            });
          });

          describe('#getMaterial', () => {
            let mat;
            beforeEach(() => {
              mat = text.getMaterial();
            });

            it('returns instance of THREE.MeshBasicMaterial', () => {
              expect(mat).to.be.a(THREE.MeshBasicMaterial);
            });

            describe('Material', () => {
              it('has transparent set to true', () => {
                expect(mat.transparent).to.be(true);
              });

              it('side is set to FrontSide', () => {
                expect(mat.side).to.be(THREE.FrontSide);
              });

              it('map is set to text texture', () => {
                expect(mat.map).to.be(text._texture);
              });
            });
          });

          describe('#createMesh', () => {
            let mesh;
            beforeEach(() => {
              sinon.stub(text, 'getGeometry', text.getGeometry);
              sinon.stub(text, 'getMaterial', text.getMaterial);
              mesh = text.createMesh();
            });

            it('returns instance of THREE.Mesh', () => {
              expect(mesh).to.be.a(THREE.Mesh);
            });

            it('calls getGeometry once', () => {
              expect(text.getGeometry.callCount).to.be(1);
            });

            it('calls getMaterial once', () => {
              expect(text.getMaterial.callCount).to.be(1);
            });
            describe('Mesh', () => {
              it('uses expected geometry', () => {
                expect(mesh.geometry).to.be(text.getGeometry.lastCall.returnValue);
              });

              it('uses expected material', () => {
                expect(mesh.material).to.be(text.getMaterial.lastCall.returnValue);
              });
            });
          });
        });
      });
    });
  });
});
