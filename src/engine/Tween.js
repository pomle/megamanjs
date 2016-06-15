'use strict';

Engine.Tween = class Tween
{
    constructor(properties, easing = Engine.Easing.linear)
    {
        this._keys = Object.keys(properties);
        this._properties = properties;
        this._easing = easing;
        this._subjects = [];
    }
    _updateOrigin(subject)
    {
        this._keys.forEach(key => {
            subject.origin[key] = subject.object[key];
        });
    }
    addSubject(object)
    {
        const subject = {
            object,
            origin: {},
        };
        this._updateOrigin(subject);
        this._subjects.push(subject);
    }
    refresh()
    {
        this._subjects.forEach(subject => {
            this._updateOrigin(subject);
        });
    }
    update(progress)
    {
        const props = this._properties;
        const frac = this._easing(progress);
        this._subjects.forEach(subject => {
            const origin = subject.origin;
            this._keys.forEach(key => {
                subject.object[key] = origin[key] + (props[key] - origin[key]) * frac;
            });
        });
    }
}
