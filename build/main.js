var renderer = new THREE.WebGLRenderer();
renderer.setSize(600, 400);
document.body.appendChild(renderer.domElement);

var Game = new Engine(renderer);
Game.timer = new Engine.Timer();

var level = new Engine.scenes.levels.Flashman();
Game.scene = level;

var player = new Engine.assets.objects.characters.MegaMan();
player.health = 100;
level.addPlayer(player);
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

Game.run();

var keyboard = new Engine.Keyboard();

keyboard.intermittent(39,
	function(event) {
		player.moveRightStart();
	},
	function(event) {
		player.moveRightEnd();
	}
);

keyboard.intermittent(37,
	function(event) {
		player.moveLeftStart();
	},
	function(event) {
		player.moveLeftEnd();
	}
);

keyboard.intermittent(32, player.jumpStart, player.jumpEnd);
