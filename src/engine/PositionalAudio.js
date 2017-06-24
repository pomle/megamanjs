import Audio from './Audio';

class PositionalAudio extends Audio
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

export default PositionalAudio;
