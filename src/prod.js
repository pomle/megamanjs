var game = Game.Loader.XML.createFromXML('resource/Megaman2.xml', function() {
    game.attachToElement(document.getElementById('screen'));
});

var gameElement = document.getElementById('game');

function onFullscreenChange() {
    if(document.mozFullScreen || document.webkitIsFullScreen) {
        gameElement.classList.add('fullscreen');
    }
    else {
        gameElement.classList.remove('fullscreen');
    }

    game.adjustAspectRatio();
}

window.addEventListener('resize', onFullscreenChange);
document.addEventListener('mozfullscreenchange', onFullscreenChange);
document.addEventListener('webkitfullscreenchange', onFullscreenChange);

document.querySelector('button.fullscreen').addEventListener('click', function() {
    gameElement.webkitRequestFullScreen();
});
