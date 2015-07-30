Engine.Util = {
    asyncLoadXml: function(url, callback)
    {
        var baseUrl = url.split('/').slice(0, -1).join('/') + '/';
        xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = function()
        {
            if (this.readyState === 4) {
               callback($(jQuery.parseXML(this.responseText)), baseUrl);
            }
        };
        xmlhttp.overrideMimeType('text/xml');
        xmlhttp.open("GET", url, true);
        xmlhttp.send();
    },

    extend: function(child, parent)
    {
        child.prototype = Object.create(parent.prototype);
        child.constructor = parent;
    },

    mixin: function()
    {
        var subject = arguments[0];
        for (var i = 1, l = arguments.length; i < l; ++i) {
            var source = arguments[i];
            for (var prop in source.prototype) {
                if (source.prototype.hasOwnProperty(prop)) {
                    subject.prototype[prop] = source.prototype[prop];
                }
            }
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
        }
    }
}
