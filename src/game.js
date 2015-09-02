var Game = {
    init: function(callback, progress, base) {
        var done = callback,
            progress = progress || function() {},
            base = base || '';

        function includeScript(src, callback)
        {
            var tag = document.createElement('script');
            tag.onload = callback;
            tag.src = base + src;
            document.getElementsByTagName("head")[0].appendChild(tag);
        }

        function loadScripts(scripts)
        {
            if (scripts.length) {
                var src = scripts.shift();
                includeScript(src, function() {
                    progress((count - scripts.length) / count);
                    loadScripts(scripts);
                });
            }
            else {
                done();
            }
        }

        var scripts = [
            "engine/Engine.js",
            "engine/Util.js",
            "engine/Events.js",
            "engine/Animation.js",
            "engine/Sequencer.js",
            "engine/Keyboard.js",
            "engine/Math.js",
            "engine/Collision.js",
            "engine/Sprite.js",
            "engine/Camera.js",
            "engine/World.js",
            "engine/Object.js",
            "engine/Timeline.js",

            "engine/Animator.js",
            "engine/animator/UV.js",

            "engine/logic/Energy.js",

            "engine/Trait.js",

            "engine/UVAnimator.js",

            "engine/CanvasUtil.js",
            "engine/SpriteManager.js",
            "engine/TextureManager.js",

            "engine/AI.js",


            "game/Game.js",
            "game/Debug.js",
            "game/Hud.js",
            "game/ResourceManager.js",
            "game/Loader.js",
            "game/loader/XML.js",
            "game/loader/XML/Parser.js",
            "game/loader/XML/CharacterParser.js",
            "game/loader/XML/LevelParser.js",
            "game/loader/XML/ObjectParser.js",
            "game/Player.js",

            "game/Scene.js",
            "game/scene/Level.js",
            "game/scene/StageSelect.js",

            "game/traits/ContactDamage.js",
            "game/traits/DeathSpawn.js",
            "game/traits/Destructible.js",
            "game/traits/Disappearing.js",
            "game/traits/Fallaway.js",
            "game/traits/Health.js",
            "game/traits/Invincibility.js",
            "game/traits/Jump.js",
            "game/traits/Translating.js",
            "game/traits/Physics.js",
            "game/traits/Move.js",
            "game/traits/Climber.js",
            "game/traits/Solid.js",
            "game/traits/Climbable.js",
            "game/traits/Door.js",
            "game/traits/Stun.js",
            "game/traits/Teleport.js",
            "game/traits/Weapon.js",

            "game/object/Solid.js",
            "game/object/Climbable.js",
            "game/object/obstacle/AppearingSolid.js",
            "game/object/obstacle/DestructibleWall.js",
            "game/object/obstacle/DeathZone.js",
            "game/object/Character.js",
            "game/object/Item.js",
            "game/object/Spawner.js",
            "game/object/Weapon.js",
            "game/object/Projectile.js",

            "game/object/character/Megaman.js",
            "game/object/character/Airman.js",
            "game/object/character/Crashman.js",
            "game/object/character/Metalman.js",
            "game/object/character/Flashman.js",
            "game/object/character/Heatman.js",

            "game/object/enemy/Telly.js",
            "game/object/enemy/Shotman.js",
            "game/object/enemy/SniperArmor.js",
            "game/object/enemy/SniperJoe.js",

            "game/object/item/ExtraLife.js",
            "game/object/item/EnergyTank.js",
            "game/object/item/EnergyCapsule.js",
            "game/object/item/WeaponTank.js",

            "game/object/weapon/AirShooter.js",
            "game/object/weapon/CrashBomber.js",
            "game/object/weapon/EnemyPlasma.js",
            "game/object/weapon/MetalBlade.js",
            "game/object/weapon/TimeStopper.js",
            "game/object/weapon/Plasma.js",

            "game/object/projectile/AirShot.js",
            "game/object/projectile/CrashBomb.js",
            "game/object/projectile/EnemyPlasma.js",
            "game/object/projectile/MetalBlade.js",
            "game/object/projectile/Plasma.js",
            "game/object/projectile/SillyShot.js",

            "game/object/Decoration.js",
            "game/object/decoration/Explosion.js",
            "game/object/decoration/TinyExplosion.js",
            "game/object/decoration/Sweat.js",
        ];

        var count = scripts.length;

        loadScripts(scripts);
    }
}
