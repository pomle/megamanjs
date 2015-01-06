var Game = new Engine();
var camera = new Camera();
Game.camera = camera;

var scene = new Scene();
Game.camera.scene = scene;
Game.scene = scene;
var context = document.getElementById('megaman').getContext('2d');
Game.camera.context = context;

var player = new Characters.MegaMan();
player.health = 100;
player.position.y = 20;
scene.objects.push(player);


var energyTank = new Items.EnergyTank();
energyTank.position.x = 200;
energyTank.position.y = 100;
scene.objects.push(energyTank);



Game.timer = new Timer();
Game.run();


var keyboard = new Keyboard();

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
