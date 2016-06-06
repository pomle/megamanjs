'use strict';

Engine.AudioPlayer = class AudioPlayer
{
    constructor()
    {
        this._context = new AudioContext();
        this._playing = [];
    }
    destroy()
    {
        this.stop();
    }
    getContext()
    {
        return this._context;
    }
    play(audio)
    {
        const source = this._context.createBufferSource();
        source.connect(this._context.destination);
        source.buffer = audio.getBuffer();
        source.addEventListener('ended', () => {
            const index = this._playing.indexOf(source);
            if (index !== -1) {
                this._playing.splice(index, 1);
            }
        });
        const loop = audio.getLoop();
        if (loop) {
            source.loopStart = loop[0];
            source.loopEnd = loop[1];
            source.loop = true;
        }
        source.start(0);
        this._playing.push(source);
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
        const playing = this._playing;
        this._playing = [];
        playing.forEach(source => {
            source.stop();
        });
    }
}
