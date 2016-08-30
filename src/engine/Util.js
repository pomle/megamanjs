Engine.Util = {
    renameFunction: function (name, fn) {
        return (new Function("return function (call) { return function " + name +
            " () { return call(this, arguments) }; };")())(Function.apply.bind(fn));
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
