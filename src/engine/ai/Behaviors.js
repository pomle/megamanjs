Engine.behaviors = {
    lookForPlayer: function(ai, host, deltaTime) {
        if (Math.abs(this.time - this.timeAIUpdated) < 2) {
            return;
        }
        this.timeAIUpdated = this.time;

        if (this.ai.findPlayer()) {
            if (this.ai.target.position.distanceTo(this.position) > 200) {
                this.firingLoop = -1;
                return;
            }

            this.ai.faceTarget();
            if (this.firingLoop < 0) {
                this.firingLoop = 0;
            }
        }
    },
}
