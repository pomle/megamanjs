'use strict';

Game.Loader.XML.Parser.EventParser =
class EventParser
extends Game.Loader.XML.Parser
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
        return this._parse();
    }
    _parse()
    {
        const events = [];
        const actionNodes = this._node.querySelectorAll(':scope > event > action');
        for (let actionNode, i = 0; actionNode = actionNodes[i++];) {
            const name = this.getAttr(actionNode.parentNode, 'name');
            const action = this._parseAction(actionNode);
            events.push({
                name: name,
                callback: action,
            });
        }
        return events;
    }
    _parseAction(node)
    {
        const conditionNodes = node.querySelectorAll(':scope > condition');
        const conditions = [];
        for (let conditionNode, j = 0; conditionNode = conditionNodes[j++];) {
            const value = this.getFloat(conditionNode, 'value') || this.getAttr(conditionNode, 'value');
            conditions.push(value);
        }

        const callback = this._resolveFunction(node);

        if (conditions.length > 0) {
            const wrapper = function() {
                for (let i = 0; i < conditions.length; ++i) {
                    if (arguments[i] != conditions[i]) {
                        return;
                    }
                }
                callback.apply(this, arguments);
            };
            return wrapper;
        }

        return callback;
    }
    _resolveFunction(node)
    {
        const type = this.getAttr(node, 'type');
        if (type === 'emit-audio') {
            const id = this.getAttr(node, 'id');
            return function() {
                this.world.emitAudio(this.audio[id]);
            };
        }

        throw new Error(`No action ${type}`);
    }
}
