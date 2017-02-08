class BoundingBox
{
    constructor(hostPos, size, offset)
    {
        this.position = hostPos;
        this.offset = offset;

        this.w = size.x;
        this.h = size.y;
        this.width = size.x;
        this.height = size.y;

        this._w = this.w / 2;
        this._h = this.h / 2;
    }
}

Object.defineProperties(BoundingBox.prototype, {
    x: {
        get: function() {
            return this.position.x + this.offset.x;
        },
        set: function(v) {
            this.position.x = v - this.offset.x;
        },
    },
    y: {
        get: function() {
            return this.position.y + this.offset.y;
        },
        set: function(v) {
            this.position.y = v - this.offset.y;
        },
    },
    left: {
        get: function() {
            return this.x - this._w;
        },
        set: function(v) {
            this.x = v + this._w;
        },
    },
    right: {
        get: function() {
            return this.x + this._w;
        },
        set: function(v) {
            this.x = v - this._w;
        },
    },
    top: {
        get: function() {
            return this.y + this._h;
        },
        set: function(v) {
            this.y = v - this._h;
        },
    },
    bottom: {
        get: function() {
            return this.y - this._h;
        },
        set: function(v) {
            this.y = v + this._h;
        },
    },
});

module.exports = BoundingBox;