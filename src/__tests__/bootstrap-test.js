const expect = require('expect.js');

const mocks = require('@snakesilk/testing/mocks');
const {createNode} = require('@snakesilk/testing/xml');
const {createLoader} = require('../bootstrap');
const {Parser: {EntityParser}} = require('@snakesilk/xml-loader');

describe('createLoader()', () => {
    let loader;

    beforeEach(() => {
        mocks.AudioContext.mock();
        mocks.requestAnimationFrame.mock();
        mocks.THREE.WebGLRenderer.mock();

        loader = createLoader();
    });

    afterEach(() => {
        mocks.AudioContext.restore();
        mocks.requestAnimationFrame.restore();
        mocks.THREE.WebGLRenderer.restore();
    });

    [
        'Airman',
        'Crashman',
        'Flashman',
        'Heatman',
        'Megaman',
        'Metalman',

        'ChangkeyMaker',
        'Shotman',
        'SniperArmor',
        'SniperJoe',
        'Telly',
    ].forEach(name => {
        const id = name + '-id';
        const xmlString = `<entities>
             <entity type="character" source="${name}" id="${id}"/>
        </entities>`;

        describe(`when parsing ${xmlString}`, () => {
            let parser, Entity;

            beforeEach(() => {
                const node = createNode(xmlString);
                parser = new EntityParser(loader);
                return parser.getObjects(node)
                    .then(objects => {
                        Entity = objects[id].constructor;
                    });
            });

            it(`produces a ${name} entity`, () => {
              expect(Entity).to.be.a(Function);
            });

            it.skip(`produces a ${name} entity`, () => {
              expect(new Entity()).to.be.a(Objects[name]);
            });
        });
    });
});
