'use strict';

Game.Loader.XML.Parser.ObjectParser =
class ObjectParser
extends Game.Loader.XML.Parser
{
    createConstructor(blueprint)
    {
        if (!blueprint.textures['__default'].texture) {
            console.error(blueprint);
            throw new Error('No default texture on blueprint');
        }

        const constructor = this.createObject(blueprint.id, blueprint.constr, function blueprintConstructor() {
            this.geometry = blueprint.geometries[0].clone();
            this.material = new THREE.MeshPhongMaterial({
                depthWrite: false,
                map: blueprint.textures['__default'].texture,
                side: THREE.DoubleSide,
                transparent: true,
            });

            blueprint.constr.call(this);

            this.name = blueprint.id;

            for (const i in blueprint.traits) {
                const trait = new blueprint.traits[i]();
                this.applyTrait(trait);
            }

            /* Run initial update of all UV maps. */
            for (const i in blueprint.animators) {
                const animator = blueprint.animators[i].clone();
                animator.addGeometry(this.geometry);
                animator.update();
                this.animators.push(animator);
            }

            for (const i in blueprint.collision) {
                const r = blueprint.collision[i];
                if (r.r) {
                    this.addCollisionZone(r.r, r.x, r.y);
                } else {
                    this.addCollisionRect(r.w, r.h, r.x, r.y);
                }
            }
        });

        constructor.prototype.animations = blueprint.animations;
        constructor.prototype.textures = blueprint.textures;
        if (blueprint.animationRouter !== undefined) {
            constructor.prototype.routeAnimation = blueprint.animationRouter;
        }

        return constructor;
    }
    parse(objectsNode)
    {
        if (objectsNode.tagName !== 'objects') {
            throw new TypeError('Node not <objects>');
        }

        const texturesNode = objectsNode.getElementsByTagName('textures')[0];
        const textures = this.parseTextures(texturesNode);

        const animationsNode = objectsNode.getElementsByTagName('animations')[0];
        const animations = this.parseAnimations(animationsNode, textures);

        const objectNodes = objectsNode.getElementsByTagName('object');
        const objects = this.parseObjects(objectNodes, animations, textures);
        return objects;
    }
    parseObjects(objectNodes, animations, textures)
    {
        const objects = {};
        for (let i = 0, node; node = objectNodes[i++];) {
            const object = this.parseObject(node, animations, textures);
            const id = node.getAttribute('id');
            objects[id] = object;
        }
        return objects;
    }
    parseObject(objectNode, animations, textures)
    {
        const objectId = objectNode.getAttribute('id');
        const type = objectNode.getAttribute('type');
        const source = objectNode.getAttribute('source');

        let constr;
        if (type === 'character') {
            constr = Game.objects.characters[source] || Game.objects.Character;
        } else if (type === 'projectile') {
            constr = Game.objects.projectiles[source] || Game.objects.Projectile;
        } else {
            constr = Engine.Object;
        }

        const blueprint = {
            id: objectId,
            constr: constr,
            animations: animations,
            animators: [],
            geometries: [],
            textures: textures,
            traits: null,
        };

        const geometryNodes = objectNode.getElementsByTagName('geometry');
        if (geometryNodes.length === 0) {
            throw new Error("No <geometry> defined in " + objectNode.outerHTML);
        }

        for (let i = 0, geometryNode; geometryNode = geometryNodes[i]; ++i) {
            const geometry = this.getGeometry(geometryNode);
            blueprint.geometries.push(geometry);

            const faceNodes = geometryNode.getElementsByTagName('face');
            for (let j = 0, faceNode; faceNode = faceNodes[j]; ++j) {
                const animator = new Engine.Animator.UV();
                animator.indices = [];
                animator.offset = this.getFloat(faceNode, 'offset') || 0;

                animator.name = faceNode.getAttribute('animation');
                if (!animator.name) {
                    throw new Error("No default animation defined");
                }
                if (!animations[animator.name]) {
                    throw new Error("Animation " + animator.name + " not defined");
                }
                const animation = animations[animator.name];

                animator.setAnimation(animation);

                animator.indices = this.parseFaceIndices(faceNode);

                if (animator.indices.length === 0) {
                    animator.indices = [j * 2];
                }

                animator.indices.sort(function(a, b) {
                    return a - b;
                });

                blueprint.animators.push(animator);
            }

            if (!blueprint.animators.length) {
                const animator = new Engine.Animator.UV();
                animator.setAnimation(animations['__default']);
                animator.update();
                blueprint.animators.push(animator);
            }
        }

        blueprint.traits = this.parseTraits(objectNode);

        const animationRouterNode = objectNode.getElementsByTagName('animation-router')[0];
        if (animationRouterNode) {
            (function() {
                let animationRouter = undefined;
                eval(animationRouterNode.textContent);
                if (typeof animationRouter === "function") {
                    blueprint.animationRouter = animationRouter;
                }
            }());
        }

        blueprint.collision = this.parseCollision(objectNode);

        return this.createConstructor(blueprint);
    }
    parseAnimations(animationsNode, textures)
    {
        if (animationsNode.tagName !== 'animations') {
            throw new TypeError('Node not <animations>');
        }
        function getTexture(textureId) {
            if (textureId) {
                if (textures[textureId]) {
                    return textures[textureId];
                } else {
                    console.log(textures);
                    throw new Error('Texture "' + textureId + '" not defined');
                }
            } else if (textures['__default']) {
                return textures['__default'];
            } else {
                throw new Error('Default texture not defined');
            }
        }

        const textureId = animationsNode.getAttribute('texture');
        const texture = getTexture(textureId);

        const animationNodes = animationsNode.getElementsByTagName('animation');
        const animations = {
            __default: undefined,
        };
        for (let i = 0, node; node = animationNodes[i++];) {
            const animation = this.parseAnimation(node, texture);
            animations[animation.id || '__default'] = animation;
            if (animations['__default'] === undefined) {
                animations['__default'] = animation;
            }
        }

        return animations;
    }
    parseAnimation(animationNode, texture)
    {
        if (animationNode.tagName !== 'animation') {
            throw new TypeError('Expected <animation>, got ' + animationNode.tagName);
        }

        const id = animationNode.getAttribute('id');
        const group = animationNode.getAttribute('group') || undefined;
        const animation = new Engine.Animator.Animation(id, group);
        const frameNodes = animationNode.getElementsByTagName('frame');
        let loop = [];
        for (let i = 0, frameNode; frameNode = frameNodes[i]; ++i) {
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
    parseCollision(objectNode)
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
        return collisionZones;
    }
    parseFaceIndices(faceNode)
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
            const rangeIndices = this.faceCoordsToIndex(coords, segs);
            Array.prototype.push.apply(indices, rangeIndices);
        }

        const indexJSON = faceNode.getAttribute('index');
        if (indexJSON) {
            const jsonIndices = JSON.parse(indexJSON);
            Array.prototype.push.apply(indices, jsonIndices);
        }

        return indices;
    }
    faceCoordsToIndex(coords, segs)
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
    parseTextures(texturesNode)
    {
        const textures = {
            __default: undefined,
        };
        const textureNodes = texturesNode.getElementsByTagName('texture');
        for (let i = 0, node; node = textureNodes[i++];) {
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
        return textures;
    }
    parseTraits(objectNode)
    {
        const traits = [];
        const traitParser = new Game.Loader.XML.Parser.TraitParser(this.loader);
        const traitsNode = objectNode.getElementsByTagName('traits')[0];
        if (traitsNode) {
            const traitNodes = traitsNode.getElementsByTagName('trait');
            for (let traitNode, i = 0; traitNode = traitNodes[i++];) {
                traits.push(traitParser.parseTrait(traitNode));
            }
        }
        return traits;
    }
}
