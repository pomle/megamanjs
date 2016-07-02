'use strict';

Engine.PositionalAudio =
class PositionalAudio extends Engine.Audio
{
    constructor(buffer, position)
    {
        super(buffer);
        this._position = position;
    }
    getPosition()
    {
        return this._position;
    }
}
