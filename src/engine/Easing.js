'use strict';

Engine.Easing = {
    linear: function (t) {
        return t
    },
    easeIn: function (p) {
        return function easeInPow(t) {
            return Math.pow(t, p);
        }
    },
    easeInQuad: function (t) {
        return t*t
    },
    easeOutQuad: function (t) {
        return t*(2-t)
    },
    easeInOutQuad: function (t) {
        return t<.5 ? 2*t*t : -1+(4-2*t)*t
    },
    easeInCubic: function (t) {
        return t*t*t
    },
    easeOutCubic: function (t) {
        return (--t)*t*t+1
    },
    easeInOutCubic: function (t) {
        return t<.5 ? 4*t*t*t : (t-1)*(2*t-2)*(2*t-2)+1
    },
    easeInQuart: function (t) {
        return t*t*t*t
    },
    easeOutQuart: function (t) {
        return 1-(--t)*t*t*t
    },
    easeInOutQuart: function (t) {
        return t<.5 ? 8*t*t*t*t : 1-8*(--t)*t*t*t
    },
    easeInQuint: function (t) {
        return t*t*t*t*t
    },
    easeOutQuint: function (t) {
        return 1+(--t)*t*t*t*t
    },
    easeInOutQuint: function (t) {
        return t<.5 ? 16*t*t*t*t*t : 1+16*(--t)*t*t*t*t
    },
    easeOutElastic: function(t) {
        const f = Math.pow(2, -10 * t) * Math.sin((t - .375) * 20.93) + 1;
        return f > 1 ? 1 : f;
    },
}
