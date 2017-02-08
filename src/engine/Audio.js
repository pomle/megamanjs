class Audio
{
    constructor(buffer)
    {
        this._buffer = buffer;
        this._loop = null;
    }
    getBuffer()
    {
        return this._buffer;
    }
    getLoop()
    {
        return this._loop;
    }
    setLoop(start, end)
    {
        this._loop = [start, end];
    }
}

module.exports = Audio;
