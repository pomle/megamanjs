const CanvasUtil = {
    clone: function(canvas) {
        const clone = document.createElement('canvas');
        const context = clone.getContext('2d');
        clone.width = canvas.width;
        clone.height = canvas.height;
        context.drawImage(canvas, 0, 0);
        return clone;
    },
    colorReplace: function(canvas, rgbIn, rgbOut) {
        const context = canvas.getContext("2d");
        const pixels = context.getImageData(0, 0, canvas.width, canvas.height);
        const data = pixels.data;
        for (let i = 0, l = data.length; i < l; i += 4) {
            if (data[i]   === rgbIn.x &&
                data[i+1] === rgbIn.y &&
                data[i+2] === rgbIn.z) {
                data[i]   = rgbOut.x;
                data[i+1] = rgbOut.y;
                data[i+2] = rgbOut.z;
            }
        }
        context.putImageData(pixels, 0, 0);
        return canvas;
    },
    scale: function(canvas, scale) {
        const w = canvas.width * scale;
        const h = canvas.height * scale;
        const scaled = document.createElement('canvas');
        scaled.width = w;
        scaled.height = h;
        const context = scaled.getContext("2d");
        context.imageSmoothingEnabled = scale < 1;
        context.drawImage(canvas, 0, 0, w, h);
        return scaled;
    },
}

module.exports = CanvasUtil;
