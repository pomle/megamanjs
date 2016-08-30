'use strict';

Engine.Loader.XML.ObjectParser =
class ObjectParser
extends Engine.Loader.XML.Parser
{
    constructor(loader, node)
    {
        if (!node || node.tagName !== 'objects') {
            throw new TypeError('Node not <objects>');
        }

        super(loader);

        this._node = node;

        this._animations = null;
        this._textures = null;
    }
    getObjects()
    {
        if (!this._promise) {
            this._promise =  this._parse();
        }
        return this._promise;
    }
    _createConstructor(blueprint)
    {
        if (!blueprint.textures['__default']) {
            console.warn('No default texture on blueprint', blueprint);
            //throw new Error('No default texture on blueprint');
        }

        const constructor = this.createObject(blueprint.id, blueprint.constructor, function objectConstructor() {
            if (blueprint.geometries.length) {
                this.geometry = blueprint.geometries[0].clone();
                this.material = new THREE.MeshPhongMaterial({
                    depthWrite: false,
                    map: this.textures['__default'] && this.textures['__default'].texture,
                    side: THREE.DoubleSide,
                    transparent: true,
                });
            }

            blueprint.constructor.call(this);

            this.name = blueprint.id;

            blueprint.traits.forEach(Trait => {
                this.applyTrait(new Trait);
            });

            /* Run initial update of all UV maps. */
            blueprint.animators.forEach(anim => {
                const animator = anim.clone();
                animator.addGeometry(this.geometry);
                animator.update();
                this.animators.push(animator);
            });

            blueprint.collision.forEach(coll => {
                if (coll.r) {
                    this.addCollisionZone(coll.r, coll.x, coll.y);
                } else {
                    this.addCollisionRect(coll.w, coll.h, coll.x, coll.y);
                }
            });

            blueprint.events.forEach(event => {
                this.events.bind(event.name, event.callback);
            });

            blueprint.sequences.forEach(seq => {
                this.sequencer.addSequence(seq.id, seq.sequence);
            });
        });

        constructor.prototype.animations = blueprint.animations;
        constructor.prototype.audio = blueprint.audio;
        constructor.prototype.textures = blueprint.textures;

        if (blueprint.animationRouter !== undefined) {
            constructor.prototype.routeAnimation = blueprint.animationRouter;
        }

        return constructor;
    }
    _faceCoordsToIndex(coords, segs)
    {
        let i, j, x, y, faceIndex, indices = [];
        for (i in coords.x) {
            x = coords.x[i] - 1;
            for (j in coords.y) {
                y = coords.y[j] - 1;
                /* The face index is the first of the two triangles that make up a rectangular
                   face. The Animator.UV will set the UV map to the faceIndex and faceIndex+1.
                   Since we expect to paint two triangles at every index we need to 2x the index
                   count so that we skip two faces for every index jump. */
                faceIndex = (x + (y * segs.x)) * 2;
                indices.push(faceIndex);
            }
        }
        return indices;
    }
    _getConstructor(type, source)
    {
        if (type === 'character' && Engine.objects.characters[source]) {
            return Engine.objects.characters[source];
        } else {
            return Engine.Object;
        }
    }
    _getTexture(id)
    {
        if (id) {
            if (this._textures[id]) {
                return this._textures[id];
            } else {
                console.log(this._textures);
                throw new Error('Texture "' + id + '" not defined');
            }
        } else if (this._textures['__default']) {
            return this._textures['__default'];
        } else {
            throw new Error('Default texture not defined');
        }
    }
    _parse()
    {
        return this._parseTextures().then(textures => {
            this._textures = textures;
            return this._parseAnimations();
        }).then(animations => {
            this._animations = animations;
            return this._parseObjects();
        });
    }
    _parseAnimations()
    {
        const nodes = this._node.querySelectorAll(':scope > animations > animation');

        const animations = {
            __default: undefined,
        };

        for (let i = 0, node; node = nodes[i++];) {
            const animation = this._parseAnimation(node);
            animations[animation.id || '__default'] = animation;
            if (animations['__default'] === undefined) {
                animations['__default'] = animation;
            }
        }

        return Promise.resolve(animations);
    }
    _parseAnimation(animationNode)
    {
        const textureId = animationNode.parentNode.getAttribute('texture');
        const texture = this._getTexture(textureId);

        const id = animationNode.getAttribute('id');
        const group = animationNode.getAttribute('group') || undefined;
        const animation = new Engine.Animator.Animation(id, group);
        const frameNodes = animationNode.getElementsByTagName('frame');
        let loop = [];
        for (let i = 0, frameNode; frameNode = frameNodes[i++];) {
            const offset = this.getVector2(frameNode, 'x', 'y');
            const size = this.getVector2(frameNode, 'w', 'h') ||
                         this.getVector2(frameNode.parentNode, 'w', 'h') ||
                         this.getVector2(frameNode.parentNode.parentNode, 'w', 'h');
            const uvMap = new Engine.UVCoords(offset, size, texture.size);
            const duration = this.getFloat(frameNode, 'duration') || undefined;
            animation.addFrame(uvMap, duration);

            const parent = frameNode.parentNode;
            if (parent.tagName === 'loop') {
                loop.push([uvMap, duration]);
                const next = frameNodes[i+1] && frameNodes[i+1].parentNode;
                if (parent !== next) {
                    let loopCount = parseInt(parent.getAttribute('count'), 10) || 1;
                    while (--loopCount) {
                        for (let j = 0; j < loop.length; ++j) {
                            animation.addFrame(loop[j][0], loop[j][1]);
                        }
                    }
                    loop = [];
                }
            }
        }

        return animation;
    }
    _parseFace(faceNode)
    {
        const indices = [];
        const segs = this.getVector2(faceNode.parentNode, 'w-segments', 'h-segments')
                   || new THREE.Vector2(1, 1);

        const rangeNodes = faceNode.getElementsByTagName('range');
        for (let rangeNode, i = 0; rangeNode = rangeNodes[i]; ++i) {
            const coords = {
                'x': this.getRange(rangeNode, 'x', segs.x),
                'y': this.getRange(rangeNode, 'y', segs.y),
            };
            const rangeIndices = this._faceCoordsToIndex(coords, segs);
            Array.prototype.push.apply(indices, rangeIndices);
        }

        const indexJSON = faceNode.getAttribute('index');
        if (indexJSON) {
            const jsonIndices = JSON.parse(indexJSON);
            Array.prototype.push.apply(indices, jsonIndices);
        }

        return indices;
    }
    _parseObjects()
    {
        const objectNodes = this._node.querySelectorAll(':scope > object');

        const tasks = [];
        const objects = {};
        for (let i = 0, node; node = objectNodes[i++];) {
            const id = node.getAttribute('id');
            if (objects[id]) {
                console.error(node);
                throw new Error('Object id ' + id + ' already defined');
            }
            const task = this._parseObject(node).then(blueprint => {
                return this._createConstructor(blueprint);
            }).then(constructor => {
                objects[id] = {
                    node: node,
                    constructor: constructor,
                };
            });
            tasks.push(task);
        }
        return Promise.all(tasks).then(() => {
            return objects;
        });
    }
    _parseObject(objectNode)
    {
        const type = objectNode.getAttribute('type');
        const source = objectNode.getAttribute('source');

        const constructor = this._getConstructor(type, source);
        const objectId = objectNode.getAttribute('id');

        const animations = this._animations;
        const textures = this._textures;

        const blueprint = {
            id: objectId,
            constructor: constructor,
            audio: null,
            animations: animations,
            animators: [],
            events: null,
            geometries: [],
            sequences: null,
            textures: textures,
            traits: null,
        };

        const geometryNodes = objectNode.getElementsByTagName('geometry');
        const textNodes = objectNode.getElementsByTagName('text');
        if (geometryNodes.length) {
            for (let i = 0, geometryNode; geometryNode = geometryNodes[i]; ++i) {
                const geometry = this.getGeometry(geometryNode);
                blueprint.geometries.push(geometry);

                const faceNodes = geometryNode.getElementsByTagName('face');
                for (let j = 0, faceNode; faceNode = faceNodes[j]; ++j) {
                    const animator = new Engine.Animator.UV();
                    animator.indices = [];
                    animator.offset = this.getFloat(faceNode, 'offset') || 0;

                    animator.name = faceNode.getAttribute('animation');
                    if (!animator.name) {
                        throw new Error("No default animation defined");
                    }
                    if (!animations[animator.name]) {
                        throw new Error("Animation " + animator.name + " not defined");
                    }
                    const animation = animations[animator.name];

                    animator.setAnimation(animation);

                    animator.indices = this._parseFace(faceNode);

                    if (animator.indices.length === 0) {
                        animator.indices = [j * 2];
                    }

                    animator.indices.sort(function(a, b) {
                        return a - b;
                    });

                    blueprint.animators.push(animator);
                }

                if (!blueprint.animators.length && animations['__default']) {
                    const animator = new Engine.Animator.UV();
                    animator.setAnimation(animations['__default']);
                    animator.update();
                    blueprint.animators.push(animator);
                }
            }
        } else if (textNodes.length) {
            const node = textNodes[0];
            const font = node.getAttribute('font');
            const string = node.textContent;
            const text = this.loader.resourceManager.get('font', font)(string);
            blueprint.geometries.push(text.getGeometry());
            blueprint.textures = {__default: {texture: text.getTexture()}};
        }

        return Promise.all([
            this._parseObjectAnimationRouter(objectNode).then(router => {
                if (router) {
                    blueprint.animationRouter = router;
                }
            }),
            this._parseObjectCollision(objectNode).then(collision => {
                blueprint.collision = collision;
            }),
            this._parseObjectAudio(objectNode).then(audio => {
                blueprint.audio = audio;
            }),
            this._parseObjectEvents(objectNode).then(events => {
                blueprint.events = events;
            }),
            this._parseObjectTraits(objectNode).then(traits => {
                blueprint.traits = traits;
            }),
            this._parseObjectSequences(objectNode).then(sequences => {
                blueprint.sequences = sequences;
            }),
        ]).then(() => {
            return blueprint;
        });
    }
    _parseObjectAnimationRouter(objectNode)
    {
        const node = objectNode.getElementsByTagName('animation-router')[0];
        if (node) {
            let animationRouter;
            eval(node.textContent);
            if (typeof animationRouter === "function") {
                return Promise.resolve(animationRouter);
            }
        }
        return Promise.resolve(null);
    }
    _parseObjectAudio(objectNode)
    {
        const tasks = [];
        const audioDef = {};
        const audioNodes = objectNode.querySelectorAll('audio > *');
        for (let audioNode, i = 0; audioNode = audioNodes[i++];) {
            const task = this.getAudio(audioNode)
                .then(audio => {
                    const id = this.getAttr(audioNode, 'id');
                    audioDef[id] = audio;
                });
            tasks.push(task);
        }
        return Promise.all(tasks).then(() => {
            return audioDef;
        });
    }
    _parseObjectCollision(objectNode)
    {
        const collisionZones = [];
        const collisionNode = objectNode.getElementsByTagName('collision')[0];
        if (collisionNode) {
            const collNodes = collisionNode.getElementsByTagName('*');
            for (let collNode, i = 0; collNode = collNodes[i++];) {
                const type = collNode.tagName;
                if (type === 'rect') {
                    collisionZones.push(this.getRect(collNode));
                } else if (type === 'circ') {
                    collisionZones.push({
                        x: this.getFloat(collNode, 'x') || 0,
                        y: this.getFloat(collNode, 'y') || 0,
                        r: this.getFloat(collNode, 'r'),
                    });
                } else {
                    throw new TypeError('No collision type "' + type + '"');
                }
            }
        }
        return Promise.resolve(collisionZones);
    }
    _parseObjectEvents(objectNode)
    {
        const eventsNode = objectNode.querySelector(':scope > events');
        if (eventsNode) {
            const parser = new Engine.Loader.XML.EventParser(this.loader, eventsNode);
            return parser.getEvents();
        }
        else {
            return Promise.resolve([]);
        }
    }
    _parseObjectTraits(objectNode)
    {
        const traits = [];
        const traitParser = new Engine.Loader.XML.TraitParser(this.loader);
        const traitsNode = objectNode.getElementsByTagName('traits')[0];
        if (traitsNode) {
            const traitNodes = traitsNode.getElementsByTagName('trait');
            for (let traitNode, i = 0; traitNode = traitNodes[i++];) {
                traits.push(traitParser.parseTrait(traitNode));
            }
        }
        return Promise.resolve(traits);
    }
    _parseObjectSequences(objectNode)
    {
        const parser = new Engine.Loader.XML.SequenceParser;
        const node = objectNode.querySelector(':scope > sequences');
        if (node) {
            const sequences = parser.getSequences(node);
            return Promise.resolve(sequences);
        } else {
            return Promise.resolve([]);
        }
    }
    _parseTextures()
    {
        const nodes = this._node.querySelectorAll(':scope > textures > texture');
        const textures = {
            __default: undefined,
        };
        for (let node, i = 0; node = nodes[i++];) {
            const textureId = node.getAttribute('id') || '__default';
            textures[textureId] = {
                id: textureId,
                texture: this.getTexture(node),
                size: this.getVector2(node, 'w', 'h'),
            };
            if (textures['__default'] === undefined) {
                textures['__default'] = textures[textureId];
            }
        }
        return Promise.resolve(textures);
    }
}
