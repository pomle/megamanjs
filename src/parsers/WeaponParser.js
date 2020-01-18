const {Vector2} = require('three');
const {Parser} = require('@snakesilk/xml-loader');
const {Objects: Weapons} = require('@snakesilk/engine');

class WeaponParser extends Parser
{
    createConstructor(blueprint)
    {
        const constructor = this.createObject(blueprint.id, blueprint.constr, function weaponConstructor() {
            const weapon = new blueprint.constr();
            weapon.id = blueprint.id;

            if (blueprint.ammo === null) {
                weapon.ammo.infinite = true;
            } else {
                weapon.ammo.max = blueprint.ammo;
            }

            weapon.code = blueprint.code;

            weapon.setCoolDown(blueprint.coolDown);
            weapon.cost = blueprint.cost;
            weapon.directions[0].copy(blueprint.directions[0]);
            weapon.directions[1].copy(blueprint.directions[1]);

            var projectiles = blueprint.projectiles;
            for (var i = 0; i < projectiles.length; ++i) {
                var projectile = projectiles[i];
                for (var j = 0; j < projectile.amount; ++j) {
                    weapon.addProjectile(new projectile.constr());
                }
            }

            return weapon;
        });

        return constructor;
    }

    parse(weaponsNode)
    {
        if (weaponsNode.tagName !== 'weapons') {
            throw new TypeError('Node not <weapons>');
        }

        const weaponNodes = weaponsNode.getElementsByTagName('weapon');
        const weapons = {};
        return Promise.all([...weaponNodes].map(weaponNode => {
            const weaponId = weaponNode.getAttribute('id');
            return this.parseWeapon(weaponNode)
            .then(Weapon => {
                weapons[weaponId] = Weapon;
            });
        }))
        .then(() => {
            return weapons;
        });
    }

    parseProjectiles(projectileNodes)
    {
        const projectiles = [];
        if (!projectileNodes) {
            return Promise.resolve([]);
        }

        return Promise.all([...projectileNodes].map(projectileNode => {
            const projectileId = projectileNode.getAttribute('id');
            const amount = this.getFloat(projectileNode, 'amount') || 1;
            return this.loader.resourceManager.get('entity', projectileId)
            .then(constr => {
                return {
                    constr,
                    amount,
                };
            });
        }));
    }

    parseWeapon(weaponNode)
    {
        var objectId = weaponNode.getAttribute('id');
        var source = weaponNode.getAttribute('source');

        const Weapon = this.loader.entities.resolve(source);
        if (!Weapon) {
            throw new Error(`Entity "${source}" not registered.`);
        }

        const weaponId = weaponNode.getAttribute('id');
        const directionNode = weaponNode.getElementsByTagName('directions')[0];
        const projectileNodes = weaponNode.getElementsByTagName('projectile');

        return this.parseProjectiles(projectileNodes)
        .then(projectiles => {
            const blueprint = {
                id: weaponId,
                constr: Weapon,
                ammo: this.getFloat(weaponNode, 'ammo') || null,
                code: this.getAttr(weaponNode, 'code'),
                coolDown: this.getFloat(weaponNode, 'cool-down') || 0,
                cost: this.getFloat(weaponNode, 'cost') || 1,
                directions: [
                    directionNode && this.getVector2(directionNode, 'x1', 'y1') || new Vector2(-1, 0),
                    directionNode && this.getVector2(directionNode, 'x2', 'y2') || new Vector2(1, 0),
                ],
                projectiles,
            };

            return this.createConstructor(blueprint);
        });
    }
}

module.exports = WeaponParser;
