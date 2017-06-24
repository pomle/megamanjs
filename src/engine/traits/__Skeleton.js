const Trait = require('../Trait');

class Skeleton extends Trait {
    constructor() {
        super();

        this.EVENT_NAME = 'event';

        this._private = 'private value';
        this.public = 'public value';
    }

    __attach(host)
    {
        super.__attach(host);
    }

    __detach()
    {
        super.__detach(host);
    }

    __timeshift(deltaTime)
    {
        this._host.setSomething = true;
        this._host.doSomething();
        if (this._host.setSomething === true) {
            this._trigger(this.EVENT_NAME);
        }
    }

    _private()
    {
        console.log('Private method called');
    }

    public()
    {
        console.log('Public method called');
    }
}

module.exports = Skeleton;
