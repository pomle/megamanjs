Game.Loader.XML.Parser.TraitParser = function(loader)
{
    Game.Loader.XML.Parser.call(this, loader);
}

Engine.Util.extend(Game.Loader.XML.Parser.TraitParser,
                   Game.Loader.XML.Parser);

Game.Loader.XML.Parser.TraitParser.prototype.applyTrait = function(object, traitDescriptor)
{
    if (typeof traitDescriptor === 'function') {
        var trait = traitDescriptor();
        object.applyTrait(trait);
    }
    else {
        var trait = object.getTrait(traitDescriptor.ref);
        if (!trait) {
            trait = new traitDescriptor.ref();
            object.applyTrait(trait);
        }

        for (var p in traitDescriptor.prop) {
            var prop = traitDescriptor.prop[p];
            if (prop !== undefined) {
                trait[p] = prop;
            }
        }
    }
    return trait;
}

Game.Loader.XML.Parser.TraitParser.prototype.getTrait = function(traitNode)
{
    var source = traitNode.attr('source'),
        name = traitNode.attr('name'),
        parser = this,
        ref = Game.traits[source];

    var loader = this.loader;

    if (ref === undefined) {
        throw new Error('Trait "' + source + '" does not exist');
    }

    switch (name || ref.prototype.NAME) {
        case 'contactDamage':
            return {
                'ref': ref,
                'prop': {
                    'points': this.getFloat(traitNode, 'points'),
                }
            }
            break;

        case 'deathSpawn':
            return {
                'ref': ref,
                'prop': {
                    'chance': this.getFloat(traitNode, 'chance'),
                    'pool': (function() {
                        var objects = [];
                        traitNode.find('> objects > *').each(function() {
                            var type = this.tagName,
                                name = this.attributes.id.value;
                            var object = loader.resource.get(type, name);
                            if (!object) {
                                throw new Error("No resource type " + type + " named " + name);
                            }
                            objects.push(object);
                        });
                        return objects;
                    })(),
                }
            }
            break;

        case 'disappearing':
            return {
                'ref': ref,
                'prop': {
                    'onDuration': this.getFloat(traitNode, 'on'),
                    'offDuration': this.getFloat(traitNode, 'off'),
                    'offset': this.getFloat(traitNode, 'offset'),
                }
            }
            break;

        case 'door':
            return {
                'ref': ref,
                'prop': {
                    'direction': this.getVector2(traitNode.find('> direction')),
                    'oneWay': this.getBool(traitNode, 'one-way'),
                }
            }
            break;

        case 'elevator':
            var nodes = [];
            traitNode.find('> path > node').each(function() {
                var node = parser.getVector2($(this));
                nodes.push(node);
            });
            var speed = parser.getFloat(traitNode.find('> path'), 'speed');
            return function() {
                var trait = new ref();
                trait.speed = speed;
                nodes.forEach(function(node) {
                    trait.addNode(node);
                });
                return trait;
            };
            break;

        case 'fallaway':
            return {
                'ref': ref,
                'prop': {
                    'delay': this.getFloat(traitNode, 'delay'),
                }
            }
            break;

        case 'jump':
            return {
                'ref': ref,
                'prop': {
                    'duration': this.getFloat(traitNode, 'duration'),
                    'falloff': this.getFloat(traitNode, 'falloff'),
                    'force': new THREE.Vector2(this.getFloat(traitNode, 'forward'),
                                               this.getFloat(traitNode, 'force')),
                }
            }
            break;

        case 'health':
            return {
                'ref': ref,
                'prop': {
                    'max': this.getFloat(traitNode, 'max'),
                }
            }
            break;

        case 'invincibility':
            return {
                'ref': ref,
                'prop': {
                    'duration': this.getFloat(traitNode, 'duration'),
                }
            }
            break;

        case 'translating':
            return {
                'ref': ref,
                'prop': {
                    'func': traitNode.attr('func'),
                    'amplitude': this.getVector2(traitNode.find('> amplitude')),
                    'speed': this.getFloat(traitNode, 'speed'),
                }
            }
            break;

        case 'move':
            return {
                'ref': ref,
                'prop': {
                    'speed': this.getFloat(traitNode, 'speed'),
                    'acceleration': this.getFloat(traitNode, 'acceleration'),
                }
            }
            break;

        case 'physics':
            return {
                'ref': ref,
                'prop': {
                    'area': this.getFloat(traitNode, 'area'),
                    'dragCoefficient': this.getFloat(traitNode, 'drag'),
                    'mass': this.getFloat(traitNode, 'mass'),
                }
            }
            break;

        case 'solid':
            return {
                'ref': ref,
                'prop': {
                    'attackAccept': extractAttack(),
                }
            }
            break;

        case 'stun':
            return {
                'ref': ref,
                'prop': {
                    'duration': this.getFloat(traitNode, 'duration'),
                    'force': this.getFloat(traitNode, 'force'),
                }
            }
            break;

        case 'weapon':
            var emitNode = traitNode.find('> projectile-emit');
            return {
                'ref': ref,
                'prop': {
                    'projectileEmitOffset': this.getVector2(emitNode),
                    'projectileEmitRadius': this.getFloat(emitNode, 'r'),
                },
                'equip': traitNode.attr('equip'),
            }
            break;

        default:
            var def = {
                'ref': ref,
                'prop': {},
            }
            $.each(traitNode[0].attributes, function(i, attr) {
                if (attr.name === 'source') {
                    return;
                }
                var value = parseFloat(attr.value)
                if (!isFinite(value)) {
                    value = attr.value;
                }
                def.prop[attr.name] = value;
            });
            return def;
            break;
    }

    function extractAttack()
    {
        var attack = traitNode.attr('attack');
        if (attack) {
            var surfaces = [];
            var S = Game.traits.Solid.prototype;
            var map = {
                'top': S.TOP,
                'bottom': S.BOTTOM,
                'left': S.LEFT,
                'right': S.RIGHT,
            }
            attacks = attack.split(' ');
            for (var i = 0, l = attacks.length; i < l; ++i) {
                var a = attacks[i];
                if (map[a] === undefined) {
                    throw new Error('Invalid attack direction "' + a + '"');
                }
                surfaces.push(map[a]);
            }
            return surfaces;
        }
        return undefined;
    }
}

