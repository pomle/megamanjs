Engine.Math = {
    applyRatio: function(ratio, h, l) {
        return (h - l) * ratio + l;
    },
    clamp: function(v, min, max) {
        return Math.min(max, Math.max(min, v));
    },
    close: function(x, x1, x2) {
        var y = (x1 + x2) / 2;
        return Math.abs(y - x) - y;
    },
    findRatio: function(pos, h, l) {
        return (pos - l) / (h - l);
    },
    nextPowerOf: function(x, size) {
        size = size || 2;
        return Math.pow(size, Math.ceil(Math.log(x)/Math.log(size)));
    },
    squaredDistance: function(v1, v2) {
        var dx = v1.x - v2.x,
            dy = v1.y - v2.y;
        return dx * dx + dy * dy;
    },
    round: function(value, digits) {
        var m = Math.pow(10, digits || 0);
        return Math.round(value * m) / m;
    },
}

Engine.Math.Geometry = {
    circlesIntersect: function(r1, r2, x1, x2, y1, y2) {
        var dx = x2 - x1;
        var dy = y2 - y1;
        var radii = r1 + r2;
        if (dx * dx + dy * dy < radii * radii) {
            return true;
        }
        return false;
    },
    circleInRectangle: function(r, x, y, a, b, w, h) {
        var circle = {
            x: Math.abs(x - a),
            y: Math.abs(y - b),
        }

        if (circle.x > (w / 2 + r) || circle.y > (h / 2 + r)) {
            return false;
        }

        if (circle.x <= (w / 2) || circle.y <= (h / 2)) {
            return true;
        }

        var cornerDistanceSq = Math.pow(circle.x - w / 2, 2) +
                               Math.pow(circle.y - h / 2, 2);

        if (cornerDistanceSq <= Math.pow(r, 2)) {
            return true;
        }

        return false;
    },
    convertPlaneToRectangle: function(geometry) {
        return {
            'w': Math.abs(geometry.vertices[0].x - geometry.vertices[1].x),
            'h': Math.abs(geometry.vertices[1].y - geometry.vertices[3].y),
        }
    },
    rectanglesIntersect: function(x1, y1, w1, h1, x2, y2, w2, h2) {
        w1 /= 2;
        w2 /= 2;
        h1 /= 2;
        h2 /= 2;
        if (x1 + w1 > x2 - w2 && x1 - w1 < x2 + w2 &&
            y1 + h1 > y2 - h2 && y1 - h1 < y2 + h2) {
            return true;
        }
        return false;
    },
}
