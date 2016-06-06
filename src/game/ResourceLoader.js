'use strict';

Game.ResourceLoader = class ResourceLoader
{
    constructor(loader)
    {
        this.loader = loader;

        this.PENDING = 0;
        this.RUNNING = 1;
        this.COMPLETE = 2;
        this._jobs = [];
    }
    _createJob()
    {
        const job = {
            status: this.PENDING,
            progress: 0,
            promise: null,
        };
        this._jobs.push(job);
        return job;
    }
    complete()
    {
        const jobs = this._jobs.map(job => {
            return job.promise;
        });
        return Promise.all(jobs).then(() => {
            this._jobs = [];
        });
    }
    loadAudio(url)
    {
        const job = this._createJob();
        const context = this.loader.game.audioPlayer.getContext();
        job.promise = new Promise((resolve, reject) => {
            const request = new XMLHttpRequest();
            request.open('GET', url, true);
            request.responseType = 'arraybuffer';
            request.addEventListener('load', event => {
                if (request.status === 200) {
                    context.decodeAudioData(request.response, (buffer) => {
                        job.progress = 1;
                        job.status = this.COMPLETE;
                        resolve(new Engine.Audio(buffer));
                    });
                } else {
                    reject(request.status);
                }
            });
            request.send();
        });
        return job.promise;
    }
}
