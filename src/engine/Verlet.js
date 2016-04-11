Engine.Verlet = function(vec)
{
    this.components = Object.keys(vec).join('');
    this.vec = vec;
}


Engine.Verlet.prototype.integrate = function(result, add, deltaTime)
{
    var i = 0, c, com = this.components;
    while (c = com[i++]) {
        result[c] += (this.vec[c] + add[c]) * 0.5 * deltaTime;
        this.vec[c] = add[c];
    }
}

Engine.Verlet.prototype.reset = function()
{
    this.vec.set(0, 0, 0);
}
