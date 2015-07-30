Engine.traits._Energy = function(max, min)
{
    this._max = max || 100;
    this._min = min || 0;
    this._value = this._max;
}

Object.defineProperties(Engine.traits._Energy.prototype, {
    amount: {
        enumerable: true,
        get: function() {
            return this._value === undefined ? this._max : this._value;
        },
        set: function(v) {
            if (this._value === undefined) {
                return;
            }
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
    fraction: {
        enumerable: true,
        get: function() {
            if (this._value === undefined || this._max === this._min) {
                return 1;
            }
            else {
                var total = Math.abs(this._max - this._min);
                var left = Math.abs(this._value - this._min);
                return left / total;
            }
        },
    },
    finite: {
        enumerable: true,
        get: function() {
            return this._value === undefined;
        },
        set: function(v) {
            if (v === true) {
                this._value = undefined;
            }
            else {
                this._value = 0;
                this.value = this._max;
            }
        },
    },
    depleted: {
        enumerable: true,
        get: function() {
            return this._value <= this._min;
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
            this.value = this._value;
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
            this.value = this._value;
        },
    },
});
