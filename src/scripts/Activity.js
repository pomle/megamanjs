'use strict';

Megaman2.Activity =
class Activity
{
    constructor(scene)
    {
        this.EVENT_GOTO_ACTIVITY = 'goto-activity';

        this.scene = scene;
        this.events = new Engine.Events(this);
    }

    goToActivity(name) {
        this.events.trigger(this.EVENT_GOTO_ACTIVITY, [name]);
    }
}
