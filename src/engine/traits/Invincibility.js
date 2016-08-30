Engine.traits.Invincibility =
class Invincibility extends Engine.Trait
{
    constructor()
    {
        super();
        this.NAME = 'invincibility';

        this._engaged = false;
        this._elapsed = 0;
        this._visibilityBlinkInterval = 1/60;

        this.duration = .5;

        const onHurt = () => {
            this.engage();
        };

        this.__requires(Engine.traits.Health);

        this.events.bind(this.EVENT_ATTACHED, host => {
            host.events.bind(host.health.EVENT_HURT, onHurt);
        });

        this.events.bind(this.EVENT_DETACHED, host => {
            host.events.unbind(host.health.EVENT_HURT, onHurt);
        });
    }
    __timeshift(deltaTime)
    {
        if (this._engaged) {
            this._host.model.visible = this._elapsed % (this._visibilityBlinkInterval * 2) > this._visibilityBlinkInterval;
            if (this._elapsed >= this.duration) {
                this.disengage();
            } else {
                this._elapsed += deltaTime;
            }
        }
    }
    disengage()
    {
        this._host.health.immune = false;
        this._host.model.visible = true;
        this._engaged = false;
    }
    engage()
    {
        if (this.duration !== 0) {
            this._host.health.immune = true;
            this._elapsed = 0;
            this._engaged = true;
        }
    }
    reset()
    {
        this.disengage();
    }
}
