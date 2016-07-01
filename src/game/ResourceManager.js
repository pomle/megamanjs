'use strict';

Game.ResourceManager = class ResourceManager
{
    constructor()
    {
        /* These must be defined in order of specificity. */
        this.typeMap = {
            'character': Game.objects.Character,
            'weapon': Game.objects.Weapon,
            'object': Engine.Object,
            'texture': THREE.Texture,
        }

        this.items = {};
    }
    _addResource(type, id, object)
    {
        if (!type) {
            throw new Error('Empty type');
        }
        if (!id) {
            throw new Error('Empty id');
        }
        if (!this.items[type]) {
            this.items[type] = {};
        }
        if (this.items[type][id]) {
            throw new Error("Object " + id + " already defined");
        }

        this.items[type][id] = object;
    }
    addAuto(id, object)
    {
        for (const type in this.typeMap) {
            const proto = this.typeMap[type].prototype;
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
    addCharacter(id, object)
    {
        return this._addResource('character', id, object);
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
        if (this.items[type] && this.items[type][id]) {
            return this.items[type][id];
        }
        throw new Error('No resource "' + id + '" of type ' + type);
    }
    has(type, id)
    {
        return this.items[type] !== undefined &&
               this.items[type][id] !== undefined;
    }
}
