Engine.Loops = {
    doFor: function(events, event) {
        return function doFor(duration, callback)
        {
            if (duration <= 0) {
                callback(0, 1);
                return Promise.resolve();
            }

            let elapsed = 0;
            let progress = 0;
            return new Promise(resolve => {
                const wrapper = (dt) => {
                    elapsed += dt;
                    progress = elapsed / duration;
                    if (progress >= 1) {
                        progress = 1;
                        events.unbind(event, wrapper);
                    }
                    callback(elapsed, progress);
                    if (progress === 1) {
                        resolve();
                    }
                };
                events.bind(event, wrapper);
            });
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
        return function waitFor(seconds)
        {
            if (seconds <= 0) {
                return Promise.resolve();
            }

            let elapsed = 0;
            return new Promise(resolve => {
                const wait = (dt) => {
                    elapsed += dt;
                    if (elapsed >= seconds) {
                        events.unbind(event, wait);
                        resolve();
                    }
                };
                events.bind(event, wait);
            });
        }
    },
}
