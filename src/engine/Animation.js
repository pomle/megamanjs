Engine.Animation = {
    units: ['x','y','z'],

    vectorTraverse: (subject, desired, speed) => {
        let distance = 0, diff, axis;
        Engine.Animation.units.forEach(axis => {
            if (subject[axis] !== undefined && desired[axis] !== undefined) {
                diff = Engine.Math.clamp(desired[axis] - subject[axis], -speed, speed);
                subject[axis] += diff;
                distance += Math.abs(subject[axis] - desired[axis]);
            }
        });
        return distance;
    },
}
