'use strict';

Game.Loader.XML.SequenceParser =
class SequenceParser extends Game.Loader.XML.Parser
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
        const actionParser = new Game.Loader.XML.ActionParser;
        const nodes = sequenceNode.querySelectorAll('action');
        const sequence = [];
        for (let node, i = 0; node = nodes[i]; ++i) {
            const action = actionParser.getAction(node);
            sequence.push([action]);
        }
        return sequence;
    }
}
