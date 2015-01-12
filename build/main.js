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
//player.equipWeapon(weapons['p']);

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

keyboard.intermittent(65, player.moveLeftStart, player.moveLeftEnd);
keyboard.intermittent(68, player.moveRightStart, player.moveRightEnd);
keyboard.intermittent(96, player.jumpStart, player.jumpEnd);
keyboard.hit(110, player.fire);

Engine.scenes.Level.Util.loadFromXML('levels/Flashman.xml', function(level) {
	level.addPlayer(player);
	Game.scene = level;
	Game.run();
});
