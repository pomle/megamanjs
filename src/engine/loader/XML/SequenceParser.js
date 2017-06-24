const Parser = require('./Parser');
const ActionParser = require('./ActionParser');

class SequenceParser extends Parser
{
    getSequences(sequencesNode)
    {
        const sequences = [];
        const nodes = sequencesNode.querySelectorAll(':scope > sequence');
        for (let node, i = 0; node = nodes[i]; ++i) {
            const id = this.getAttr(node, 'id');
            const sequence = this.getSequence(node);
            sequences.push({
                id,
                sequence,
            });
        }
        return sequences;
    }
    getSequence(sequenceNode)
    {
        const actionParser = new ActionParser();
        const nodes = sequenceNode.querySelectorAll('action');
        const sequence = [];
        for (let node, i = 0; node = nodes[i]; ++i) {
            const action = actionParser.getAction(node);
            sequence.push([action]);
        }
        return sequence;
    }
}

module.exports = SequenceParser;
