var renderer = new THREE.WebGLRenderer();
renderer.setSize(600, 400);
document.body.appendChild(renderer.domElement);

var Game = new Engine(renderer);
Game.timer = new Engine.Timer();

var weapons = {
	'p': new Engine.assets.weapons.Plasma(),
	'm': new Engine.assets.weapons.MetalBlade()
};

var player = new Engine.assets.objects.characters.Megaman();
player.equipWeapon(weapons['p']);

var boss = new Engine.assets.objects.characters.Metalman();
boss.equipWeapon(weapons['m']);

/*
var energyTank = new Engine.assets.objects.items.EnergyTank();
energyTank.model.position.x = 50;
energyTank.model.position.y = -40;
level.addObject(energyTank);

var energyCapsule = new Engine.assets.objects.items.EnergyCapsule();
energyCapsule.model.position.x = 80;
energyCapsule.model.position.y = -40;
level.addObject(energyCapsule);

var weaponTank = new Engine.assets.objects.items.WeaponTank();
weaponTank.model.position.x = 100;
weaponTank.model.position.y = -40;
level.addObject(weaponTank);
*/

//Game.run();

var keyboard = new Engine.Keyboard();

keyboard.intermittent(37, function() { player.moveLeftStart(); }, function() { player.moveLeftEnd(); });
keyboard.intermittent(39, function() { player.moveRightStart(); }, function() { player.moveRightEnd(); });
keyboard.intermittent(96, function() { player.jumpStart(); }, function() { player.jumpEnd(); });
keyboard.hit(110, function() { player.fire(); });

keyboard.intermittent(65, function() { boss.moveLeftStart(); }, function() { boss.moveLeftEnd(); });
keyboard.intermittent(68, function() { boss.moveRightStart(); }, function() { boss.moveRightEnd(); });
keyboard.intermittent(86, function() { boss.jumpStart(); }, function() { boss.jumpEnd(); });
keyboard.hit(67, function() { boss.fire(); });


Engine.scenes.Level.Util.loadFromXML('levels/Flashman.xml', function(level) {
	level.addPlayer(player);
	level.addObject(boss);
	Game.scene = level;
	Game.run();
});
