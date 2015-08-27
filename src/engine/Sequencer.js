Engine.Sequencer = function()
{
    this.step = -1;
    this.steps = [];
}

Engine.Sequencer.prototype.addStep = function(callback)
{
    this.steps.push(callback);
}

Engine.Sequencer.prototype.run = function(thisArg, args)
{
    if (!this.steps[this.step]) {
        this.step = -1;
        return false;
    }

    if (this.steps[this.step].apply(thisArg, args)) {
        ++this.step;
    }

    return true;
}
