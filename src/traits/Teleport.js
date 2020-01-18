const {Trait} = require('@snakesilk/engine');
const vectorTraverse = require('./helper/vectorTraverse');

class Teleport extends Trait
{
    constructor()
    {
        super();
        this.NAME = 'teleport';

        this.EVENT_DEST_REACHED = 'teleport-dest-reached';
        this.EVENT_END = 'teleport-end';
        this.EVENT_START = 'teleport-start';

        this.STATE_OFF = 'off';
        this.STATE_IN = 'in';
        this.STATE_GO = 'go';
        this.STATE_OUT = 'out';

        this._destination = null;
        this._endProgress = 0;
        this._startProgress = 0;

        this.endDuration = .15;
        this.startDuration = .15;
        this.speed = 900;
        this.state = this.STATE_OFF;
    }
    __timeshift(dt)
    {
        if (this._destination) {
            this._handle(dt);
        }
    }
    _start()
    {
        this.state = this.STATE_IN;
        this._startProgress = this.startDuration;
        const host = this._host;
        host.collidable = false;
        if (host.physics) {
            host.physics.disable();
        }
        this._trigger(this.EVENT_START);
    }
    _end()
    {
        this.state = this.STATE_OUT;
        this._endProgress = this.endDuration;
    }
    _stop()
    {
        this.state = this.STATE_OFF;
        const host = this._host;
        host.collidable = true;
        if (host.physics) {
            host.physics.enable();
        }
        if (host.jump) {
            host.jump.reset();
        }
        this._destination = null;
        this._endProgress = 0;
        this._startProgress = 0;
    }
    _handle(dt)
    {
        /* Block velocity. */
        this._host.velocity.set(0, 0);

        if (this._startProgress > 0) {
            this._startProgress -= dt;
        }
        else if (this._endProgress > 0) {
            this._endProgress -= dt;
            if (this._endProgress <= 0) {
                this._trigger(this.EVENT_END);
                this._stop();
            }
        }
        else {
            this.state = this.STATE_GO;
            const teleportDistance = vectorTraverse(
                this._host.position, this._destination, this.speed * dt);
            if (teleportDistance === 0) {
                this._trigger(this.EVENT_DEST_REACHED);
                this._end();
            }
        }
    }
    nudge(vec2)
    {
        const dest = this._host.position.clone();
        dest.x += vec2.x;
        dest.y += vec2.y;
        this.to(dest);
    }
    reset()
    {
        this._stop();
    }
    to(vec2)
    {
        this._destination = vec2;
        this._start();
    }
}

module.exports = Teleport;
