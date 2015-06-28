Engine.Animation = {
    units: ['x','y','z'],

    vectorTraverse: function(subject, desired, speed)
    {
        var distance = 0;
        var diff, axis;
        for (var i in Engine.Animation.units) {
            var axis = Engine.Animation.units[i];
            if (subject[axis] && desired[axis]) {
                diff = Engine.Math.clamp(desired[axis] - subject[axis], -speed, speed);
                subject[axis] += diff;
                distance += Math.abs(subject[axis] - desired[axis]);
            }
        }
        return distance;
    }
}
