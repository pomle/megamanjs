'use strict';

Game.ResourceLoader = class ResourceLoader
{
    constructor(loader)
    {
        this.loader = loader;

        this.PENDING = 0;
        this.RUNNING = 1;
        this.COMPLETE = 2;
        this._tasks = [];
    }
    _createTask()
    {
        const task = {
            status: this.PENDING,
            promise: null,
        };
        this._tasks.push(task);
        return task;
    }
    _completeTask(task)
    {
        task.status = this.COMPLETE;
    }
    complete()
    {
        const tasks = this._tasks.map(task => {
            return task.promise;
        });
        return Promise.all(tasks).then(() => {
            this._tasks = [];
        });
    }
    loadAudio(url)
    {
        const task = this._createTask();
        const context = this.loader.game.audioPlayer.getContext();
        task.promise = fetch(url)
            .then(response => {
                return response.arrayBuffer();
            })
            .then(arrayBuffer => {
                return context.decodeAudioData(arrayBuffer);
            })
            .then(buffer => {
                this._completeTask(task);
                return new Engine.Audio(buffer);
            });
        return task.promise;
    }
    loadImage(url)
    {
        const task = this._createTask();
        task.promise = new Promise((resolve, reject) => {
            const image = new Image();
            image.addEventListener('load', () => {
                const canvas = Engine.CanvasUtil.clone(image);
                resolve(canvas);
                this._completeTask(task);
            });
            image.addEventListener('error', reject);
            image.src = url;
        });
        return task.promise;
    }
    loadXML(url)
    {
        const task = this._createTask();
        task.promise = fetch(url)
            .then(response => {
                return response.text();
            })
            .then(text => {
                const parser = new DOMParser();
                const doc = parser.parseFromString(text, 'text/xml');
                doc.baseURL = url;
                this._completeTask(task);
                return doc;
            });
        return task.promise;
    }
}
