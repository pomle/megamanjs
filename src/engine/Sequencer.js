Engine.Sequencer = function()
{
    this.step = -1;
    this.steps = [];
}

Engine.Sequencer.prototype.addStep = function(callback)
{
    this.steps.push(callback);
}

Engine.Sequencer.prototype.start = function()
{
    this.step = 0;
}

Engine.Sequencer.prototype.stop = function()
{
    this.step = -1;
}

Engine.Sequencer.prototype.run = function(thisArg, args)
{
    if (!this.steps[this.step]) {
        this.stop();
        return false;
    }

    if (this.steps[this.step].apply(thisArg, args)) {
        ++this.step;
    }

    return true;
}
