const {Elevator} = require('..');

function factory(parser, node) {
    const nodes = [];
    let speed = 10;

    const pathNode = node.getElementsByTagName('path')[0];
    if (pathNode) {
        speed = parser.getFloat(pathNode, 'speed');
        const nodeNodes = pathNode.getElementsByTagName('node');
        if (nodeNodes) {
            for (let nodeNode, i = 0; nodeNode = nodeNodes[i++];) {
                const node = parser.getVector2(nodeNode);
                nodes.push(node);
            }
        }
    }

    return function createElevator() {
        const trait = new Elevator();
        trait.speed = speed;
        nodes.forEach(function(node) {
            trait.addNode(node);
        });
        return trait;
    };
}

module.exports = factory;
