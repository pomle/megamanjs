var game = Game.createFromXml('./game/resource/Megaman2.xml', function() {
    console.log('Loading game done', game);
    game.attachToElement(document.getElementById('screen'));
});

var dbg = new Engine.Debug(game.engine);

var pendelum = function(dt)
{
    this.momentum.x = Math.sin(this.time) * 20;
    Engine.Object.prototype.timeShift.call(this, dt);
}

var circle = function(dt)
{
    var speed = 100;
    //this.momentum.x = Math.sin(this.time) * speed;
    this.momentum.y = Math.cos(this.time) * speed;
    //this.momentum.x += dt * 100;
    //this.momentum.y += dt;
    Engine.Object.prototype.timeShift.call(this, dt);
}

var isTouchDevice = false;

var keyBoardEvent = function(event) {
    event.stopPropagation();
    if (isTouchDevice && ["mousedown", "mouseup"].indexOf(event.type) > -1) {
        return;
    } else if (!isTouchDevice && ["touchstart", "touchend"].indexOf(event.type) > -1) {
        isTouchDevice = true;
    }

    var map = {
        "touchstart": "keydown",
        "touchend": "keyup",
        "mousedown": "keydown",
        "mouseup": "keyup",
    };
    var name = map[event.type]
    var event = document.createEvent("Event");
    event.initEvent(name, true, true);
    event.keyCode = Engine.Keyboard.prototype[this.rel];
    window.dispatchEvent(event);
}

$('#nes-controller a')
    .on('touchstart', keyBoardEvent)
    .on('touchend', keyBoardEvent)
    .on('mousedown', keyBoardEvent)
    .on('mouseup', keyBoardEvent);


var debugProps = {
    'on': false,
    'interval': undefined,
    'element': undefined,
}
$(window).on('keydown', function(e) {
    if (e.which === 72) {
        dbg.toggleCameraPaths();
        dbg.toggleCollisionZones();
        if (debugProps.on) {
            debugProps.on = false;
            debugProps.element.remove();
            clearInterval(debugProps.interval);
        }
        else {
            debugProps.on = true;
            debugProps.element = $('<div style="font-family: monospace; margin: 2px; position: absolute; left: 0; top: 0; text-align: left; white-space: pre; z-index: 100;"></div>');
            $('body').append(debugProps.element);
            debugProps.interval = setInterval(updateDiagnostics, 1000);
            updateDiagnostics();
        }
    }

});

function printVector(vec)
{
    return "X: " + vec.x + ", Y: " + vec.y + ", Z: " + vec.z;
}

function updateDiagnostics()
{
    var strings = [];

    if (game.scene) {
        strings.push("Camera Position: " + printVector(game.scene.camera.camera.position));
        for (var object of game.scene.world.objects) {
            var p = object.position;
            if (p.x === undefined || p.y === undefined || p.z === undefined) {
                console.warn("%s has undefined position %s", object.uuid, printVector(p));
            }
        }
    }
    if (game.player) {
        strings.push("Player Velocity: " + printVector(game.player.character.velocity));
        strings.push("Player Acceleration: " + printVector(game.player.character.physics.acceleration));
        strings.push("Player Position: " + printVector(game.player.character.position));
    }

    debugProps.element.html(strings.join("\n"));
}
