'use strict';

Engine.Easing = {
    linear: () => {
        return t => t;
    },
    easeIn: (p) => {
        return t => Math.pow(t, p)
    },
    easeInQuad: () => {
        return t => t*t
    },
    easeOutQuad: () => {
        return t => t*(2-t)
    },
    easeInOutQuad: () => {
        return t => t<.5 ? 2*t*t : -1+(4-2*t)*t
    },
    easeInCubic: () => {
        return t => t*t*t
    },
    easeOutCubic: () => {
        return t => (--t)*t*t+1
    },
    easeInOutCubic: () => {
        return t => t<.5 ? 4*t*t*t : (t-1)*(2*t-2)*(2*t-2)+1
    },
    easeInQuart: () => {
        return t => t*t*t*t
    },
    easeOutQuart: () => {
        return t => 1-(--t)*t*t*t
    },
    easeInOutQuart: () => {
        return t => t<.5 ? 8*t*t*t*t : 1-8*(--t)*t*t*t
    },
    easeInQuint: () => {
        return t => t*t*t*t*t
    },
    easeOutQuint: () => {
        return t => 1+(--t)*t*t*t*t
    },
    easeInOutQuint: () => {
        return t => t<.5 ? 16*t*t*t*t*t : 1+16*(--t)*t*t*t*t
    },
    easeOutElastic: () => {
        return function(t) {
            if (t <= 0) {
                return 0;
            } else if (t >= 1) {
                return 1;
            } else {
                return Math.pow(2, -10 * t) * Math.sin((t - .375) * 20.93) + 1;
            }
        }
    },
    squareWave: (repeat = 1) => {
        const r = 1 / (repeat * 2);
        const r2 = r * 2;
        return function(t) {
            if (t < 1 && t % r2 <= r) {
                return 1;
            } else {
                return 0;
            }
        }
    },
}
