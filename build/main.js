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

var player2 = new Engine.assets.objects.characters.MegaMan();
player2.health = 100;
level.addPlayer(player2);

var weapon = new Engine.assets.weapons.Plasma();
player.equipWeapon(weapon);
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

keyboard.intermittent(65, player.moveLeftStart, player.moveLeftEnd);
keyboard.intermittent(68, player.moveRightStart, player.moveRightEnd);
keyboard.intermittent(96, player.jumpStart, player.jumpEnd);
keyboard.hit(110, player.fire);
