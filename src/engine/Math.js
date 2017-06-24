const MathLib = {
    ALPHANUM: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
    ALPHANUM_LOWER: 'abcdefghijklmnopqrstuvwxyz0123456789',
    ALPHANUM_UPPER: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
    ALPHANUM_SAFE: 'abcdefghjkmpqrstuwxyz23456789',

    applyRatio: (ratio, start, end) => {
        return start + (end - start) * ratio;
    },
    clamp: (value, min, max) => {
        if (value > max) {
            return max;
        } else if (value < min) {
            return min;
        } else {
            return value;
        }
    },
    findRatio: (pos, low, high) => {
        return (pos - low) / (high - low);
    },
    nextPowerOf: (x, size = 2) => {
        return Math.pow(size, Math.ceil(Math.log(x) / Math.log(size)));
    },
    round: (value, digits = 0) => {
        const m = Math.pow(10, digits);
        return Math.round(value * m) / m;
    },
    randStr: (len = 6, chars = MathLib.ALPHANUM_SAFE) => {
        let id = '';
        while (len--) {
            id += chars[Math.random() * chars.length | 0];
        }
        return id;
    },
}

MathLib.Geometry = {
    circlesIntersect: (r1, r2, x1, x2, y1, y2) => {
        const dx = x2 - x1;
        const dy = y2 - y1;
        const radii = r1 + r2;
        if (dx * dx + dy * dy < radii * radii) {
            return true;
        }
        return false;
    },
    circleInRectangle: (r, x, y, a, b, w, h) => {
        const circle = {
            x: Math.abs(x - a),
            y: Math.abs(y - b),
        }

        if (circle.x > (w / 2 + r) || circle.y > (h / 2 + r)) {
            return false;
        }

        if (circle.x <= (w / 2) || circle.y <= (h / 2)) {
            return true;
        }

        const cornerDistanceSq = Math.pow(circle.x - w / 2, 2) +
                                 Math.pow(circle.y - h / 2, 2);

        if (cornerDistanceSq <= Math.pow(r, 2)) {
            return true;
        }

        return false;
    },
    convertPlaneToRectangle: (geometry) => {
        return {
            'w': Math.abs(geometry.vertices[0].x - geometry.vertices[1].x),
            'h': Math.abs(geometry.vertices[1].y - geometry.vertices[3].y),
        }
    },
    rectanglesIntersect: (x1, y1, w1, h1, x2, y2, w2, h2) => {
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

module.exports = MathLib;

