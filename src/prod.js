$(function() {
    var game = Game.Loader.XML.createFromXML('resource/Megaman2.xml', function() {
        game.attachToElement(document.getElementById('screen'));
    });

    var gameElement = document.getElementById('game');

    function on_fullscreen_change() {
        if(document.mozFullScreen || document.webkitIsFullScreen) {
            $(gameElement).addClass('fullscreen');
        }
        else {
            $(gameElement).removeClass('fullscreen');
        }

        game.adjustAspectRatio();
    }

    window.addEventListener('resize', on_fullscreen_change);
    document.addEventListener('mozfullscreenchange', on_fullscreen_change);
    document.addEventListener('webkitfullscreenchange', on_fullscreen_change);

    $('button.fullscreen').on('click', function() {
        gameElement.webkitRequestFullScreen();
    });

    window.game = game;
});
