var renderer = new THREE.WebGLRenderer();
renderer.setSize(800, 532);
document.getElementById('screen').appendChild(renderer.domElement);

var Hud = new Hud($('#screen'));

var Game = new Engine(renderer);

var weapons = {
	'p': new Engine.assets.weapons.Plasma(),
	'm': new Engine.assets.weapons.MetalBlade(),
	'c': new Engine.assets.weapons.CrashBomb()
};

var weaponIndex = [];
weaponIndex.selected = 0;
for (var c in weapons) {
	weaponIndex.push(c);
}


var player = new Engine.assets.objects.characters.Megaman();
player.lifes = 0;
player.invincibilityDuration = 2;

var boss = new Engine.assets.objects.characters.Metalman();
boss.equipWeapon(new Engine.assets.weapons.MetalBlade());

var keyboard = new Engine.Keyboard();

function equipWeapon(code)
{
	var weapon = weapons[code];
	weapon.code = code;
	player.equipWeapon(weapon);
	Hud.equipWeapon(weapon);
}

equipWeapon('p');
Hud.equipCharacter(player);

keyboard.intermittent(65, function() { player.moveLeftStart(); }, function() { player.moveLeftEnd(); });
keyboard.intermittent(68, function() { player.moveRightStart(); }, function() { player.moveRightEnd(); });
keyboard.intermittent(80, function() { player.jumpStart(); }, function() { player.jumpEnd(); });
keyboard.hit(79, function() { player.fire(); });
keyboard.hit(89, function() {
	Game.isSimulating = !Game.isSimulating;
});

var gameRunningState;
window.addEventListener('focus', function() {
	if (gameRunningState) {
		Game.run();
	}
});
window.addEventListener('blur', function() {
	gameRunningState = Game.isRunning;
	if (gameRunningState) {
		Game.pause();
	}
});

keyboard.hit(33, function() {
	equipWeapon(weaponIndex[++weaponIndex.selected]);
});
keyboard.hit(34, function() {
	equipWeapon(weaponIndex[--weaponIndex.selected]);
});
/*
keyboard.intermittent(65, function() { boss.moveLeftStart(); }, function() { boss.moveLeftEnd(); });
keyboard.intermittent(68, function() { boss.moveRightStart(); }, function() { boss.moveRightEnd(); });
keyboard.intermittent(86, function() { boss.jumpStart(); }, function() { boss.jumpEnd(); });
keyboard.hit(67, function() { boss.fire(); });
*/


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

var pauseEvent = new Engine.assets.Event();
pauseEvent.engine = Game;
pauseEvent.addCollisionRect(100, 100);

Engine.scenes.Level.Util.loadFromXML('levels/test/Collision.xml', function(level) {
	level.addPlayer(player);
	level.gravityForce.y = 500;
	level.addObject(pauseEvent, 300, -100);
	Game.scene = level;
	//Game.scene.objects[1].timeShift = circle;
	//Game.scene.objects[2].timeShift = pendelum;
	var initialCollisions = Game.scene.collision.detect();
	console.log("Initial collisions: %d", initialCollisions);
	setTimeout(Game.run.bind(Game), 200);
});


