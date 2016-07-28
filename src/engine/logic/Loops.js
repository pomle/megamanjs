Engine.Loops = {
    doFor: function(events, event) {
        return function doFor(duration, callback)
        {
            if (duration <= 0) {
                if (callback) {
                    callback(0, 1);
                }
                return Promise.resolve();
            }

            let elapsed = 0;
            let progress = 0;
            return new Promise(resolve => {
                function doForWrapper(dt, total, tick) {
                    elapsed += dt;
                    progress = elapsed / duration;
                    if (progress >= 1) {
                        progress = 1;
                        events.unbind(event, doForWrapper);
                    }
                    if (callback) {
                        callback(elapsed, progress);
                    }
                    if (progress === 1) {
                        resolve({
                            elapsed,
                            tick,
                            offset: elapsed - duration,
                            total: total,
                        });
                    }
                };
                events.bind(event, doForWrapper);
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
        const doFor = Engine.Loops.doFor(events, event);
        return function waitFor(seconds)
        {
            return doFor(seconds);
        }
    },
}
