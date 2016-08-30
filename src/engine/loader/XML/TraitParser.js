'use strict';

Engine.Loader.XML.TraitParser =
class TraitParser
extends Engine.Loader.XML.Parser
{
    constructor(loader)
    {
        super(loader);
        this.TRAIT_MAP = {
            'attach': 'Attach',
            'climbable': 'Climbable',
            'climber': 'Climber',
            'contact-damage': 'ContactDamage',
            'conveyor': 'Conveyor',
            'death-spawn': 'DeathSpawn',
            'death-zone': 'DeathZone',
            'destructible': 'Destructible',
            'disappearing': 'Disappearing',
            'door': 'Door',
            'elevator': 'Elevator',
            'emittable': 'Emittable',
            'environment': 'Environment',
            'fallaway': 'Fallaway',
            'fixed-force': 'FixedForce',
            'glow': 'Glow',
            'headlight': 'Headlight',
            'health': 'Health',
            'invincibility': 'Invincibility',
            'jump': 'Jump',
            'lifetime': 'Lifetime',
            'light': 'Light',
            'light-control': 'LightControl',
            'move': 'Move',
            'physics': 'Physics',
            'pickupable': 'Pickupable',
            'projectile': 'Projectile',
            'rotate': 'Rotate',
            'solid': 'Solid',
            'spawn': 'Spawn',
            'stun': 'Stun',
            'teleport': 'Teleport',
            'translate': 'Translate',
            'translating': 'Translating',
            'weapon': 'Weapon',
        };
    }
    createConstructor(blueprint)
    {
        const constructor = this.createObject(blueprint.name, blueprint.constr, function blueprintConstructor() {
            const trait = new blueprint.constr;
            blueprint.setup(trait);
            return trait;
        });
        return constructor;
    }
    getConstructor(name)
    {
        const type = this.TRAIT_MAP[name];
        if (!type || !Engine.traits[type]) {
            throw new TypeError(`Trait type "${name}"" does not exist`);
        }
        return Engine.traits[type];
    }
    getSetup(node)
    {
        const name = this.getAttr(node, 'name');
        if (name === 'destructible') {
            const affectorObjectNodes = node.querySelectorAll(':scope > affectors > object');
            const ids = this.getArray(affectorObjectNodes, 'id');
            return function setup(trait) {
                ids.forEach(id => {
                    trait.affectors.add(id);
                });
            };
        } else if (name === 'door') {
            const directionNode = node.getElementsByTagName('direction')[0];
            let direction;
            if (directionNode) {
                direction = this.getVector2(directionNode);
            }
            const oneWay = this.getBool(node, 'one-way');
            return function setup(trait) {
                if (direction) {
                    trait.direction = direction;
                }
                trait.oneWay = oneWay;
            };
        } else if (name === 'elevator') {
            const nodes = [];
            let speed = 0;
            const pathNode = node.getElementsByTagName('path')[0];
            if (pathNode) {
                speed = this.getFloat(pathNode, 'speed');
                const nodeNodes = pathNode.getElementsByTagName('node');
                if (nodeNodes) {
                    for (let nodeNode, i = 0; nodeNode = nodeNodes[i++];) {
                        const node = this.getVector2(nodeNode);
                        nodes.push(node);
                    }
                }
            }
            return function setup(trait) {
                trait.speed = speed;
                nodes.forEach(function(node) {
                    trait.addNode(node);
                });
            };
        } else if (name === 'fixed-force') {
            const vec = new THREE.Vector2;
            vec.x = this.getFloat(node, 'x') || 0;
            vec.y = this.getFloat(node, 'y') || 0;
            return function setup(trait) {
                trait.force.copy(vec);
            };
        } else if (name === 'jump') {
            const duration = this.getFloat(node, 'duration');
            const force = new THREE.Vector2();
            force.x = this.getFloat(node, 'forward') || 0;
            force.y = this.getFloat(node, 'force') || 0;
            return function setup(trait) {
                if (duration) {
                    trait.duration = duration;
                }
                trait.force.copy(force);
            };
        } else if (name === 'light-control') {
            const color = this.getColor(node);
            return function setup(trait) {
                trait.color.copy(color);
            };
        } else if (name === 'health') {
            const max = this.getFloat(node, 'max');
            return function setup(trait) {
                trait.energy.max = max;
            };
        } else if (name === 'pickupable') {
            const props = {};
            const propNodes = node.getElementsByTagName('property');
            for (let propNode, i = 0; propNode = propNodes[i]; ++i) {
                const key = propNode.attributes[0].name;
                const value = propNode.attributes[0].value;
                props[key] = parseFloat(value) || value;
            }
            return function setup(trait) {
                for (let key in props) {
                    trait.properties[key] = props[key];
                }
            };
        } else if (name === 'projectile') {
            const damage = this.getFloat(node, 'damage') || 0;
            const penetrates = this.getBool(node, 'penetrates') || false;
            const range = this.getFloat(node, 'range') || 100;
            const speed = this.getFloat(node, 'speed') || 100;
            return function setup(trait) {
                trait.setDamage(damage);
                trait.setRange(range);
                trait.setSpeed(speed);
                trait.penetratingForce = penetrates;
            };
        } else if (name === 'solid') {
            const attackAccept = this.parseAttack(node, 'attack');
            const fixed = this.getBool(node, 'fixed') || false;
            const obstructs = this.getBool(node, 'obstructs') || false;
            return function setup(trait) {
                trait.fixed = fixed;
                trait.obstructs = obstructs;
                if (attackAccept) {
                    trait.attackAccept = attackAccept;
                }
            };
        } else if (name === 'spawn') {
            const itemNodes = node.getElementsByTagName('item');
            const items = [];
            for (let itemNode, i = 0; itemNode = itemNodes[i]; ++i) {
                const offsetNode = itemNode.getElementsByTagName('offset')[0];
                let offset;
                if (offsetNode) {
                    offset = this.getVector3(offsetNode) || undefined;
                }
                const event = this.getAttr(itemNode, 'event') || 'death';
                const object = this.getAttr(itemNode, 'object');
                const constr = this.loader.resourceManager.get('object', object);
                items.push([event, constr, offset]);
            }
            return function setup(trait) {
                items.forEach(function(arg) {
                    trait.addItem(arg[0], arg[1], arg[2]);
                });
            };
        } else if (name === 'translate') {
            const velocity = this.getVector2(node);
            return function setup(trait) {
                trait.velocity.copy(velocity);
            };
        } else if (name === 'weapon') {
            const emitNode = node.getElementsByTagName('projectile-emit')[0];
            const projectileEmitOffset = emitNode && this.getVector2(emitNode) || new THREE.Vector2(0,0);
            const projectileEmitRadius = emitNode && this.getFloat(emitNode, 'r') || 0;
            return function setup(trait) {
                trait.projectileEmitOffset.copy(projectileEmitOffset);
                trait.projectileEmitRadius = projectileEmitRadius;
            }
        } else {
            const properties = {};
            for (let attr, parsed, i = 0; attr = node.attributes[i++];) {
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
            return function setup(trait) {
                for (let key in properties) {
                    trait[key] = properties[key];
                }
            };
        }
    }
    parseAttack(node, attr)
    {
        const attack = node.getAttribute(attr);
        if (attack) {
            const surfaces = [];
            const SIDES = Engine.traits.Solid.SIDES;
            const map = {
                'top': SIDES.TOP,
                'bottom': SIDES.BOTTOM,
                'left': SIDES.LEFT,
                'right': SIDES.RIGHT,
            }
            const attacks = attack.split(' ');
            for (let i = 0, l = attacks.length; i !== l; ++i) {
                const a = attacks[i];
                if (map[a] === undefined) {
                    throw new Error('Invalid attack direction "' + a + '"');
                }
                surfaces.push(map[a]);
            }
            return surfaces;
        }
        return undefined;
    }
    parseTrait(node)
    {
        const name = this.getAttr(node, 'name');
        const blueprint = {
            name,
            constr: this.getConstructor(name),
            setup: this.getSetup(node),
        };
        return this.createConstructor(blueprint);
    }
}
