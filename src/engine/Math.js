Engine.Math = {
    applyRatio: function(ratio, h, l)
    {
        return (h - l) * ratio + l;
    },

    clamp: function(v, min, max)
    {
        return Math.min(max, Math.max(min, v));
    },

    close: function(x, x1, x2) {
        if (x1 > x2) {
            x1 += x2;
            x2 = x1 - x2;
            x1 = x1 - x2;
        }
        var val = Math.abs(x1 - x) + Math.abs(x - x2);
        val -= Math.abs(x2 - x1);
        if (val == 0) {
            val -= Math.min(x2 - x, x - x1);
        }
        return val;
    },

    findRatio: function(pos, h, l)
    {
        return (pos - l) / (h - l);
    },

    squaredDistance: function(v1, v2)
    {
        var dx = v1.x - v2.x,
            dy = v1.y - v2.y;
        return dx * dx + dy * dy;
    },
}