class Sequencer
{
    constructor()
    {
        this.step = -1;
        this.steps = [];
    }

    addStep(callback)
    {
        this.steps.push(callback);
    }

    start()
    {
        this.step = 0;
    }

    stop()
    {
        this.step = -1;
    }

    run(thisArg, args)
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
}

module.exports = Sequencer;
