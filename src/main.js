var renderer = new THREE.WebGLRenderer();
renderer.setSize(800, 532);
document.getElementById('screen').appendChild(renderer.domElement);

var Megaman2 = function()
{
	this.engine = undefined;
	this.player = undefined;

	var gameRunningState;
	window.addEventListener('focus', function() {
		if (this.engine && gameRunningState) {
			this.engine.run();
		}
	}.bind(this));
	window.addEventListener('blur', function() {
		gameRunningState = this.engine.isRunning;
		if (this.engine && gameRunningState) {
			this.engine.pause();
		}
	}.bind(this));

	this.levelLoadTimeout = undefined;
}

Megaman2.prototype.loadLevel = function(xmlUrl)
{
	window.clearTimeout(this.levelLoadTimeout);
	this.engine.pause();
	this.engine.scene = undefined;
	Engine.scenes.Level.Util.loadFromXML(xmlUrl, function(level) {
		this.engine.scene = level;
		this.engine.scene.addPlayer(this.player.character);
		var initialCollisions = this.engine.scene.collision.detect();
		console.log("Initial collisions: %d", initialCollisions);
		this.levelLoadTimeout = window.setTimeout(this.engine.run.bind(this.engine), 200);
	}.bind(this));
}

Megaman2.Player = function()
{
	this.character = undefined;
	this.hud = undefined;
	this.input = undefined;
	this.lifes = 0;
	this.weapons = {};
}

Megaman2.Player.prototype.equipWeapon = function(code)
{
	var weapon = this.weapons[code];
	weapon.code = code;
	this.character.equipWeapon(weapon);
	this.hud.equipWeapon(weapon);
}

var game = new Megaman2();
game.engine = new Engine(renderer);

game.player = new Megaman2.Player();
game.player.hud = new Hud($('#screen'));
game.player.weapons = {
	'p': new Engine.assets.weapons.Plasma(),
	'a': new Engine.assets.weapons.AirShooter(),
	'm': new Engine.assets.weapons.MetalBlade(),
	'c': new Engine.assets.weapons.CrashBomber()
};
game.player.character = new Engine.assets.objects.characters.Megaman();
game.player.hud.equipCharacter(game.player.character);
game.player.character.invincibilityDuration = 2;
game.player.input = new Engine.Keyboard();
game.player.equipWeapon('p');

game.player.input.intermittent(65,
	function() {
		game.player.character.moveLeftStart();
	},
	function() {
		game.player.character.moveLeftEnd();
	});
game.player.input.intermittent(68,
	function() {
		game.player.character.moveRightStart();
	},
	function() {
		game.player.character.moveRightEnd();
	});

game.player.input.intermittent(80,
	function() {
		game.player.character.jumpStart();
	},
	function() {
		game.player.character.jumpEnd();
	});
game.player.input.hit(79,
	function() {
		game.player.character.fire();
	});
game.player.input.hit(89,
	function() {
		game.engine.isSimulating = !game.engine.isSimulating;
	});

game.player.input.hit(33, function() {
	equipWeapon(weaponIndex[++weaponIndex.selected]);
});
game.player.input.hit(34, function() {
	equipWeapon(weaponIndex[--weaponIndex.selected]);
});

game.loadLevel('levels/flashman/Flashman.xml');


var pendelum = function(dt)
{
	this.momentum.x = Math.sin(this.time) * 20;
	Engine.assets.Object.prototype.timeShift.call(this, dt);
}

var circle = function(dt)
{
	var speed = 100;
	//this.momentum.x = Math.sin(this.time) * speed;
	this.momentum.y = Math.cos(this.time) * speed;
	//this.momentum.x += dt * 100;
	//this.momentum.y += dt;
	Engine.assets.Object.prototype.timeShift.call(this, dt);
}
