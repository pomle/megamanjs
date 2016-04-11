'use strict';

Game.Loader.XML.Parser.WeaponParser = function(loader) {
    Game.Loader.XML.Parser.call(this, loader);
}

Engine.Util.extend(Game.Loader.XML.Parser.WeaponParser,
                   Game.Loader.XML.Parser, {
    createConstructor: function(blueprint) {
        var constructor = this.createObject(blueprint.id, blueprint.constr, function weaponConstructor() {
            blueprint.constr.call(this);

            if (blueprint.ammo === null) {
                this.ammo.infinite = true;
            } else {
                this.ammo.max = blueprint.ammo;
            }

            this.code = blueprint.code;

            this.setCoolDown(blueprint.coolDown);
            this.cost = blueprint.cost;
            this.directions[0].copy(blueprint.directions[0]);
            this.directions[1].copy(blueprint.directions[1]);

            var projectiles = blueprint.projectiles;
            for (var i = 0; i < projectiles.length; ++i) {
                var projectile = projectiles[i];
                for (var j = 0; j < projectile.amount; ++j) {
                    this.addProjectile(new projectile.constr());
                }
            }
        });
        return constructor;
    },
    parse: function(weaponsNode) {
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
    },
    parseProjectiles: function(projectileNodes) {
        const projectiles = [];
        if (projectileNodes) {
            for (let projectileNode, i = 0; projectileNode = projectileNodes[i]; ++i) {
                let projectileId = projectileNode.getAttribute('id');
                let amount = this.getFloat(projectileNode, 'amount') || 1;
                projectiles.push({
                    constr: this.loader.resource.get('projectile', projectileId),
                    amount: amount,
                });
            }
        }
        return projectiles;
    },
    parseWeapon: function(weaponNode) {
        var objectId = weaponNode.getAttribute('id');
        var source = weaponNode.getAttribute('source');

        var constr = Game.objects.weapons[source] || Game.objects.Weapon;
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
                directionNode && this.getVector2(directionNode, 'x1', 'y1') || new THREE.Vector2(-1, 0),
                directionNode && this.getVector2(directionNode, 'x2', 'y2') || new THREE.Vector2(1, 0),
            ],
            projectiles: this.parseProjectiles(projectileNodes),
        };

        return this.createConstructor(blueprint);
    }
});

