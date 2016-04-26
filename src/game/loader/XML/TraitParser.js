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
    var source = traitNode.getAttribute('source');

    if (!Game.traits[source]) {
        throw new TypeError('Trait "' + source + '" not defined');
    }

    var constr = Game.traits[source];
    var name = constr.prototype.NAME;

    if (constr === undefined) {
        throw new Error('Trait "' + source + '" does not exist');
    }

    var blueprint = {
        constr: constr,
        source: source,
        name: name,
        setup: function() {
            console.warn('Trait has no setup defined', this);
        },
    };

    if (name === 'door') {
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
    } else if (name === 'jump') {
        var duration = this.getFloat(traitNode, 'duration');
        var force = new THREE.Vector2();
        force.x = this.getFloat(traitNode, 'forward') || 0;
        force.y = this.getFloat(traitNode, 'force') || 0;
        blueprint.setup = function(trait) {
            if (duration) {
                trait.duration = duration;
            }
            trait.force.copy(force);
        };
    } else if (name === 'pickupable') {
        var props = {};
        var propNodes = traitNode.getElementsByTagName('property');
        for (var propNode, i = 0; propNode = propNodes[i]; ++i) {
            var key = propNode.attributes[0].name;
            var value = propNode.attributes[0].value;
            props[key] = parseFloat(value) || value;
        }
        blueprint.setup = function(trait) {
            for (var key in props) {
                trait.properties[key] = props[key];
            }
        };
    } else if (name === 'solid') {
        var attackAccept = this.parseAttack(traitNode, 'attack');
        var fixed = this.getBool(traitNode, 'fixed') || false;
        var obstructs = this.getBool(traitNode, 'obstructs') || false;
        blueprint.setup = function(trait) {
            trait.fixed = fixed;
            trait.obstructs = obstructs;
            if (attackAccept) {
                trait.attackAccept = attackAccept;
            }
        };
    } else if (name === 'spawn') {
        var itemNodes = traitNode.getElementsByTagName('item');
        var items = [];
        for (var itemNode, i = 0; itemNode = itemNodes[i]; ++i) {
            var offsetNode = itemNode.getElementsByTagName('offset')[0];
            var offset = undefined;
            if (offsetNode) {
                offset = this.getVector3(offsetNode) || undefined;
            }
            var event = this.getAttr(itemNode, 'event') || 'death';
            var object = this.getAttr(itemNode, 'object');
            var constr = this.loader.resource.get('object', object);
            items.push([event, constr, offset]);
        }
        blueprint.setup = function(trait) {
            items.forEach(function(arg) {
                trait.addItem(arg[0], arg[1], arg[2]);
            });
        };
    } else if (name === 'translate') {
        var velocity = this.getVector2(traitNode);
        blueprint.setup = function(trait) {
            trait.velocity.copy(velocity);
        };
    } else if (name === 'weapon') {
        var emitNode = traitNode.getElementsByTagName('projectile-emit')[0];
        var projectileEmitOffset = emitNode && this.getVector2(emitNode) || new THREE.Vector2(0,0);
        var projectileEmitRadius = emitNode && this.getFloat(emitNode, 'r') || 0;
        blueprint.setup = function(trait) {
            trait.projectileEmitOffset.copy(projectileEmitOffset);
            trait.projectileEmitRadius = projectileEmitRadius;
        }
    } else {
        var properties = {};
        for (var attr, parsed, i = 0; attr = traitNode.attributes[i++];) {
            if (attr.name === 'source' || attr.name === 'name') {
                continue;
            }
            parsed = parseFloat(attr.value);
            if (isFinite(parsed)) {
                properties[attr.name] = parsed;
            } else {
                properties[attr.name] = attr.value;
            }
        }
        blueprint.setup = function(trait) {
            for (var key in properties) {
                trait[key] = properties[key];
            }
        };
    }
    return this.createConstructor(blueprint);
}
