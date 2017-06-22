import {Vector2} from 'three';
import Parser from './Parser';

function loadWeapon(source) {
    const constr = require('../../object/weapon/' + source);
    if (constr.default) {
        return constr.default;
    }
    return constr;
}

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

        var weaponNodes = weaponsNode.getElementsByTagName('weapon');
        var weapons = {};
        for (var weaponNode, i = 0; weaponNode = weaponNodes[i]; ++i) {
            var weaponId = weaponNode.getAttribute('id');
            var Weapon = this.parseWeapon(weaponNode);
            weapons[weaponId] = Weapon;
        }

        return weapons;
    }
    parseProjectiles(projectileNodes)
    {
        const projectiles = [];
        if (projectileNodes) {
            for (let projectileNode, i = 0; projectileNode = projectileNodes[i]; ++i) {
                let projectileId = projectileNode.getAttribute('id');
                let amount = this.getFloat(projectileNode, 'amount') || 1;
                projectiles.push({
                    constr: this.loader.resourceManager.get('object', projectileId),
                    amount: amount,
                });
            }
        }
        return projectiles;
    }
    parseWeapon(weaponNode)
    {
        var objectId = weaponNode.getAttribute('id');
        var source = weaponNode.getAttribute('source');

        const constr = loadWeapon(source);
        const weaponId = weaponNode.getAttribute('id');
        const directionNode = weaponNode.getElementsByTagName('directions')[0];
        var projectileNodes = weaponNode.getElementsByTagName('projectile');

        var blueprint = {
            id: weaponId,
            constr: constr,
            ammo: this.getFloat(weaponNode, 'ammo') || null,
            code: this.getAttr(weaponNode, 'code'),
            coolDown: this.getFloat(weaponNode, 'cool-down') || 0,
            cost: this.getFloat(weaponNode, 'cost') || 1,
            directions: [
                directionNode && this.getVector2(directionNode, 'x1', 'y1') || new Vector2(-1, 0),
                directionNode && this.getVector2(directionNode, 'x2', 'y2') || new Vector2(1, 0),
            ],
            projectiles: this.parseProjectiles(projectileNodes),
        };

        return this.createConstructor(blueprint);
    }
}

export default WeaponParser;
