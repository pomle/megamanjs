const UNITS = ['x','y','z'];

function clamp(value, min, max) {
    if (value > max) {
        return max;
    } else if (value < min) {
        return min;
    } else {
        return value;
    }
}

function vectorTraverse(subject, desired, speed) {
    let distance = 0, diff, axis;
    UNITS.forEach(axis => {
        if (subject[axis] !== undefined && desired[axis] !== undefined) {
            diff = clamp(desired[axis] - subject[axis], -speed, speed);
            subject[axis] += diff;
            distance += Math.abs(subject[axis] - desired[axis]);
        }
    });
    return distance;
}

module.exports = vectorTraverse;