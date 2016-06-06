'use strict';

Engine.AudioPlayer = class AudioPlayer
{
    constructor()
    {
        this._context = new AudioContext();
        this._playing = new Map();
    }
    destroy()
    {
        this.stop();
    }
    getContext()
    {
        return this._context;
    }
    play(audio, overwrite = true)
    {
        if (overwrite && this._playing.has(audio)) {
            const current = this._playing.get(audio);
            current.stop();
        }

        const source = this._context.createBufferSource();
        source.connect(this._context.destination);
        source.buffer = audio.getBuffer();
        source.addEventListener('ended', () => {
            this._playing.delete(audio);
        });
        const loop = audio.getLoop();
        if (loop) {
            source.loopStart = loop[0];
            source.loopEnd = loop[1];
            source.loop = true;
        }
        source.start(0);
        this._playing.set(audio, source);

    }
    pause()
    {
        this._context.suspend();
    }
    resume()
    {
        this._context.resume();
    }
    stop()
    {
        this._playing.forEach(source => {
            source.stop();
        });
        this._playing.clear();
    }
}
