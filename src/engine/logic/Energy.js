Engine.logic.Energy = function(max, min)
{
    this.EVENT_CHANGE = 'change';

    this.events = new Engine.Events(this);

    this._max = max || 100;
    this._min = min || 0;
    this._value = this._max;
}

Object.defineProperties(Engine.logic.Energy.prototype, {
    amount: {
        enumerable: true,
        get: function() {
            return this._value;
        },
        set: function(v) {
            if (this.infinite === true) {
                return;
            }
            if (v === this._value) {
                return;
            }
            if (!isFinite(v)) {
                throw new TypeError('Value not a number');
            }
            if (v > this._max) {
                this._value = this._max;
            }
            else if (v < this._min) {
                this._value = this._min;
            }
            else {
                this._value = v;
            }

            this.events.trigger(this.EVENT_CHANGE);
        },
    },
    depleted: {
        enumerable: true,
        get: function() {
            return this._value <= this._min;
        },
    },
    fraction: {
        enumerable: true,
        get: function() {
            if (this.infinite === true || this._max === this._min) {
                return 1;
            }
            else {
                var total = Math.abs(this._max - this._min);
                var rest = Math.abs(this._value - this._min);
                return rest / total;
            }
        },
    },
    full: {
        enumerable: true,
        get: function() {
            return this._value >= this._max;
        },
    },
    infinite: {
        enumerable: true,
        writable: true,
        value: false,
    },
    max: {
        enumerable: true,
        get: function() {
            return this._max;
        },
        set: function(v) {
            if (!isFinite(v)) {
                throw new TypeError('Value not a number');
            }
            this._max = v;
            if (this._max < this._value) {
                this._value = this._max;
            }
        },
    },
    min: {
        enumerable: true,
        get: function() {
            return this._min;
        },
        set: function(v) {
            if (!isFinite(v)) {
                throw new TypeError('Value not a number');
            }
            this._min = v;
            if (this._min > this._value) {
                this._value = this._min;
            }
        },
    },
});

Engine.logic.Energy.prototype.deplete = function()
{
    this.amount = this._min;
}

Engine.logic.Energy.prototype.fill = function()
{
    this.amount = this._max;
}
