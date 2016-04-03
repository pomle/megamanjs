Game.Loader.XML.Parser.TraitParser = function(loader)
{
    Game.Loader.XML.Parser.call(this, loader);
}

Engine.Util.extend(Game.Loader.XML.Parser.TraitParser,
                   Game.Loader.XML.Parser);

Game.Loader.XML.Parser.TraitParser.prototype.createConstructor = function(blueprint) {
    var constructor = this.createObject(blueprint.name || blueprint.source, blueprint.constr, function blueprintConstructor() {
        blueprint.constr.call(this);
        blueprint.setup(this);
    });

    if (blueprint.name) {
        constructor.prototype.NAME = blueprint.name;
    }

    return constructor;
};

Game.Loader.XML.Parser.TraitParser.prototype.parseAttack = function(node, attr) {
    var attack = node.getAttribute(attr);
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
        for (var i = 0, l = attacks.length; i !== l; ++i) {
            var a = attacks[i];
            if (map[a] === undefined) {
                throw new Error('Invalid attack direction "' + a + '"');
            }
            surfaces.push(map[a]);
        }
        return surfaces;
    }
    return undefined;
};

Game.Loader.XML.Parser.TraitParser.prototype.parseTrait = function(traitNode)
{
    var source = traitNode.getAttribute('source'),
        name = traitNode.getAttribute('name'),
        constr = Game.traits[source];

    if (constr === undefined) {
        throw new Error('Trait "' + source + '" does not exist');
    }

    var blueprint = {
        constr: constr,
        source: source,
        name: name,
        setup: function() {
            console.warn('Trait has not setup defined');
        },
    };

    if (name === 'contactDamage') {
        var points = this.getFloat(traitNode, 'points');
        blueprint.setup = function(trait) {
            trait.points = points;
        };
    } else if (name === 'deathSpawn') {
        var chance = this.getFloat(traitNode, 'chance');
        blueprint.setup = function(trait) {
            trait.change = chance;
        };
    } else if (name === 'disappearing') {
        var onDuration = this.getFloat(traitNode, 'on');
        var offDuration = this.getFloat(traitNode, 'off');
        var offset = this.getFloat(traitNode, 'offset');
        blueprint.setup = function(trait) {
            trait.onDuration = onDuration;
            trait.offDuration = offDuration;
            trait.offset = offset;
        };
    } else if (name === 'door') {
        var direction = this.getVector2(traitNode.getElementsByTagName('direction')[0]);
        var oneWay = this.getBool(traitNode, 'one-way');
        blueprint.setup = function(trait) {
            trait.direction = direction;
            trait.oneWay = oneWay;
        };
    } else if (name === 'elevator') {
        var nodes = [];
        var speed = 0;
        var pathNode = traitNode.getElementsByTagName('path')[0];
        if (pathNode) {
            var speed = this.getFloat(pathNode, 'speed');
            var nodeNodes = pathNode.getElementsByTagName('node');
            if (nodeNodes) {
                for (var nodeNode, i = 0; nodeNode = nodeNodes[i++];) {
                    var node = this.getVector2(nodeNode);
                    nodes.push(node);
                }
            }
        }
        blueprint.setup = function(trait) {
            trait.speed = speed;
            nodes.forEach(function(node) {
                trait.addNode(node);
            });
        };
    } else if (name === 'fallaway') {
        var delay = this.getFloat(traitNode, 'delay');
        blueprint.setup = function(trait) {
            trait.delay = delay;
        };
    } else if (name === 'jump') {
        var duration = this.getFloat(traitNode, 'duration');
        var force = this.getVector2(traitNode, 'forward', 'force');
        blueprint.setup = function(trait) {
            trait.duration = duration;
            trait.force.copy(force);
        };
    } else if (name === 'health') {
        var max = this.getFloat(traitNode, 'max');
        blueprint.setup = function(trait) {
            trait.max = max;
        };
    } else if (name === 'invincibility') {
        var duration = this.getFloat(traitNode, 'duration');
        blueprint.setup = function(trait) {
            trait.duration = duration;
        };
    } else if (name === 'translating') {
        var func = traitNode.attr('func');
        var amplitude = this.getVector2(traitNode.getElementsByTagName('amplitude')[0]);
        var speed = this.getFloat(traitNode, 'speed');
        blueprint.setup = function(trait) {
            trait.func = func;
            trait.amplitude = amplitude;
            trait.speed = speed;
        };
    } else if (name === 'move') {
        var speed = traitNode.attr('speed');
        var acceleration = this.getFloat(traitNode, 'acceleration');
        blueprint.setup = function(trait) {
            trait.speed = speed;
            trait.acceleration = acceleration;
        };
    } else if (name === 'physics') {
        var area = this.getFloat(traitNode, 'area');
        var dragCoefficient = this.getFloat(traitNode, 'dragCoefficient');
        var mass = this.getFloat(traitNode, 'mass');
        blueprint.setup = function(trait) {
            trait.area = area;
            trait.dragCoefficient = dragCoefficient;
            trait.mass = mass;
        };
    } else if (name === 'solid') {
        var attackAccept = this.parseAttack(traitNode, 'attack');
        blueprint.setup = function(trait) {
            trait.attackAccept = attackAccept;
        };
    } else if (name === 'stun') {
        var duration = this.getFloat(traitNode, 'duration');
        var force = this.getFloat(traitNode, 'force');
        blueprint.setup = function(trait) {
            trait.duration = duration;
            trait.force = force;
        };
    } else if (name === 'weapon') {
        /*
        var emitNode = traitNode.getElementsByTagName('projectile-emit')[0];
        return {
            'ref': ref,
            'prop': {
                'projectileEmitOffset': emitNode && this.getVector2(emitNode) || new THREE.Vector2(0,0),
                'projectileEmitRadius': emitNode && this.getFloat(emitNode, 'r') || 0,
            },
            'equip': traitNode.getAttribute('equip'),
        }
        break;*/
    } else {
        var properties = {};
        for (var attr, i = 0; attr = traitNode.attributes[i++];) {
            if (attr.name === 'source' || attr.name === 'name') {
                continue;
            }
            var value = parseFloat(attr.value)
            if (!isFinite(value)) {
                value = attr.value;
            }
            properties[attr.name] = value;
        }
        blueprint.setup = function(trait) {
            for (var key in properties) {
                trait[key] = properties[key];
            }
        };
    }
    return this.createConstructor(blueprint);
}
