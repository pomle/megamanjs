Engine.Loops = {
    doFor: function(events, event) {
        return function doFor(duration, callback)
        {
            if (duration <= 0) {
                callback(0, 1);
                return Engine.SyncPromise.resolve();
            }

            let elapsed = 0;
            let progress = 0;

            const promise = new Engine.SyncPromise;

            const wrapper = (dt) => {
                elapsed += dt;
                progress = elapsed / duration;
                if (progress >= 1) {
                    progress = 1;
                    events.unbind(event, wrapper);
                }
                if (callback) {
                    callback(elapsed, progress);
                }
                if (progress === 1) {
                    promise.resolve();
                }
            };

            events.bind(event, wrapper);

            return promise;
        };
    },
    doWhile: function(events, event) {
        return function doWhile(callback)
        {
            let elapsed = 0;
            return new Promise(resolve => {
                const wrapper = (dt) => {
                    elapsed += dt;
                    if (!callback(elapsed, dt)) {
                        events.unbind(event, wrapper);
                    }
                };
                events.bind(event, wrapper);
            });
        };
    },
    waitFor: function(events, event) {
        const doFor = Engine.Loops.doFor(events, event);
        return function waitFor(seconds)
        {
            return doFor(seconds);
        }
    },
}
