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
        job.promise = fetch(url)
            .then(response => {
                return response.arrayBuffer();
            })
            .then(arrayBuffer => {
                return context.decodeAudioData(arrayBuffer);
            })
            .then(buffer => {
                job.progress = 1;
                job.status = this.COMPLETE;
                return new Engine.Audio(buffer);
            });
        return job.promise;
    }
    loadImage(url)
    {
        const job = this._createJob();
        job.promise = new Promise((resolve, reject) => {
            const image = new Image();
            image.addEventListener('load', function() {
                const canvas = Engine.CanvasUtil.clone(this);
                resolve(canvas);
            });
            image.addEventListener('error', reject);
            image.src = url;
        });
        return job.promise;
    }
}
