var renderer = new THREE.WebGLRenderer();
renderer.setSize(600, 400);
document.body.appendChild(renderer.domElement);

var Game = new Engine(renderer);
Game.timer = new Engine.Timer();

var level = new Engine.scenes.Level();
Game.scene = level;

var player = new Engine.assets.objects.characters.MegaMan();
player.health = 100;
player.position.y = 20;
level.addObject(player);


var energyTank = new Engine.assets.objects.items.EnergyTank();
energyTank.position.x = 200;
energyTank.position.y = 100;
level.addObject(energyTank);

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
