'use strict';

Engine.CanvasUtil = {
    clone: function(oldCanvas) {
        const newCanvas = document.createElement('canvas');
        const context = newCanvas.getContext('2d');
        newCanvas.width = oldCanvas.width;
        newCanvas.height = oldCanvas.height;
        context.drawImage(oldCanvas, 0, 0);
        return newCanvas;
    },
    colorReplace: function(canvas, rgbIn, rgbOut) {
        const context = canvas.getContext("2d");
        const pixels = context.getImageData(0, 0, canvas.width, canvas.height);
        const data = pixels.data;
        for (let i = 0, l = data.length; i < l; i += 4) {
            if (data[i] === rgbIn.x
            && data[i+1] === rgbIn.y
            && data[i+2] === rgbIn.z) {
                data[i] = rgbOut.x;
                data[i+1] = rgbOut.y;
                data[i+2] = rgbOut.z;
            }
        }
        context.putImageData(pixels, 0, 0);
        return canvas;
    },
    scale: function(canvas, scale) {
        const x = canvas.width * scale;
        const y = canvas.height * scale;
        const newCanvas = document.createElement('canvas');
        newCanvas.width = x;
        newCanvas.height = y;
        const context = newCanvas.getContext("2d");
        context.imageSmoothingEnabled = scale < 1;
        context.drawImage(canvas, 0, 0, x, y);
        return newCanvas;
    }
}
