const Level = require('./scene/Level');

class Hud
{
    constructor()
    {
        this.game = null;
        this.dom = {};

        this.fillSpeed = 1;

        this.onAmmoChanged = this.onAmmoChanged.bind(this);
        this.onHealthChanged = this.onHealthChanged.bind(this);
        this.onWeaponEquip = this.onWeaponEquip.bind(this);
        this.onSceneSet = this.onSceneSet.bind(this);
        this.onSceneUnset = this.onSceneUnset.bind(this);
        this.hideHud = this.hideHud.bind(this);
        this.showHud = this.showHud.bind(this);

        this.hudVisible = false;

        this.currentWeapon = null;
    }
    attach(game, dom)
    {
        this.dom.hud = dom;
        this.dom.health = dom.querySelector('.health');
        this.dom.weapon = dom.querySelector('.weapon');
        this.dom.boss = dom.querySelector('.bossHealth');

        game.events.bind(game.EVENT_SCENE_SET, this.onSceneSet);
        game.events.bind(game.EVENT_SCENE_UNSET, this.onSceneUnset);
        this.game = game;
    }
    detach()
    {
        const game = this.game;
        game.events.unbind(game.EVENT_SCENE_SET, this.onSceneSet);
        game.events.unbind(game.EVENT_SCENE_UNSET, this.onSceneUnset);
        this.game = null;
        this.dom = {};
    }
    hideHud()
    {
        if (this.dom.hud) {
            this.hudVisible = false;
            this.dom.hud.classList.remove('visible');
        }
    }
    showHud()
    {
        if (this.dom.hud) {
            this.hudVisible = true;
            this.dom.hud.classList.add('visible');
        }
    }
    onAmmoChanged(weapon)
    {
        this.setAmountInteractive(this.dom.weapon, weapon.ammo.fraction);
    }
    onHealthChanged(health)
    {
        this.setAmountInteractive(this.dom.health, health.energy.fraction);
    }
    onSceneSet(scene)
    {
        if (scene instanceof Level) {
            scene.events.bind(scene.EVENT_PLAYER_RESET, this.showHud);
            scene.events.bind(scene.EVENT_PLAYER_DEATH, this.hideHud);
            const player = scene.player.character;
            if (player) {
                player.events.bind(player.health.EVENT_HEALTH_CHANGED, this.onHealthChanged);
                player.events.bind(player.weapon.EVENT_EQUIP, this.onWeaponEquip);
            }
        }
    }
    onSceneUnset(scene)
    {
        if (scene instanceof Level) {
            scene.events.unbind(scene.EVENT_PLAYER_RESET, this.showHud);
            scene.events.unbind(scene.EVENT_PLAYER_DEATH, this.hideHud);
            const player = scene.player.character;
            if (player) {
                player.events.unbind(player.health.EVENT_HEALTH_CHANGED, this.onHealthChanged);
                player.events.unbind(player.weapon.EVENT_EQUIP, this.onWeaponEquip);
            }
            this.hideHud();
        }
    }
    onWeaponEquip(weapon)
    {
        const e = this.dom.weapon;
        if (this.currentWeapon) {
            const currentWeapon = this.currentWeapon;
            currentWeapon.events.unbind(currentWeapon.EVENT_AMMO_CHANGED, this.onAmmoChanged);
            e.classList.remove(currentWeapon.code);
        }
        e.classList.add(weapon.code);
        this.setAmount(this.dom.weapon, weapon.ammo.fraction);
        weapon.events.bind(weapon.EVENT_AMMO_CHANGED, this.onAmmoChanged);
        this.currentWeapon = weapon;
    }
    quantify(frac)
    {
        // Quantify to whole 1/28th increments.
        const s = 1 / 28;
        let q = frac - (frac % s);
        // Do not display empty unless completely empty.
        if (q === 0 && frac > 0) {
            q = s;
        }
        return q;
    }
    setAmount(element, frac)
    {
        element.querySelector('.amount').style.height = (this.quantify(frac) * 100) + '%';
        element.dataset.value = frac.toString();
    }
    setAmountInteractive(element, frac)
    {
        /* If energy should be increasing. */
        let current = parseFloat(element.dataset.value);
        if (this.hudVisible && frac > current) {
            const scene = this.game.scene;
            const timer = scene.timer;
            const target = frac;
            const speed = this.fillSpeed;
            const iteration = dt => {
                current += speed * dt;
                if (current >= target) {
                    current = target;
                    timer.events.unbind(timer.EVENT_UPDATE, iteration);
                    scene.resumeSimulation();
                }
                this.setAmount(element, current);
            }
            scene.pauseSimulation();
            timer.events.bind(timer.EVENT_UPDATE, iteration);
        } else {
            this.setAmount(element, frac);
        }
    }
}

module.exports = Hud;

