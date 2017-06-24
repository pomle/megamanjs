const Animation = require('./Animation');
const {clamp} = require('./Math');

const UNITS = ['x','y','z'];

const Util = {
    renameFunction: function (name, fn) {
        return (new Function("return function (call) { return function " + name +
            " () { return call(this, arguments) }; };")())(Function.apply.bind(fn));
    },

    vectorTraverse: (subject, desired, speed) => {
        let distance = 0, diff, axis;
        UNITS.forEach(axis => {
            if (subject[axis] !== undefined && desired[axis] !== undefined) {
                diff = clamp(desired[axis] - subject[axis], -speed, speed);
                subject[axis] += diff;
                distance += Math.abs(subject[axis] - desired[axis]);
            }
        });
        return distance;
    },

    extend: function(child, parent, props)
    {
        child.prototype = Object.create(parent.prototype);
        child.prototype.constructor = child;

        if (props) {
            Object.keys(props).forEach(function(key) {
                child.prototype[key] = props[key];
            });
        }
    },

    string: {
        fill: function(x, n)
        {
            var s = '';
            for (;;) {
                if (n & 1) s += x;
                n >>= 1;
                if (n) x += x;
                else break;
            }
            return s;
        },
    },
}

module.exports = Util;
