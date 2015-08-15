var game = Game.createFromXml('./game/resource/Megaman2.xml', function() {
    console.log('Loading game done', game);
    game.attachToElement(document.getElementById('screen'));
});

var dbg = new Game.Debug(game);

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


$(window).on('keydown', function(e) {
    if (e.which === 72) {
        dbg.toggleConsole();
        dbg.toggleCameraPaths();
        dbg.toggleCollisionZones();
    }
});
