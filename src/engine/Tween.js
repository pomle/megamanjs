'use strict';

Engine.Tween = class Tween {
    constructor(properties, easing, duration)
    {
        this.easing = easing || Engine.Easing.linear;
        this.objects = [];
        this.origins = [];
        this.desired = properties;
        this.duration = duration || 0;
        this.progress = 0;
    }
    addObject(object)
    {
        this.objects.push(object);
        this.origins.push({});
        this.updateOrigin(this.origins.length - 1);
    }
    updateOrigin(i)
    {
        const object = this.objects[i];
        const origins = this.origins[i];
        for (let prop in this.desired) {
            origins[prop] = object[prop];
        }
    }
    updateOrigins()
    {
        for (let i = 0, l = this.objects.length; i !== l; ++i) {
            this.updateOrigin(i);
        }
    }
    updateTime(deltaTime)
    {
        let frac = undefined;
        this.progress += deltaTime;
        if (this.progress <= 0) {
            frac = 0;
        } else if (this.progress >= this.duration) {
            frac = 1;
        } else {
            frac = this.progress / this.duration;
        }
        this.updateValue(frac);
    }
    updateValue(progressFrac)
    {
        const desired = this.desired;
        const frac = this.easing(progressFrac);
        for (let i = 0, l = this.objects.length; i !== l; ++i) {
            const object = this.objects[i];
            const origin = this.origins[i];
            for (let key in desired) {
                object[key] = origin[key] + (desired[key] - origin[key]) * frac;
            }
        }
    }
}
