Engine.SyncPromise = class SyncPromise
{
    constructor()
    {
        this._chain = [];
        this._value = null;
    }
    resolve(value)
    {
        if (!this._value) {
            this._value = value;
            this._chain.forEach(callback => {
                callback(value);
            });
        }
    }
    then(callback)
    {
        if (this._value) {
            callback(this._value);
        } else {
            this._chain.push(callback);
        }
    }
}
