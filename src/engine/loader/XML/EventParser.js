const Parser = require('./Parser');
const ActionParser = require('./ActionParser');

class EventParser extends Parser
{
    constructor(loader, node)
    {
        if (node.tagName !== 'events') {
            throw new TypeError('Node not <events>');
        }

        super(loader);
        this._node = node;
        this._events = null;
    }
    getEvents()
    {
        if (!this._events) {
            this._events = this._parseEvents()
        }
        return Promise.resolve(this._events);
    }
    _parseEvents()
    {
        const events = [];
        const parser = new ActionParser();
        const actionNodes = this._node.querySelectorAll(':scope > event > action');
        for (let actionNode, i = 0; actionNode = actionNodes[i++];) {
            const name = this.getAttr(actionNode.parentNode, 'name');
            const action = parser.getAction(actionNode);
            events.push({
                name: name,
                callback: action,
            });
        }
        return events;
    }
}

module.exports = EventParser;
