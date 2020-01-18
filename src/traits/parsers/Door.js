const {Door} = require('..');

function factory(parser, node) {
    const directionNode = node.getElementsByTagName('direction')[0];
    const direction = directionNode
        ? parser.getVector2(directionNode)
        : undefined;

    const oneWay = parser.getBool(node, 'one-way');

    return function createDoor() {
        const trait = new Door();
        if (direction) {
            trait.direction.copy(direction);
        }
        trait.oneWay = oneWay;
        return trait;
    };
}

module.exports = factory;
