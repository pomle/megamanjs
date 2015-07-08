var game = Megaman.createGame('resource/Megaman2.xml', function() {
    console.log('Loading game done', game);
    game.attachToElement(document.getElementById('screen'));
});


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
