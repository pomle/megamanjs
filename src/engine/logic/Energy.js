const Events = require('../Events');

class Energy
{
    constructor(max = 100, min = 0)
    {
        this.EVENT_CHANGE = 'change';

        this.events = new Events(this);

        this._max = max;
        this._min = min;
        this._value = max;

        this.infinite = false;
    }
    get amount()
    {
        return this._value;
    }
    set amount(value)
    {
        if (!isFinite(value)) {
            throw new TypeError('Value not a number');
        }

        const current = this._value;

        if (this.infinite === true) {
            return;
        } else if (value > this._max) {
            this._value = this._max;
        } else if (value < this._min) {
            this._value = this._min;
        } else {
            this._value = value;
        }

        if (current !== this._value) {
            this.events.trigger(this.EVENT_CHANGE);
        }
    }
    deplete()
    {
        this.amount = this._min;
    }
    get depleted()
    {
        return this._value <= this._min;
    }
    get fraction()
    {
        if (this.infinite === true || this._max === this._min) {
            return 1;
        } else {
            var total = Math.abs(this._max - this._min);
            var rest = Math.abs(this._value - this._min);
            return rest / total;
        }
    }
    fill()
    {
        this.amount = this._max;
    }
    get full()
    {
        return this._value >= this._max;
    }
    get max()
    {
        return this._max;
    }
    set max(v)
    {
        if (!isFinite(v)) {
            throw new TypeError('Value not a number');
        }

        this._max = v;
        if (this._max < this._value) {
            this.amount = this._max;
        }
    }
    get min()
    {
        return this._min;
    }
    set min(v)
    {
        if (!isFinite(v)) {
            throw new TypeError('Value not a number');
        }

        this._min = v;
        if (this._min > this._value) {
            this.amount = this._min;
        }
    }
}

module.exports = Energy;
