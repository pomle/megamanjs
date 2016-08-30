'use strict';

Engine.ResourceLoader =
class ResourceLoader
{
    constructor(loader)
    {
        this.EVENT_COMPLETE = 'complete';
        this.EVENT_PROGRESS = 'progress';

        this.loader = loader;

        this.events = new Engine.Events(this);

        this.PENDING = 0;
        this.RUNNING = 1;
        this.COMPLETE = 2;

        this._tasks = [];
        this._started = 0;
        this._completed = 0;
    }
    _createTask()
    {
        const task = {
            status: this.PENDING,
            promise: null,
        };
        this._tasks.push(task);
        ++this._started;
        this.events.trigger(this.EVENT_PROGRESS, [this.progress()]);
        return task;
    }
    _completeTask(task)
    {
        task.status = this.COMPLETE;
        ++this._completed;
        this.events.trigger(this.EVENT_PROGRESS, [this.progress()]);
    }
    complete()
    {
        const tasks = this._tasks.map(task => {
            return task.promise;
        });
        this._tasks = [];
        return Promise.all(tasks).then(() => {
            this._started = 0;
            this._completed = 0;
            this.events.trigger(this.EVENT_PROGRESS, [1]);
            this.events.trigger(this.EVENT_COMPLETE);
        });
    }
    progress()
    {
        return this._completed / this._started;
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
