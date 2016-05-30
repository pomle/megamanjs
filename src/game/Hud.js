var Hud = function(game)
{
    this.fillSpeed = 1;

    this.elements = {
        'healthBar': undefined,
        'weaponBar': undefined,
        'bossHealthBar': undefined,
    }

    var player = undefined;
    var weapon = undefined;
    var boss = undefined;

    var hud = this;
    function healthChanged() {
        hud.setHealthEnergy(this.health.fraction);
    }
    function ammoChanged() {
        hud.setWeaponEnergy(this.ammo.fraction);
    }
    function bossHealthChanged() {
        hud.setBossHealthEnergy(this.health.fraction);
    }

    this.equipCharacter = function(character)
    {
        if (player) {
            player.events.unbind(player.health.EVENT_HEALTH_CHANGED, healthChanged);
        }
        player = character;
        this.setHealthEnergy(player.health.fraction);
        player.events.bind(player.health.EVENT_HEALTH_CHANGED, healthChanged);
    }

    this.equipWeapon = function(newWeapon)
    {
        var weaponBar = this.elements.weaponBar;
        if (weapon) {
            weaponBar.classList.remove(weapon.code);
        }
        weapon = newWeapon;
        weaponBar.classList.add(weapon.code);
        this.setWeaponEnergy(weapon.ammo.fraction);
        weapon.events.bind(weapon.EVENT_AMMO_CHANGED, ammoChanged);
    }

    this.equipBoss = function(character)
    {
        if (boss) {
            boss.events.unbind(boss.health.EVENT_HEALTH_CHANGED, bossHealthChanged);
        }
        boss = character;
        this.setHealthEnergy(boss.health.fraction);
        boss.events.bind(boss.health.EVENT_HEALTH_CHANGED, bossHealthChanged);
    }

    this.setHealthEnergy = function(frac)
    {
        setEnergyQuantified.call(this, this.elements.healthBar, frac);
    }

    this.setWeaponEnergy = function(frac)
    {
        setEnergyQuantified.call(this, this.elements.weaponBar, frac);
    }

    this.setBossHealthEnergy = function(frac)
    {
        setEnergyQuantified.call(this, this.elements.bossHealthBar, frac);
    }

    function quantify(frac)
    {
        // Quantify to whole 1/28th increments (full energy bar).
        var s = 1/27;
        var q = frac - (frac % s);
        if (frac > 0 && q == 0) {
            q = s;
        }
        return q;
    }

    function setAmount(element, frac)
    {
        element.querySelector('.amount').style.height = (quantify(frac) * 100) + '%';
    }

    function setEnergyQuantified(element, frac)
    {
        if (!element) {
            return;
        }

        /* If energy should be increasing. */
        if (element.dataset.value !== undefined && element.dataset.value < frac) {
            var engine = game.engine,
                simulationSpeed = engine.simulationSpeed,
                current = parseFloat(element.dataset.value),
                target = frac,
                fillSpeed = this.fillSpeed;

            function iteration(dt)
            {
                if (current === target) {
                    engine.simulationSpeed = simulationSpeed;
                    engine.events.unbind(engine.EVENT_TIMEPASS, arguments.callee);
                }
                else {
                    current += fillSpeed * dt;
                    if (current > target) {
                        current = target;
                    }
                    setAmount(element, current);
                }
            }

            engine.simulationSpeed = 0;
            engine.events.bind(engine.EVENT_TIMEPASS, iteration);
        }
        else {
            setAmount(element, frac);
        }

        element.dataset.value = frac;
    }
}
