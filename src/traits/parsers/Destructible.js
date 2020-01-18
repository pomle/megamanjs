const {Destructible} = require('..');

function factory(parser, node) {
    const affectorObjectNodes = node.querySelectorAll('affectors > object, affectors > entity');
    const ids = parser.getArray(affectorObjectNodes, 'id');

    return function createDestructible() {
        const trait = new Destructible();
        ids.forEach(id => {
            trait.affectors.add(id);
        });
        return trait;
    };
}

module.exports = factory;
