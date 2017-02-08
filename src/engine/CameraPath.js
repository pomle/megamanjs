const {
    Vector2,
    Vector3,
} = require('three');

class CameraPath
{
    constructor()
    {
        this.constraint = [
            new Vector3(),
            new Vector3(),
        ];
        this.window = [
            new Vector2(),
            new Vector2(),
        ];
    }
    constrain(vec)
    {
        vec.clamp(this.constraint[0], this.constraint[1]);
    }
    inWindow(vec)
    {
        return vec.x >= this.window[0].x
            && vec.x <= this.window[1].x
            && vec.y >= this.window[0].y
            && vec.y <= this.window[1].y;
    }
    setConstraint(x1, y1, x2, y2)
    {
        this.constraint[0].x = x1;
        this.constraint[0].y = y1;
        this.constraint[1].x = x2;
        this.constraint[1].y = y2;
    }
    setWindow(x1, y1, x2, y2)
    {
        this.window[0].x = x1;
        this.window[0].y = y1;
        this.window[1].x = x2;
        this.window[1].y = y2;
    }
}

module.exports = CameraPath;