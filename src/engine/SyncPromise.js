Engine.SyncPromise = class SyncPromise
{
    static resolve(value = null)
    {
        const promise = new SyncPromise();
        promise.resolve(value);
        return promise;
    }
    constructor()
    {
        this.PENDING = 0;
        this.RESOLVED = 1;

        this._chain = [];
        this._state = this.PENDING;
        this._value = null;
    }
    resolve(value)
    {
        if (this._state !== this.RESOLVED) {
            this._value = value;
            this._state = this.RESOLVED;
            this._chain.forEach(callback => {
                callback(value);
            });
        }
    }
    then(callback)
    {
        if (this._state === this.RESOLVED) {
            callback(this._value);
        } else {
            this._chain.push(callback);
        }
    }
}
