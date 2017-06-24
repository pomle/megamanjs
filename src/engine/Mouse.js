class Mouse
{
    static sluggish(callback, sluggery = 5) {
        let next = 0;
        let count = 0;
        return function handleMouseMove() {
            const now = Date.now();
            if (next < now) {
                count = 0;
                next = now + 500;
            }
            if (++count > sluggery) {
                callback();
            }
        }
    }
}

module.exports = Mouse;
