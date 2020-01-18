const {Vector2} = require('three');
const {Weapon} = require('..');

function factory(parser, node) {
    const emitNode = node.getElementsByTagName('projectile-emit')[0];

    const offset = emitNode
        && parser.getVector2(emitNode)
        || new Vector2(0,0);

    const radius = emitNode
        && parser.getFloat(emitNode, 'r')
        || 0;

    return function createWeapon() {
        const trait = new Weapon();
        trait.projectileEmitOffset.copy(offset);
        trait.projectileEmitRadius = radius;
        return trait;
    }
}

module.exports = factory;
