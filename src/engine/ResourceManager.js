const THREE = require('three');
const Entity = require('./Object');
const Weapon = require('./object/Weapon');

class ResourceManager
{
    constructor()
    {
        /* These must be defined in order of specificity. */
        this.TYPE_MAP = {
            'weapon': Weapon,
            'object': Entity,
            'texture': THREE.Texture,
        }

        this._items = {};
    }
    _addResource(type, id, object)
    {
        if (!type) {
            throw new Error('Empty type');
        }
        if (!id) {
            throw new Error('Empty id');
        }
        if (!this._items[type]) {
            this._items[type] = {};
        }
        if (this._items[type][id]) {
            throw new Error("Object " + id + " already defined");
        }

        this._items[type][id] = object;
    }
    addAuto(id, object)
    {
        for (let type in this.TYPE_MAP) {
            const proto = this.TYPE_MAP[type].prototype;
            if (proto.isPrototypeOf(object.prototype)) {
                this._addResource(type, id, object);
                return true;
            }
        }
        throw new Error('Could not determine type from ' + object);
    }
    addAudio(id, object)
    {
        return this._addResource('audio', id, object);
    }
    addFont(id, object)
    {
        return this._addResource('font', id, object);
    }
    addObject(id, object)
    {
        return this._addResource('object', id, object);
    }
    addTexture(id, object)
    {
        return this._addResource('texture', id, object);
    }
    addWeapon(id, object)
    {
        return this._addResource('weapon', id, object);
    }
    get(type, id)
    {
        if (this._items[type] && this._items[type][id]) {
            return this._items[type][id];
        }
        throw new Error('No resource "' + id + '" of type ' + type);
    }
    has(type, id)
    {
        return this._items[type] !== undefined &&
               this._items[type][id] !== undefined;
    }
}

module.exports = ResourceManager;
