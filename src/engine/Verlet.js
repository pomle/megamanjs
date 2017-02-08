class Verlet
{
    constructor(vec)
    {
        this.components = Object.keys(vec).join('');
        this.vec = vec;
    }
    integrate(result, add, deltaTime)
    {
        const com = this.components;
        for (let c, i = 0; c = com[i]; ++i) {
            result[c] += (this.vec[c] + add[c]) * 0.5 * deltaTime;
            this.vec[c] = add[c];
        }
    }
    reset()
    {
        this.vec.set(0, 0, 0);
    }
}

module.exports = Verlet;
