'use strict';

Engine.AudioManager =
class AudioManager
{
    constructor()
    {
        this._audio = new Map;
        this._player = null;
    }
    add(id, audio)
    {
        this._audio.set(id, audio);
    }
    _get(id)
    {
        const audio = this._audio.get(id);
        if (!audio) {
            throw new Error(`Audio id '${id}' not defined`);
        }
        return audio;
    }
    play(id)
    {
        const audio = this._get(id);
        this._player.play(audio);
    }
    stop(id)
    {
        const audio = this._get(id);
        this._player.stop(audio);
    }
    stopAll()
    {
        this._audio.forEach(audio => {
            this._player.stop(audio);
        });
    }
    setPlayer(player)
    {
        this._player = player;
    }
    unsetPlayer()
    {
        this._player = null;
    }
}
