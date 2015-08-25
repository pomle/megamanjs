Engine.logic.Energy = function(max, min)
{
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
            if (!isFinite(v)) {
                throw new TypeError('Value not a number');
            }

            v = parseFloat(v);

            if (v > this._max) {
                this._value = this._max;
            }
            else if (v < this._min) {
                this._value = this._min;
            }
            else {
                this._value = v;
            }
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
            if (this._max === this._min) {
                return 1;
            }
            else {
                var total = Math.abs(this._max - this._min);
                var rest = Math.abs(this._value - this._min);
                return rest / total;
            }
        },
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

            this._max = parseFloat(v);

            /* Trigger amount setter to clamp value to new max. */
            this.amount = this._value;
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

            this._min = parseFloat(v);

            /* Trigger amount setter to clamp value to new min. */
            this.amount = this._value;
        },
    },
});

Engine.logic.Energy.prototype.deplete = function()
{
    this._value = this._min;
}

Engine.logic.Energy.prototype.fill = function()
{
    this._value = this._max;
}
